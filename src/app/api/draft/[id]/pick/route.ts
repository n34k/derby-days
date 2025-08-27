// src/app/api/draft/[id]/pick/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../prisma";
import { isAdmin } from "@/lib/isAdmin";
import { pusher } from "@/lib/pusher/server";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    // 1) Auth
    const admin = await isAdmin();
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Parse
    const p = await params;
    const draftId = String(p.id);
    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 }
        );
    }
    const playerId: string | undefined = body?.playerId;
    if (!playerId) {
        return NextResponse.json(
            { error: "Missing playerId" },
            { status: 400 }
        );
    }

    try {
        // 3) All core mutations in one transaction
        const result = await prisma.$transaction(async (tx) => {
            const draft = await tx.draft.findUnique({ where: { id: draftId } });
            if (!draft) throw new Error("Draft not found");
            if (draft.status !== "ONGOING")
                throw new Error("Draft is not active");

            // Ensure player is still draftable
            const brother = await tx.user.findUnique({
                where: { id: playerId },
            });
            if (
                !brother ||
                brother.globalRole !== "BROTHER" ||
                brother.teamId
            ) {
                throw new Error("Player not available");
            }

            // Compute team on the clock (snake)
            const order = draft.teamOrder as unknown as string[];
            if (!Array.isArray(order) || order.length === 0) {
                throw new Error("Draft team order not set");
            }
            const T = order.length;
            const k = draft.currentPickNo; // 1-based overall pick
            const round = Math.floor((k - 1) / T) + 1;
            const i = ((k - 1) % T) + 1; // 1..T within the round
            const pickInRound = round % 2 === 0 ? T - i + 1 : i;
            const teamId = order[pickInRound - 1];

            // Create the pick (uniques on overall, (draft,user), and (draft,round,pickInRound) will guard races)
            const pick = await tx.draftPick.create({
                data: {
                    draftId,
                    teamId,
                    userId: playerId,
                    overallPickNo: k,
                    round,
                    pickInRound,
                    status: "ANNOUNCED", // if you later add admin "announce" gate, change to PENDING first
                },
                include: {
                    user: { select: { id: true, name: true, image: true } },
                    team: { select: { id: true, name: true } },
                },
            });

            // Assign the brother to the team (guard against last-millisecond races)
            const { count: updatedUsers } = await tx.user.updateMany({
                where: { id: playerId, teamId: null },
                data: { teamId },
            });
            if (updatedUsers !== 1) {
                // Another process drafted them; force rollback
                throw new Error("Player just became unavailable");
            }

            // Advance the pointer
            await tx.draft.update({
                where: { id: draftId },
                data: { currentPickNo: { increment: 1 } },
            });

            // ✅ Option A completion check: any BROTHERs left with teamId = null?
            const remaining = await tx.user.count({
                where: { globalRole: "BROTHER", teamId: null },
            });
            console.log("REMAINING", remaining);
            let completed = false;
            if (remaining === 0) {
                await tx.draft.update({
                    where: { id: draftId },
                    data: { status: "COMPLETE" },
                });
                completed = true;
                console.log("UPDATED TO COMPLETE");
            }

            // Pre-compute next team on clock for STATE (only if not completed)
            let nextTeamId: string | null = null;
            if (!completed) {
                const nextK = k + 1;
                const nextRound = Math.floor((nextK - 1) / T) + 1;
                const nextI = ((nextK - 1) % T) + 1;
                const nextPickInRound =
                    nextRound % 2 === 0 ? T - nextI + 1 : nextI;
                nextTeamId = order[nextPickInRound - 1] ?? null;
            }

            return { pick, completed, nextPickNo: k + 1, nextTeamId };
        });

        // 4) Broadcast (after TX commit)
        await pusher.trigger(`public-draft-${draftId}`, "event", {
            type: "ANNOUNCE",
            pickNo: result.pick.overallPickNo,
            teamId: result.pick.teamId,
            player: {
                id: result.pick.userId,
                name: result.pick.user?.name ?? null,
                image: result.pick.user?.image ?? null,
            },
        });

        if (result.completed) {
            // Final state
            await pusher.trigger(`public-draft-${draftId}`, "event", {
                type: "STATE",
                status: "COMPLETE",
                pickNo: result.pick.overallPickNo, // last made pick
                teamId: result.pick.teamId,
                deadlineAt: Date.now(), // irrelevant; draft is done
            });
        } else {
            // Next team on the clock + timer
            await pusher.trigger(`public-draft-${draftId}`, "event", {
                type: "STATE",
                status: "ONGOING",
                pickNo: result.nextPickNo,
                teamId: result.nextTeamId,
                deadlineAt: Date.now() + 10 * 60 * 1000,
            });
        }

        return NextResponse.json({ ok: true }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ err }, { status: 400 });
    }
}

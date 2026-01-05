import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../prisma";
import { pusher } from "@/lib/pusher/server";
import { isAdmin } from "@/lib/isAdmin";
import { idP } from "@/models/routeParamsTypes";

export async function POST(req: NextRequest, { params }: { params: idP }) {
    const canAnnounce = await isAdmin();
    if (!canAnnounce) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const p = await params;
    const draftId = String(p.id);

    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const pickId: string | undefined = body?.pickId;
    if (!pickId) return NextResponse.json({ error: "Missing pickId" }, { status: 400 });

    try {
        const result = await prisma.$transaction(async (tx) => {
            const draft = await tx.draft.findUnique({ where: { id: draftId } });
            if (!draft) throw new Error("Draft not found");

            const pick = await tx.draftPick.findUnique({
                where: { id: pickId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            imagePublicId: true,
                            teamId: true,
                            globalRole: true,
                        },
                    },
                    team: { select: { id: true, name: true } },
                },
            });

            if (!pick || pick.draftId !== draftId) throw new Error("Pick not found for this draft");
            if (pick.status !== "PICK_IS_IN") throw new Error("Pick is not in PICK_IS_IN state");

            // Ensure the pick corresponds to the current pick number
            if (pick.overallPickNo !== draft.currentPickNo) {
                throw new Error("Pick does not match the current pick number");
            }

            // Guard: user still draftable
            if (!pick.user || pick.user.globalRole !== "BROTHER" || pick.user.teamId) {
                throw new Error("Player not available to be assigned");
            }

            // Assign the brother to the team
            const { count: updatedUsers } = await tx.user.updateMany({
                where: { id: pick.userId, teamId: null },
                data: { teamId: pick.teamId },
            });
            if (updatedUsers !== 1) throw new Error("Player just became unavailable");

            // Mark pick as ANNOUNCED
            const announcedPick = await tx.draftPick.update({
                where: { id: pickId },
                data: { status: "ANNOUNCED" },
                include: {
                    user: { select: { id: true, name: true, image: true, imagePublicId: true } },
                    team: { select: { id: true, name: true } },
                },
            });

            // Advance the pointer + deadline
            const nextDeadlineAt = new Date(Date.now() + 10 * 60 * 1000);
            await tx.draft.update({
                where: { id: draftId },
                data: {
                    currentPickNo: { increment: 1 },
                    deadlineAt: nextDeadlineAt,
                },
            });

            // Completion check
            const remaining = await tx.user.count({
                where: { globalRole: "BROTHER", teamId: null },
            });

            let completed = false;
            if (remaining === 0) {
                await tx.draft.update({ where: { id: draftId }, data: { status: "COMPLETE" } });
                await tx.derbyStats.update({ where: { id: draftId }, data: { status: "POST_DRAFT" } });
                completed = true;
            }

            // Compute next team on clock if not completed
            let nextTeamId: string | null = null;
            const nextPickNo = draft.currentPickNo + 1;

            if (!completed) {
                await tx.draft.update({ where: { id: draftId }, data: { status: "ONGOING" } }); // resume draft clock
                const order = draft.teamOrder as unknown as string[];
                if (!Array.isArray(order) || order.length === 0) throw new Error("Draft team order not set");

                const T = order.length;
                const k = nextPickNo;
                const round = Math.floor((k - 1) / T) + 1;
                const i = ((k - 1) % T) + 1;
                const pickInRound = round % 2 === 0 ? T - i + 1 : i;
                nextTeamId = order[pickInRound - 1] ?? null;
            }

            return {
                pick: announcedPick,
                completed,
                nextPickNo,
                nextTeamId,
                deadlineAtMs: completed ? Date.now() : Date.now() + 10 * 60 * 1000,
            };
        });

        // Broadcast ANNOUNCE
        await pusher.trigger(`public-draft-${draftId}`, "event", {
            type: "ANNOUNCE",
            pickId: result.pick.id,
            pickNo: result.pick.overallPickNo,
            round: result.pick.round,
            teamId: result.pick.teamId,
            player: {
                id: result.pick.userId,
                name: result.pick.user.name,
                image: result.pick.user?.image,
            },
        });

        // Broadcast STATE
        await pusher.trigger(`public-draft-${draftId}`, "event", {
            type: "STATE",
            status: result.completed ? "COMPLETE" : "ONGOING",
            pickNo: result.completed ? result.pick.overallPickNo : result.nextPickNo,
            teamId: result.completed ? result.pick.teamId : result.nextTeamId,
            deadlineAt: result.deadlineAtMs,
        });

        return NextResponse.json({ ok: true }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err }, { status: 400 });
    }
}

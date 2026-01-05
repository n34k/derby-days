import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../prisma";
import { isAdmin } from "@/lib/isAdmin";
import { pusher } from "@/lib/pusher/server";
import { idP } from "@/models/routeParamsTypes";
import { isHeadCoach } from "@/lib/isHeadCoach";

export async function GET() {
    const admin = await isAdmin();
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pick = await prisma.draftPick.findFirst({
        where: { status: "PICK_IS_IN" },
        include: {
            user: { select: { id: true, name: true, image: true, imagePublicId: true, walkoutSong: true } },
            team: { select: { id: true, name: true } },
        },
    });

    return NextResponse.json({ pick: pick ?? null }, { status: 200 });
}

export async function POST(req: NextRequest, { params }: { params: idP }) {
    const canPick = (await isAdmin()) || (await isHeadCoach());
    if (!canPick) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const p = await params;
    const draftId = String(p.id);

    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const playerId: string | undefined = body?.playerId;
    if (!playerId) {
        return NextResponse.json({ error: "Missing playerId" }, { status: 400 });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const draft = await tx.draft.findUnique({ where: { id: draftId } });
            if (!draft) throw new Error("Draft not found");

            // Compute team on the clock (snake) based on currentPickNo
            const order = draft.teamOrder as unknown as string[];
            if (!Array.isArray(order) || order.length === 0) throw new Error("Draft team order not set");

            const T = order.length;
            const k = draft.currentPickNo; // 1-based
            const round = Math.floor((k - 1) / T) + 1;
            const i = ((k - 1) % T) + 1;
            const pickInRound = round % 2 === 0 ? T - i + 1 : i;
            const teamId = order[pickInRound - 1];

            // Player must be draftable (not already assigned)
            const brother = await tx.user.findUnique({ where: { id: playerId } });
            if (!brother || brother.globalRole !== "BROTHER" || brother.teamId) {
                throw new Error("Player not available");
            }

            // Optional guard: disallow multiple PICK_IS_IN for same overall pick
            const existing = await tx.draftPick.findFirst({
                where: { draftId, overallPickNo: k },
            });

            if (existing) {
                throw new Error("A pick already exists for the current pick number");
            }

            await tx.draft.update({ where: { id: draftId }, data: { status: "PAUSED" } }); //pick is in, pause draft clock

            const pick = await tx.draftPick.create({
                data: {
                    draftId,
                    teamId,
                    userId: playerId,
                    overallPickNo: k,
                    round,
                    pickInRound,
                    status: "PICK_IS_IN",
                },
                include: {
                    user: { select: { id: true, name: true, image: true, imagePublicId: true, walkoutSong: true } },
                    team: { select: { id: true, name: true } },
                },
            });

            return { pick, draftStatus: draft.status };
        });

        //Broadcast after commit
        console.log("PICK_IS_IN broadcast:", result.pick.id);
        await pusher.trigger(`public-draft-${draftId}`, "event", {
            type: "PICK_IS_IN",
            pickId: result.pick.id,
            pickNo: result.pick.overallPickNo,
            round: result.pick.round,
            teamId: result.pick.teamId,
            player: {
                id: result.pick.userId,
                name: result.pick.user.name,
                image: result.pick.user?.image,
                walkoutSong: result.pick.user.walkoutSong,
            },
        });

        return NextResponse.json({ ok: true, pickId: result.pick.id }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err }, { status: 400 });
    }
}

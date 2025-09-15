// src/app/api/draft/[id]/status/route.ts  (or keep your current path)
import { isAdmin } from "@/lib/isAdmin";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../prisma";
import { idP } from "@/models/routeParamsTypes";
import { pusher } from "@/lib/pusher/server";

const DRAFT_TIMER = 10 * 60 * 1000;

export async function GET() {
    const year = new Date().getFullYear().toString();

    const draft = await prisma.draft.findFirst({ where: { id: year } });

    if (!draft) {
        return NextResponse.json(
            { error: "Draft not found for current year" },
            { status: 404 }
        );
    }

    return NextResponse.json(draft.status, { status: 200 });
}

export async function PATCH(req: NextRequest, { params }: { params: idP }) {
    const admin = await isAdmin();
    if (!admin) {
        return NextResponse.json(
            { error: "User must be an admin to edit a draft" },
            { status: 401 }
        );
    }

    const p = await params;

    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 }
        );
    }

    const nextStatus = body?.status as
        | "NOT_STARTED"
        | "ONGOING"
        | "PAUSED"
        | "COMPLETE"
        | undefined;
    if (!nextStatus) {
        return NextResponse.json({ error: "Missing status" }, { status: 400 });
    }

    try {
        const draft = await prisma.draft.findUnique({
            where: { id: p.id },
            select: {
                id: true,
                status: true,
                currentPickNo: true,
                teamOrder: true,
            },
        });

        if (!draft) {
            return NextResponse.json(
                { error: "Draft not found" },
                { status: 404 }
            );
        }

        if (draft.status === "COMPLETE" && nextStatus !== "COMPLETE") {
            return NextResponse.json(
                { error: "Draft already complete" },
                { status: 409 }
            );
        }

        await prisma.draft.update({
            //start the draft here
            where: { id: p.id },
            data: {
                status: nextStatus,
                deadlineAt: new Date(Date.now() + 10 * 60 * 1000),
            },
        });

        //If starting (or already started), compute who's on the clock and emit STATE with a new deadline
        if (nextStatus === "ONGOING") {
            const order = draft.teamOrder as string[];
            if (!Array.isArray(order) || order.length === 0) {
                return NextResponse.json(
                    { error: "Team order not set" },
                    { status: 400 }
                );
            }

            const T = order.length;
            const k = Math.max(1, draft.currentPickNo); // overall pick number (1-based)
            const round = Math.floor((k - 1) / T) + 1;
            const i = ((k - 1) % T) + 1; // 1..T within the round
            const pickInRound = round % 2 === 0 ? T - i + 1 : i; // snake order
            const teamId = order[pickInRound - 1];

            const deadlineAt = Date.now() + DRAFT_TIMER;

            // Broadcast the STATE so clients start the timer immediately
            console.log("PUSHER STATE ONGOING");
            await pusher.trigger(`public-draft-${p.id}`, "event", {
                type: "STATE",
                status: "ONGOING",
                pickNo: k,
                teamId,
                deadlineAt,
            });
        }

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (e) {
        console.error("Update draft status error:", e);
        return NextResponse.json(
            { error: "Failed to update draft status" },
            { status: 400 }
        );
    }
}

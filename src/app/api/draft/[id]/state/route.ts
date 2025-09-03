import { NextResponse } from "next/server";
import { prisma } from "../../../../../../prisma";
import { idP } from "@/models/routeParamsTypes";

export async function GET(_req: Request, { params }: { params: idP }) {
    const p = await params;
    const draftId = String(p.id);
    const draft = await prisma.draft.findUnique({
        where: { id: draftId },
        select: {
            status: true,
            currentPickNo: true,
            teamOrder: true,
            deadlineAt: true,
        },
    });
    if (!draft)
        return NextResponse.json({ error: "Draft not found" }, { status: 404 });

    const order = draft.teamOrder as unknown as string[];
    const T = order?.length ?? 0;

    let teamId: string | null = null;
    if (draft.status === "ONGOING" && T > 0) {
        const k = Math.max(1, draft.currentPickNo);
        const round = Math.floor((k - 1) / T) + 1;
        const i = ((k - 1) % T) + 1;
        const pickInRound = round % 2 === 0 ? T - i + 1 : i;
        teamId = order[pickInRound - 1] ?? null;
    }

    return NextResponse.json({
        status: draft.status,
        pickNo: draft.currentPickNo,
        teamId,
        deadlineAt: draft.deadlineAt
            ? new Date(draft.deadlineAt).getTime()
            : null,
    });
}

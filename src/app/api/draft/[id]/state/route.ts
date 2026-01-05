import { NextResponse } from "next/server";
import { prisma } from "../../../../../../prisma";
import { idP } from "@/models/routeParamsTypes";
import { DraftStatus } from "@/generated/prisma";

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
            picksByTeam: true,
        },
    });
    if (!draft) return NextResponse.json({ error: "Draft not found" }, { status: 404 });

    const order = draft.teamOrder as unknown as string[];
    const T = order?.length ?? 0;

    let teamId: string | null = null;
    const draftActive = draft.status === DraftStatus.PAUSED || draft.status === DraftStatus.ONGOING;
    if (draftActive && T > 0) {
        teamId = draft.picksByTeam[draft.currentPickNo - 1];
    }
    return NextResponse.json({
        status: draft.status,
        pickNo: draft.currentPickNo,
        teamId,
        deadlineAt: draft.deadlineAt ? new Date(draft.deadlineAt).getTime() : null,
    });
}

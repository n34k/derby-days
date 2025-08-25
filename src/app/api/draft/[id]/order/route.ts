import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../prisma";
import { isAdmin } from "@/lib/isAdmin";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const p = await params;
    const draftId = p.id;
    const draft = await prisma.draft.findUnique({
        where: { id: draftId },
        select: { teamOrder: true },
    });

    if (!draft) {
        return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json({
        teamOrder: draft.teamOrder,
    });
}

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    if (!isAdmin) {
        return NextResponse.json(
            { error: "User must be an admin" },
            { status: 401 }
        );
    }
    const p = await params;
    const draftId = p.id;
    const { teamOrder } = await req.json();

    if (!Array.isArray(teamOrder) || teamOrder.length === 0) {
        return NextResponse.json(
            { error: "teamOrder must be a non-empty array of team IDs" },
            { status: 400 }
        );
    }

    // Validate that all provided IDs are real teams
    const teams = await prisma.team.findMany({
        where: { id: { in: teamOrder } },
        select: { id: true },
    });

    if (teams.length !== teamOrder.length) {
        return NextResponse.json(
            { error: "Some team IDs not found" },
            { status: 400 }
        );
    }

    const draft = await prisma.draft.update({
        where: { id: draftId },
        data: {
            teamOrder,
        },
        select: { id: true, teamOrder: true },
    });

    return NextResponse.json(draft);
}

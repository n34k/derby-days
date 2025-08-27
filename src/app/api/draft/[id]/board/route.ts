// src/app/api/draft/[id]/board/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../../../../prisma";
import { idP } from "@/models/routeParamsTypes";

export async function GET(_req: Request, { params }: { params: idP }) {
    const p = await params;
    const draftId = String(p.id);

    // Load draft + teams (order defines columns)
    const draft = await prisma.draft.findUnique({
        where: { id: draftId },
        select: { id: true, roundCount: true, teamOrder: true },
    });
    if (!draft)
        return NextResponse.json({ error: "Draft not found" }, { status: 404 });

    const teamIds = (draft.teamOrder as unknown as string[]) ?? [];
    if (!teamIds.length) {
        return NextResponse.json(
            { error: "Team order not set" },
            { status: 400 }
        );
    }

    const teams = await prisma.team.findMany({
        where: { id: { in: teamIds } },
        select: { id: true, name: true },
    });
    const teamIndex: Record<string, number> = {};
    // keep the order from teamOrder
    const teamColumns = teamIds.map((id, idx) => {
        const t = teams.find((x) => x.id === id);
        teamIndex[id] = idx;
        return { id, name: t?.name ?? "Unknown Team" };
    });

    // Fetch all picks for the board
    const picks = await prisma.draftPick.findMany({
        where: { draftId },
        select: {
            userId: true,
            teamId: true,
            round: true,
            overallPickNo: true,
            user: { select: { name: true } },
        },
        orderBy: [{ round: "asc" }, { overallPickNo: "asc" }],
    });

    // Build rounds x columns
    const rows = draft.roundCount;
    const cols = teamColumns.length;

    type Cell = {
        playerId: string;
        name: string | null;
        overallPickNo: number;
    } | null;

    const grid: Cell[][] = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => null)
    );

    for (const p of picks) {
        const r = p.round - 1;
        const c = teamIndex[p.teamId];
        if (r >= 0 && r < rows && c >= 0 && c < cols) {
            grid[r][c] = {
                playerId: p.userId,
                name: p.user?.name ?? null,
                overallPickNo: p.overallPickNo,
            };
        }
    }

    return NextResponse.json({
        teams: teamColumns, // [{id, name}, ...] order = columns
        rounds: rows, // number of rows
        grid, // Cell[][]
    });
}

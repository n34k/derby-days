import { isAdmin } from "@/lib/isAdmin";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../prisma";
import { idP } from "@/models/routeParamsTypes";

export async function GET(req: NextRequest, { params }: { params: idP }) {
    const p = await params;
    if (!p) {
        return NextResponse.json({ error: "Params undefined", status: 404 });
    }
    const draft = prisma.draft.findUnique({ where: { id: p.id } });

    if (!draft) {
        return NextResponse.json({ error: "Draft not found", status: 404 });
    }

    return NextResponse.json(draft, { status: 200 });
}

export async function POST(req: NextRequest) {
    const admin = await isAdmin();
    if (!admin) {
        return NextResponse.json({ error: "User must be an admin to make a draft" }, { status: 401 });
    }

    const { year } = await req.json();

    if (await prisma.draft.findUnique({ where: { id: year } })) {
        return NextResponse.json(
            {
                error: "A draft was already created this year, please wait for next year",
            },
            { status: 409 }
        );
    }

    const brotherCount = await prisma.user.count({
        where: { globalRole: "BROTHER" },
    });

    const teams = await prisma.team.findMany();
    const teamCount = teams.length;
    const roundCount = Math.max(1, Math.ceil(brotherCount / teamCount));
    const teamIds = teams.map((t) => t.id);
    const lastRoundPickCount = brotherCount % teamCount;
    const numPicksToRemove = teamCount - lastRoundPickCount;

    const picksByTeam = [];
    let reverse = false; //make the snake loop, start of normal loop

    for (let _ = 0; _ < roundCount; _++) {
        if (reverse) {
            for (let i = teamCount - 1; i >= 0; i--) {
                picksByTeam.push(teamIds[i]);
            }
            reverse = false;
        } else {
            for (let i = 0; i < teamCount; i++) {
                picksByTeam.push(teamIds[i]);
            }
            reverse = true;
        }
    }

    picksByTeam.splice(picksByTeam.length - numPicksToRemove, numPicksToRemove); //remove the last n picks to make sure the picksByTeam is the exact amount we want to remove

    const draft = await prisma.draft.create({
        data: {
            id: String(year),
            status: "NOT_STARTED",
            name: `${year} Derby Days Draft`,
            roundCount,
            picksByTeam,
            teamOrder: teamIds,
            currentPickNo: 1,
        },
    });

    return NextResponse.json(draft, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: idP }) {
    const p = await params;
    const draft = await prisma.draft.findUnique({ where: { id: p.id } });
    if (!draft) {
        return NextResponse.json({ error: "Trying to delete a draft that doesnt exist" }, { status: 404 });
    }

    const deletedDraft = await prisma.draft.delete({
        where: { id: p.id },
    });
    return NextResponse.json(deletedDraft, { status: 200 });
}

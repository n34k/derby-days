import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../prisma";
import { PREDEFINED_TEAMS } from "@/lib/predefinedTeams";
import { isAdmin } from "@/lib/isAdmin";
// import { isAdmin } from "@/lib/isAdmin";

export async function POST(req: NextRequest) {
    if (!(await isAdmin()))
        return NextResponse.json(
            { error: "You must be an admin to do this" },
            { status: 403 }
        );

    const { id } = await req.json().catch(() => ({}));
    if (!id || typeof id !== "string") {
        return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const entry = PREDEFINED_TEAMS.find((t) => t.id === id);
    if (!entry)
        return NextResponse.json({ error: "Invalid team id" }, { status: 400 });

    const existing = await prisma.team.findUnique({ where: { id } });
    if (existing)
        return NextResponse.json(
            { error: "Team already exists" },
            { status: 409 }
        );

    const team = await prisma.team.create({
        data: {
            id,
            name: entry.name,
            // add any defaults: points: 0, moneyRaised: 0, etc.
        },
    });

    return NextResponse.json({ team }, { status: 201 });
}

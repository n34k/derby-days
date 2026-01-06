import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../prisma";
import { isAdmin } from "@/lib/isAdmin";
import { Prisma } from "@/generated/prisma";

type Params = { id: string };

type PatchBody = Partial<{
    title: string;
    description: string | null;
    location: string | null;
    startTime: string; // coming from client as ISO string
}>;

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
    const can = await isAdmin();
    if (!can) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const p = await params;
    const id = String(p.id);

    let body: PatchBody;
    try {
        body = (await req.json()) as PatchBody;
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Strongly-typed Prisma update payload
    const data: Prisma.ScheduleEntryUpdateInput = {};

    if (typeof body.title !== "undefined") {
        const t = String(body.title ?? "").trim();
        if (!t) return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
        data.title = t;
    }

    if (typeof body.description !== "undefined") {
        data.description =
            body.description === null || body.description === "" ? null : String(body.description).trim();
    }

    if (typeof body.location !== "undefined") {
        data.location = body.location === null || body.location === "" ? null : String(body.location).trim();
    }

    if (typeof body.startTime !== "undefined") {
        const dt = new Date(body.startTime);
        if (Number.isNaN(dt.getTime())) {
            return NextResponse.json({ error: "Invalid startTime" }, { status: 400 });
        }
        data.startTime = dt;
    }

    const entry = await prisma.scheduleEntry.update({
        where: { id },
        data,
    });

    return NextResponse.json({ entry });
}

export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
    const can = await isAdmin();
    if (!can) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const p = await params;
    const id = String(p.id);

    await prisma.scheduleEntry.delete({ where: { id } });

    return NextResponse.json({ ok: true });
}

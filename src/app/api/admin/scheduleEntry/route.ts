import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../prisma";
import { isAdmin } from "@/lib/isAdmin";

export async function GET() {
    const entries = await prisma.scheduleEntry.findMany({
        orderBy: { startTime: "asc" },
    });

    return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
    const can = await isAdmin();
    if (!can) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const title = String(body?.title ?? "").trim();
    const description = body?.description ? String(body.description).trim() : null;
    const location = body?.location ? String(body.location).trim() : null;

    const startTimeRaw = body?.startTime;
    const startTime = startTimeRaw ? new Date(startTimeRaw) : null;

    if (!title) return NextResponse.json({ error: "Missing title" }, { status: 400 });
    if (!startTime || Number.isNaN(startTime.getTime())) {
        return NextResponse.json({ error: "Missing or invalid startTime" }, { status: 400 });
    }

    const entry = await prisma.scheduleEntry.create({
        data: { title, description, location, startTime },
    });

    return NextResponse.json({ entry });
}

import { NextResponse } from "next/server";
import { prisma } from "../../../../../../prisma";
import { idP } from "@/models/routeParamsTypes";
import { isAdmin } from "@/lib/isAdmin";
// import { isAdmin } from "@/lib/isAdmin";

export async function PATCH(req: Request, { params }: { params: idP }) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const p = await params;
    const id = p.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const note = body?.note;
    if (typeof note !== "string") {
        return NextResponse.json(
            { error: "`note` must be a string" },
            { status: 400 }
        );
    }

    try {
        const updated = await prisma.donation.update({
            where: { id },
            data: { note },
        });
        return NextResponse.json({ donation: updated }, { status: 200 });
    } catch {
        return NextResponse.json(
            { error: "Donation not found" },
            { status: 404 }
        );
    }
}

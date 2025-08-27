import { isAdmin } from "@/lib/isAdmin";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../prisma";

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
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

    const draft = await prisma.draft.update({
        where: { id: p.id },
        data: { status: body.status },
    });

    if (!draft) {
        return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json(draft, { status: 200 });
}

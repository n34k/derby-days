import { isAdmin } from "@/lib/isAdmin";
import { idP } from "@/models/routeParamsTypes";
import { NextResponse } from "next/server";
import { prisma } from "../../../../../../prisma";

export async function GET(req: Request, { params }: { params: idP }) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const p = await params;
    const id = p.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const derby = await prisma.derbyStats.findUnique({ where: { id } });
    if (!derby) {
        return NextResponse.json(
            { error: "Derby stats not found" },
            { status: 404 }
        );
    }
    return NextResponse.json({ derby }, { status: 200 });
}

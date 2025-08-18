import { NextResponse } from "next/server";
import { prisma } from "../../../../../prisma";

// used in the teams table to fetch eligible head coaches
export async function GET() {
    try {
        const brothers = await prisma.user.findMany({
            where: { globalRole: "BROTHER" },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        });

        // Disable caching so the dropdown is always fresh
        return NextResponse.json(
            { brothers },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (err) {
        console.error("[GET /api/admin/users] error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

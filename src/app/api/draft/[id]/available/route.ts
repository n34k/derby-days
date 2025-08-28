import { NextResponse } from "next/server";
import { prisma } from "../../../../../../prisma";

export async function GET() {
    const available = await prisma.user.findMany({
        where: {
            globalRole: "BROTHER",
            teamId: null, //not yet drafted
        },
        select: {
            id: true,
            name: true,
            image: true,
            walkoutSong: true,
        },
        orderBy: { name: "asc" },
    });

    return NextResponse.json({ available });
}

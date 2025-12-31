import { NextResponse } from "next/server";
import { prisma } from "../../../../../prisma";

export async function GET() {
    const ads = await prisma.ad.findMany({
        orderBy: { price: "desc" },
        where: {
            OR: [{ quantityAvailable: null }, { quantityAvailable: { gt: 0 } }],
        },
    });

    return NextResponse.json(ads);
}

import { NextResponse } from "next/server";
import { prisma } from "../../../../prisma";

export async function GET() {
    try {
        const tshirts = await prisma.tshirt.findMany({
            orderBy: { price: "asc" },
        });

        return NextResponse.json(tshirts, { status: 200 });
    } catch (err) {
        console.error("Error fetching tshirts:", err);
        return NextResponse.json({ error: "Failed to fetch t-shirts." }, { status: 500 });
    }
}

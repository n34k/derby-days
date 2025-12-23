import { NextResponse } from "next/server";
import { prisma } from "../../../../prisma";

// GET /api/ad/by-price-id/:priceId
export async function GET() {
    try {
        const ad = await prisma.ad.findMany();
        return NextResponse.json(ad, { status: 200 });
    } catch (err) {
        console.error("Error fetching all ads:", err);
        return NextResponse.json({ error: "Failed to fetch ad." }, { status: 500 });
    }
}

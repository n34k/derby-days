import { NextResponse } from "next/server";
import { prisma } from "../../../../../prisma";
import { priceIdP } from "@/models/routeParamsTypes";

// GET /api/ad/by-price-id/:priceId
export async function GET(_req: Request, { params }: { params: priceIdP }) {
    const p = await params;

    try {
        const ad = await prisma.ad.findUnique({
            where: { priceId: p.priceId },
        });

        if (!ad) {
            return NextResponse.json({ error: "Ad not found." }, { status: 404 });
        }

        return NextResponse.json(ad, { status: 200 });
    } catch (err) {
        console.error("Error fetching ad by priceId:", err);
        return NextResponse.json({ error: "Failed to fetch ad." }, { status: 500 });
    }
}

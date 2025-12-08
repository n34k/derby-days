import { NextResponse } from "next/server";
import { prisma } from "../../../../../prisma";
import { isAdmin } from "@/lib/isAdmin";

export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    try {
        const ads = await prisma.ad.findMany({
            orderBy: { price: "asc" },
        });

        return NextResponse.json(ads, { status: 200 });
    } catch (err) {
        console.error("Error fetching ads:", err);
        return NextResponse.json({ error: "Failed to fetch ads." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    try {
        const body = await request.json();

        const { productId, size, price, priceId, sizeInches, quantityAvailable } = body;

        if (!productId || !size || price == null || !priceId || !sizeInches) {
            return NextResponse.json(
                {
                    error: "productId, size, price, priceId and sizeInches are required.",
                },
                { status: 400 }
            );
        }

        const created = await prisma.ad.create({
            data: {
                productId,
                size,
                price,
                priceId,
                sizeInches,
                quantityAvailable: quantityAvailable ?? null,
            },
        });

        return NextResponse.json(created, { status: 201 });
    } catch (err) {
        console.error("Error creating ad:", err);
        return NextResponse.json({ error: "Failed to create ad: ", err }, { status: 500 });
    }
}

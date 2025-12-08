import { NextResponse } from "next/server";
import { prisma } from "../../../../../prisma";
import { isAdmin } from "@/lib/isAdmin";

export async function GET() {
    if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

export async function POST(request: Request) {
    if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();

        const { productId, name, price, priceId, quantityAvailable, size } = body ?? {};

        if (!productId || !name || price == null || !priceId) {
            return NextResponse.json(
                {
                    error: "productId, name, price, and priceId are required.",
                },
                { status: 400 }
            );
        }

        const created = await prisma.tshirt.create({
            data: {
                productId,
                name,
                price,
                priceId,
                quantityAvailable: quantityAvailable === undefined ? null : quantityAvailable,
                size: size ?? null, // TshirtSize? enum or string, depending on your generated type
            },
        });

        return NextResponse.json(created, { status: 201 });
    } catch (err) {
        console.error("Error creating tshirt:", err);
        return NextResponse.json({ error: "Failed to create t-shirt: ", err }, { status: 500 });
    }
}

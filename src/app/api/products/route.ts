import { prisma } from "../../../../prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") ?? undefined;

    const products = await prisma.product.findMany({
        where: category ? { category } : undefined,
        select: {
            productId: true,
            name: true,
            price: true,
            priceId: true,
        },
        orderBy: { name: "asc" },
    });

    return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
    try {
        const body: {
            productId?: string;
            name?: string;
            price?: number;
            priceId?: string;
            category?: string;
        } = await req.json();

        const { productId, name, price, priceId, category } = body;

        if (!productId || !name || !price || !priceId || !category) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const existing = await prisma.product.findUnique({
            where: { productId },
        });
        if (existing) {
            return NextResponse.json(
                { error: "Product with this ID already exists" },
                { status: 409 }
            );
        }

        const newProduct = await prisma.product.create({
            data: {
                productId,
                name,
                price,
                priceId,
                category,
            },
        });

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        console.error("[POST /api/products]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

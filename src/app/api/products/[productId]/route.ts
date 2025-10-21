import { prisma } from "../../../../../prisma";
import { NextRequest, NextResponse } from "next/server";

function extractId(url: string): string | null {
    const segments = url.split("/");
    return segments[segments.length - 1] || null;
}

//this is GET using priceId, hopefully i wont need to get with productId or else i need to move this to a new folder
export async function GET(req: NextRequest) {
    const priceId = extractId(req.url);
    if (!priceId) {
        return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    try {
        const product = await prisma.product.findUnique({
            where: { priceId },
            select: {
                productId: true,
                name: true,
                price: true,
                category: true,
                priceId: true,
            },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (err) {
        console.error("Error fetching product by priceId:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const productId = extractId(req.url);
    if (!productId) {
        return NextResponse.json(
            { error: "Missing productId" },
            { status: 400 }
        );
    }

    const body = await req.json();

    try {
        const product = await prisma.product.update({
            where: { productId },
            data: {
                name: body.name,
                price: body.price,
                priceId: body.priceId,
                category: body.category,
            },
        });

        return NextResponse.json(product, { status: 200 });
    } catch (err) {
        console.error("Update failed", err);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const productId = extractId(req.url);
    if (!productId) {
        return NextResponse.json(
            { error: "Missing productId" },
            { status: 400 }
        );
    }

    try {
        await prisma.product.delete({ where: { productId } });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Delete failed", err);
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}

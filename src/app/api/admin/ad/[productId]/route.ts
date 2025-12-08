// app/api/admin/ad/[productId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../../../../prisma";
import { isAdmin } from "@/lib/isAdmin";
import { Ad } from "@/generated/prisma";

interface Params {
    params: { productId: string };
}

export async function GET(_req: Request, { params }: Params) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { productId } = params;

    try {
        const ad = await prisma.ad.findUnique({
            where: { productId },
        });

        if (!ad) {
            return NextResponse.json({ error: "Ad not found." }, { status: 404 });
        }

        return NextResponse.json(ad, { status: 200 });
    } catch (err) {
        console.error("Error fetching ad:", err);
        return NextResponse.json({ error: "Failed to fetch ad." }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: Params) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { productId } = params;

    try {
        const body = await request.json();
        const data = {} as Ad;

        if (body.size !== undefined) data.size = body.size;
        if (body.price !== undefined) data.price = body.price;
        if (body.priceId !== undefined) data.priceId = body.priceId;
        if (body.sizeInches !== undefined) data.sizeInches = body.sizeInches;
        if (body.quantityAvailable !== undefined) data.quantityAvailable = body.quantityAvailable;

        if (Object.keys(data).length === 0) {
            return NextResponse.json({ error: "No valid fields provided." }, { status: 400 });
        }

        const updated = await prisma.ad.update({
            where: { productId },
            data,
        });

        return NextResponse.json(updated, { status: 200 });
    } catch (err) {
        console.error("Error updating ad:", err);

        return NextResponse.json({ error: "Failed to update ad: ", err }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: Params) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { productId } = params;

    try {
        await prisma.ad.delete({
            where: { productId },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
        console.error("Error deleting ad:", err);

        return NextResponse.json({ error: "Failed to delete ad: ", err }, { status: 500 });
    }
}

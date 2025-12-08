import { NextResponse } from "next/server";
import { prisma } from "../../../../../../prisma";
import { isAdmin } from "@/lib/isAdmin";
import { Tshirt } from "@/generated/prisma";
interface Params {
    params: { productId: string };
}

export async function GET(_req: Request, { params }: Params) {
    if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId } = params;

    try {
        const tshirt = await prisma.tshirt.findUnique({
            where: { productId },
        });

        if (!tshirt) {
            return NextResponse.json({ error: "T-shirt not found." }, { status: 404 });
        }

        return NextResponse.json(tshirt, { status: 200 });
    } catch (err) {
        console.error("Error fetching tshirt:", err);
        return NextResponse.json({ error: "Failed to fetch t-shirt." }, { status: 500 });
    }
}

// PATCH /api/admin/tshirt/:productId  -> update tshirt (admin only)
export async function PATCH(request: Request, { params }: Params) {
    if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId } = params;

    try {
        const body = await request.json();
        const data = {} as Tshirt;

        if (body.name !== undefined) data.name = body.name;
        if (body.price !== undefined) data.price = body.price;
        if (body.priceId !== undefined) data.priceId = body.priceId;
        if (body.quantityAvailable !== undefined) data.quantityAvailable = body.quantityAvailable;
        if (body.size !== undefined) data.size = body.size;

        if (Object.keys(data).length === 0) {
            return NextResponse.json({ error: "No valid fields provided for update." }, { status: 400 });
        }

        const updated = await prisma.tshirt.update({
            where: { productId },
            data,
        });

        return NextResponse.json(updated, { status: 200 });
    } catch (err) {
        console.error("Error updating tshirt:", err);

        return NextResponse.json({ error: "Failed to update t-shirt.", err }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: Params) {
    if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId } = params;

    try {
        await prisma.tshirt.delete({
            where: { productId },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
        console.error("Error deleting tshirt:", err);

        return NextResponse.json({ error: "Failed to delete t-shirt." }, { status: 500 });
    }
}

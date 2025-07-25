import { prisma } from "../../../../../prisma";
import { NextResponse } from "next/server";

type Params = { params: { productId: string } };

export async function PATCH(req: Request, { params }: Params) {
    const body = await req.json()
    const p = await params;
    const product = await prisma.product.update({
        where: { productId: p.productId },
        data: {
            name: body.name,
            price: body.price,
            priceId: body.priceId,
            category: body.category,
        },
    });

    return NextResponse.json(product);
};

export async function DELETE(_: Request, { params }: Params) {
  const p = await params;
  await prisma.product.delete({ where: { productId: p.productId } });
  return NextResponse.json({ success: true });
};
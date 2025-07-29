import { prisma } from "../../../../../prisma";
import { NextRequest, NextResponse } from "next/server";

function extractProductId(url: string): string | null {
  const segments = url.split("/");
  return segments[segments.length - 1] || null;
}

export async function PATCH(req: NextRequest) {
  const productId = extractProductId(req.url);
  if (!productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
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

    return NextResponse.json(product);
  } catch (err) {
    console.error("Update failed", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const productId = extractProductId(req.url);
  if (!productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }

  try {
    await prisma.product.delete({ where: { productId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete failed", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

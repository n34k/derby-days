import { prisma } from "../../../../prisma";
import { NextResponse } from 'next/server';

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { price: 'asc'}});
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { productId, name, price, priceId, category } = body;

    console.log('PROD ID IN ROUTE', productId)

    if (!productId || !name || !price || !priceId || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findUnique({ where: { productId } });
    if (existing) {
      return NextResponse.json(
        { error: 'Product with this ID already exists' },
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
    console.error('[POST /api/products]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
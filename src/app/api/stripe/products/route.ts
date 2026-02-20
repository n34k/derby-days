import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-06-30.basil",
});

type Body = {
    prodIds: string[];
};

export async function POST(request: Request) {
    try {
        const { prodIds } = (await request.json()) as Body;

        if (!Array.isArray(prodIds) || prodIds.length === 0) {
            return NextResponse.json({ error: "prodIds must be a non-empty array" }, { status: 400 });
        }

        //de-dupe
        const unique = Array.from(new Set(prodIds)).filter((id) => typeof id === "string" && id.startsWith("prod_"));

        const products = await Promise.all(
            unique.map(async (id) => {
                const p = await stripe.products.retrieve(id);
                return { productId: p.id, images: p.images ?? [] };
            }),
        );

        return NextResponse.json({ products });
    } catch (err) {
        console.error("Error fetching Stripe products:", err);
        return NextResponse.json({ error: "Failed to fetch Stripe products" }, { status: 500 });
    }
}

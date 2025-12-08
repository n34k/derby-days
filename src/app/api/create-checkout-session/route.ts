import { stripe } from "@/lib/stripe";
import { prisma } from "../../../../prisma";
import { NextResponse } from "next/server";
import adSizeDisplay from "@/lib/adSizeDisplay";

export async function POST(request: Request) {
    try {
        const { amount, product, metadata, items } = await request.json();

        const category = metadata?.category; // now always expected

        console.log("CATEGORY", category);

        if (category === "shirt") {
            if (!Array.isArray(items) || items.length === 0) {
                return NextResponse.json({ error: "No shirt items selected" }, { status: 400 });
            }

            // Fetch the shirt products from your DB
            const productIds = items.map((i) => i.productId);
            const dbProducts = await prisma.tshirt.findMany({
                where: { productId: { in: productIds } },
                select: {
                    productId: true,
                    name: true,
                    priceId: true,
                    price: true,
                },
            });

            // Build Stripe line items for each shirt + quantity
            const line_items = items.map((item) => {
                const p = dbProducts.find((x) => x.productId === item.productId);
                if (!p) throw new Error(`Product not found: ${item.productId}`);

                if (p.priceId) {
                    return {
                        price: p.priceId,
                        quantity: item.quantity ?? 1,
                        adjustable_quantity: {
                            enabled: true,
                            minimum: 1,
                            maximum: 10,
                        },
                    };
                }

                if (!p.price) {
                    throw new Error(`Missing priceCents for product ${p.name}`);
                }

                return {
                    price_data: {
                        currency: "usd",
                        product_data: { name: p.name },
                        unit_amount: p.price,
                    },
                    quantity: item.quantity ?? 1,
                };
            });

            const session = await stripe.checkout.sessions.create({
                mode: "payment",
                ui_mode: "hosted",
                line_items,
                customer_email: metadata.email,
                metadata,
                success_url: `${process.env.DOMAIN}/done?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.DOMAIN}/checkout/shirt`,
            });

            return NextResponse.json({ url: session.url });
        }
        //for donations and ad purchase
        const isDonation = category === "donation";

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            ui_mode: "hosted",
            success_url: `${process.env.DOMAIN}/done?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.DOMAIN}/donate`,
            customer_email: metadata.email,
            metadata,
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: isDonation ? "Donation" : adSizeDisplay(product.size),
                            description: isDonation ? "Thank you for your support" : "Product Purchase",
                        },
                        unit_amount: isDonation ? Math.round(amount * 100) : product.price, // already in cents
                    },
                    quantity: 1,
                },
            ],
        });

        console.log("Session", session);

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Checkout session error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

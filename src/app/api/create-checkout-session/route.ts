import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { amount, product, metadata } = await request.json();

    const category = metadata?.category; // now always expected
    const isDonation = category === "donation";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "hosted",
      success_url: `${process.env.DOMAIN}/done?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.DOMAIN}/cancel`,
      customer_email: metadata.email,
      metadata,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: isDonation ? "Donation" : product.name,
              description: isDonation ? "Thank you for your support" : "Product Purchase",
            },
            unit_amount: isDonation
              ? Math.round(amount * 100)
              : product.price, // already in cents
          },
          quantity: 1,
        },
      ],
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout session error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

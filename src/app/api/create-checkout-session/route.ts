import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { amount, metadata } = await request.json();

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
            name: "Donation",
            description: "Thank you for your support",
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
  });

  return NextResponse.json({ url: session.url });
}

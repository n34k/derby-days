import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  // Get amount and product details from request
  const { amount, productName } = await request.json()

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: productName || 'Donation',
            description: 'Thank you for your support',
          },
          unit_amount: Math.round(amount * 100), // Convert dollars to cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    ui_mode: "custom",
    return_url: `${process.env.DOMAIN}/done?session_id={CHECKOUT_SESSION_ID}`,
  });

  return NextResponse.json({ clientSecret: session.client_secret });
}

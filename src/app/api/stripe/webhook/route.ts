import { prisma } from "../../../../../prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-06-30.basil"
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  console.log('IN POST REQ', req);
  const rawBody = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature!, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook error: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Process only successful checkout sessions
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log("✅ Webhook received!");
    console.log("session metadata:", session.metadata);
    const amount = session.amount_total! / 100;
    const email = session.customer_email!;
    const metadata = session.metadata;

    const name = metadata?.name || null;
    const note = metadata?.note || null;
    const referredById = metadata?.referredBy || null;
    const teamId = metadata?.teamId || null;

    try {
      await prisma.donation.create({
        data: {
          email,
          name,
          note,
          amount,
          stripeId: session.id,
          team: teamId ? { connect: { id: teamId } } : undefined,
          user: referredById ? { connect: { id: referredById } } : undefined,
        },
      });

      // update logic
      if (referredById) {
        const user = await prisma.user.findUnique({
          where: { id: referredById },
          include: { team: true },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { moneyRaised: { increment: amount } },
          });

          if (user.teamId) {
            await prisma.team.update({
              where: { id: user.teamId },
              data: { moneyRaised: { increment: amount } },
            });
          }
        }
      } else if (teamId) {
        await prisma.team.update({
          where: { id: teamId },
          data: { moneyRaised: { increment: amount } },
        });
      }
    } catch (err) {
      console.error("Donation processing error:", err);
      return new NextResponse("Failed to process donation", { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
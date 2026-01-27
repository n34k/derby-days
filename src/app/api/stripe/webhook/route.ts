import { prisma } from "../../../../../prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { sendPurchaseEmail } from "@/lib/emailService";
import getYear from "@/lib/getYear";
import { $Enums } from "@/generated/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-06-30.basil",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    console.log("IN POST REQ", req);
    const year = getYear();
    const rawBody = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(rawBody, signature!, endpointSecret);
    } catch (err: unknown) {
        console.error(`Webhook error: ${err}`);
        return new NextResponse(`Webhook Error: ${err}`, { status: 400 });
    }

    //Process only successful checkout sessions
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        if (!session.metadata) {
            console.error("Session metadata is missing");
            return new NextResponse("Session metadata is required", {
                status: 400,
            });
        }

        console.log("✅ Webhook received!");
        console.log("session metadata:", session.metadata);
        const amount = session.amount_total! / 100;
        const email = session.customer_email!;
        const name = session.metadata?.name;
        const note = session.metadata?.note || null;
        const address = session.metadata?.address || null;
        const size = session.metadata?.size as $Enums.AdSize;
        const referredById = session.metadata?.referredBy || null;
        const teamId = session.metadata?.teamId || null;
        const category = session.metadata.category;
        const shirtItems = session.metadata?.items || null;
        const userData = JSON.parse(session.metadata?.userData) || null;

        try {
            if (category === "donation") {
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
            } else if (category === "ad") {
                const ad = await prisma.ad.findFirst({
                    where: { size },
                });

                if (ad) {
                    //2. If quantityAvailable is not null AND > 0, decrement it
                    if (ad.quantityAvailable !== null && ad.quantityAvailable > 0) {
                        await prisma.ad.update({
                            where: { productId: ad.productId },
                            data: {
                                quantityAvailable: {
                                    decrement: 1,
                                },
                            },
                        });
                    }
                }

                await prisma.adPurchase.create({
                    data: {
                        email,
                        name,
                        size,
                        address,
                        amount,
                        stripeId: session.id,
                        team: teamId ? { connect: { id: teamId } } : undefined,
                        user: referredById ? { connect: { id: referredById } } : undefined,
                    },
                });
            } else if (category === "shirt") {
                // Parse items from metadata (sent as a JSON string)
                let parsedItems: Array<{
                    productId: string;
                    quantity: number;
                }> = [];
                try {
                    parsedItems = JSON.parse(shirtItems || "[]");
                } catch {
                    console.error("Failed to parse shirt items JSON");
                }

                // Get all productIds to look up names
                const productIds = parsedItems.map((i) => i.productId);

                // Fetch product names from your DB
                const dbProducts = await prisma.tshirt.findMany({
                    where: { productId: { in: productIds } },
                    select: { productId: true, name: true },
                });

                // Build { name: quantity } object
                const itemsJson: Record<string, number> = {};
                for (const item of parsedItems) {
                    const product = dbProducts.find((p) => p.productId === item.productId);
                    if (product && item.quantity > 0) {
                        itemsJson[product.name] = item.quantity;
                    }
                }

                // Optionally calculate total shirts
                const totalQty = Object.values(itemsJson).reduce((sum, q) => sum + q, 0);

                await prisma.tshirtPurchase.create({
                    data: {
                        email,
                        name,
                        team: teamId ? { connect: { id: teamId } } : undefined,
                        stripeId: session.id,
                        sizeQty: itemsJson,
                    },
                });
                if (teamId) {
                    await prisma.team.update({
                        where: {
                            id: teamId,
                        },
                        data: { tshirtsSold: { increment: totalQty } },
                    });
                }
                //TODO: raise the total money raised for derby and team by our profit from tshirt, or i could make
                //amount in metadata be the profit from tshirt
            }

            // Update logic for user and team money raised
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
                // if on checkout they chose reffered by team
            } else if (teamId) {
                // if a user donates directly to a team, see if they are logged in
                // and increment their moneyRaised as well
                console.log("USER DATA IN STRIPE WEBHOOK:", userData);
                if (userData) {
                    await prisma.user.update({
                        where: { id: userData.id },
                        data: { moneyRaised: { increment: amount } },
                    });
                }

                await prisma.team.update({
                    where: { id: teamId },
                    data: { moneyRaised: { increment: amount } },
                });
            }

            //Update total money raised
            await prisma.derbyStats.update({
                where: { id: year },
                data: { totalRaised: { increment: amount } },
            });
        } catch (err) {
            console.error("Donation processing error:", err);
            return new NextResponse("Failed to process donation", {
                status: 500,
            });
        }
        try {
            await sendPurchaseEmail({ to: email, name, category, amount });
        } catch (err) {
            console.error("Failed to send purchase email:", err);
            return new NextResponse("Failed to send purchase email", {
                status: 500,
            });
        }
    }

    return NextResponse.json({ received: true });
}

import { isAdmin } from "@/lib/isAdmin";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../prisma";
import getYear from "@/lib/getYear";

export async function POST(req: NextRequest) {
    if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { name, email, size, referredByType, referredById } = body;
    const year = getYear();

    const ads = await prisma.ad.findMany();
    const priceCents = ads.find((ad) => ad.size == size)?.price;
    const amount = priceCents ? priceCents / 100 : 0;

    if (!amount) {
        return NextResponse.json({ error: "Invalid ad size" }, { status: 400 });
    }
    //reffered by was team
    if (referredByType === "TEAM") {
        try {
            await prisma.$transaction([
                prisma.adPurchase.create({
                    data: { name, email, size, teamId: referredById, amount },
                }),
                prisma.team.update({
                    where: { id: referredById },
                    data: { moneyRaised: { increment: amount } },
                }),
                prisma.derbyStats.update({
                    where: { id: year },
                    data: { totalRaised: { increment: amount } },
                }),
            ]);
        } catch (error) {
            console.error("Transaction of team buying ad falied:", error);
            return NextResponse.json({ error: "Transaction failed" }, { status: 500 });
        }
        return NextResponse.json({ success: true });
    }

    const teamOfUser = await prisma.user.findUnique({
        where: { id: referredById },
        select: { teamId: true },
    });

    //user with team in refferd by
    if (teamOfUser?.teamId) {
        try {
            await prisma.$transaction([
                prisma.adPurchase.create({
                    data: {
                        name,
                        email,
                        size,
                        teamId: teamOfUser.teamId,
                        userId: referredById,
                        amount,
                    },
                }),
                prisma.team.update({
                    where: { id: teamOfUser.teamId },
                    data: { moneyRaised: { increment: amount } },
                }),
                prisma.user.update({
                    where: { id: referredById },
                    data: { moneyRaised: { increment: amount } },
                }),
                prisma.derbyStats.update({
                    where: { id: year },
                    data: { totalRaised: { increment: amount } },
                }),
            ]);
        } catch (error) {
            console.error("Transaction of user with team buying ad falied:", error);
            return NextResponse.json({ error: "Transaction failed" }, { status: 500 });
        }
        return NextResponse.json({ success: true });
    }

    //user with no team
    try {
        await prisma.$transaction([
            prisma.adPurchase.create({
                data: {
                    name,
                    email,
                    size,
                    userId: referredById,
                    amount,
                },
            }),
            prisma.user.update({
                where: { id: referredById },
                data: { moneyRaised: { increment: amount } },
            }),
            prisma.derbyStats.update({
                where: { id: year },
                data: { totalRaised: { increment: amount } },
            }),
        ]);
    } catch (error) {
        console.error("Transaction of user with team buying ad falied:", error);
        return NextResponse.json({ error: "Transaction failed" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}

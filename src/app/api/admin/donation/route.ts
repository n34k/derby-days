import { isAdmin } from "@/lib/isAdmin";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../prisma";
import getYear from "@/lib/getYear";

export async function POST(req: NextRequest) {
    if (!isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const {
        name,
        email,
        note = null,
        amount,
        referredByType, // "TEAM" | "USER"
        referredById, // id of team or user
    } = body ?? {};
    const year = getYear();
    // Basic validation
    const amt = Number(amount);
    if (!name || !email) {
        return NextResponse.json(
            { error: "Name and email are required" },
            { status: 400 }
        );
    }
    if (!Number.isFinite(amt) || amt <= 0) {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (referredByType !== "TEAM" && referredByType !== "USER") {
        return NextResponse.json(
            { error: "Invalid referredByType" },
            { status: 400 }
        );
    }
    if (!referredById) {
        return NextResponse.json(
            { error: "referredById is required" },
            { status: 400 }
        );
    }

    // TEAM referral: credit team only
    if (referredByType === "TEAM") {
        try {
            await prisma.$transaction([
                prisma.donation.create({
                    data: {
                        name,
                        email,
                        note,
                        amount: amt,
                        teamId: referredById,
                    },
                }),
                prisma.team.update({
                    where: { id: referredById },
                    data: { moneyRaised: { increment: amt } },
                }),
                prisma.derbyStats.update({
                    where: { id: year },
                    data: { totalRaised: { increment: amount } },
                }),
            ]);
            return NextResponse.json({ success: true });
        } catch (error) {
            console.error("Transaction (team donation) failed:", error);
            return NextResponse.json(
                { error: "Transaction failed" },
                { status: 500 }
            );
        }
    }

    // USER referral: if the user has a team, credit both; else credit user only
    try {
        const user = await prisma.user.findUnique({
            where: { id: referredById },
            select: { teamId: true },
        });

        if (user?.teamId) {
            // User WITH team → create donation (with userId + teamId) and credit both
            await prisma.$transaction([
                prisma.donation.create({
                    data: {
                        name,
                        email,
                        note,
                        amount: amt,
                        userId: referredById,
                        teamId: user.teamId,
                    },
                }),
                prisma.team.update({
                    where: { id: user.teamId },
                    data: { moneyRaised: { increment: amt } },
                }),
                prisma.user.update({
                    where: { id: referredById },
                    data: { moneyRaised: { increment: amt } },
                }),
                prisma.derbyStats.update({
                    where: { id: year },
                    data: { totalRaised: { increment: amount } },
                }),
            ]);
            return NextResponse.json({ success: true });
        }

        // User WITHOUT team → create donation (with userId) and credit user only
        await prisma.$transaction([
            prisma.donation.create({
                data: {
                    name,
                    email,
                    note,
                    amount: amt,
                    userId: referredById,
                },
            }),
            prisma.user.update({
                where: { id: referredById },
                data: { moneyRaised: { increment: amt } },
            }),
            prisma.derbyStats.update({
                where: { id: year },
                data: { totalRaised: { increment: amount } },
            }),
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Transaction (user donation) failed:", error);
        return NextResponse.json(
            { error: "Transaction failed" },
            { status: 500 }
        );
    }
}

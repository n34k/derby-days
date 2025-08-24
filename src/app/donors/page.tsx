import AdDisplay from "@/section/AdDisplay";
import RecentDonations from "@/section/RecentDonations";
import React from "react";
import { prisma } from "../../../prisma";

const DonorsPage = async () => {
    const ads = await prisma.adPurchase.findMany({
        where: { adUrl: { not: null } },
        orderBy: { createdAt: "desc" },
    });

    const donationsByAmount = await prisma.donation.findMany({
        orderBy: { amount: "desc" },
    });

    const donationsByLatest = await prisma.donation.findMany({
        orderBy: { createdAt: "desc" },
    });

    const donationsByEarliest = await prisma.donation.findMany({
        orderBy: { createdAt: "asc" },
    });

    const donations = {
        amount: donationsByAmount,
        earliest: donationsByEarliest,
        latest: donationsByLatest,
    };

    return (
        <main className="flex flex-col min-h-screen gap-15 py-5 items-center">
            <AdDisplay ads={ads} />
            <RecentDonations donations={donations} />
        </main>
    );
};
export default DonorsPage;

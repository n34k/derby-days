import AdDisplay from "@/section/AdDisplay";
import RecentDonations from "@/section/RecentDonations";
import React from "react";
import { prisma } from "../../../prisma";

const DonorsPage = async () => {
    const ads = await prisma.adPurchase.findMany({
        where: { adUrl: { not: null } },
        orderBy: { createdAt: "desc" },
    });
    return (
        <main className="flex flex-col min-h-screen gap-15 py-5 items-center">
            <AdDisplay ads={ads} />
            <RecentDonations />
        </main>
    );
};
export default DonorsPage;

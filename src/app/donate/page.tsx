import React from "react";

import { HeartIcon } from "@heroicons/react/24/solid";
import DonationWidget from "@/components/DonationWidget";
import AdPurchaseWidget from "@/components/AdPurchaseWidget";
import ShirtPurcahseWidget from "@/components/ShirtPurcahseWidget";
import { prisma } from "../../../prisma";
import getYear from "@/lib/getYear";
import Link from "next/link";

const DonatePage = async () => {
    const year = getYear();
    const derby = await prisma.derbyStats.findUnique({ where: { id: year } });
    const derbyActive = derby?.status !== "COMPLETE";

    return derbyActive ? (
        <div className="flex flex-col py-7.5 items-center">
            <div className="flex items-center gap-3">
                <h1 className="text-4xl md:text-7xl font-bold">Support the Cause</h1>
                <HeartIcon className="w-10 h-10 md:h-18 md:w-18" />
            </div>
            <Link
                className="text-blue-600 underline mb-2"
                href={"/disclosures"}
            >
                Disclosures and Policies
            </Link>

            <div className="flex flex-col items-center justify-center gap-10 md:flex-row md:gap-25">
                <AdPurchaseWidget />
                <DonationWidget />
                <ShirtPurcahseWidget />
            </div>
        </div>
    ) : (
        <main className="flex items-center justify-center px-4 py-40 text-center">
            <div className="flex flex-col gap-5 items-center justify-center rounded-lg border border-secondary bg-primary py-5 px-10">
                <h1 className="font-semibold text-6xl">Derby Days Has Ended</h1>
                <p className="text-lg text-info-content">
                    Thanks for trying to donate. Check back next year around spring time to support the cause!
                </p>
            </div>
        </main>
    );
};

export default DonatePage;

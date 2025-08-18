import React from "react";
import { prisma } from "../../prisma";
import { NewspaperIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

const AdDisplay = async () => {
    const ads = await prisma.adPurchase.findMany({
        where: { adUrl: { not: null } },
        orderBy: { createdAt: "desc" },
    });

    const fullPageAds = ads.filter((ad) => ad.size === "Full Page");
    const halfPageAds = ads.filter((ad) => ad.size === "Half Page");
    const quarterPageAds = ads.filter((ad) => ad.size === "Quarter Page");
    const businessCardAds = ads.filter((ad) => ad.size === "Business Card");

    const adSections = [
        { title: "Full Page Ads", ads: fullPageAds, size: 400 },
        { title: "Half Page Ads", ads: halfPageAds, size: 300 },
        { title: "Quarter Page Ads", ads: quarterPageAds, size: 200 },
        { title: "Business Cards", ads: businessCardAds, size: 200 },
    ];

    return (
        <div className="flex flex-col items-center justify-center w-5/6">
            <div className="flex items-center gap-3 mb-6">
                <h1 className="text-4xl md:text-7xl font-bold">Ads</h1>
                <NewspaperIcon className="w-10 h-10 md:h-20 md:w-20" />
            </div>

            {adSections.map(({ title, ads, size }) => (
                <div key={title} className="text-center mb-10 w-full">
                    <h2 className="text-info-content text-2xl md:text-4xl mb-4">
                        {title}
                    </h2>
                    <div className="flex flex-wrap justify-center gap-5">
                        {ads.map((ad) => (
                            <div key={ad.id} className="max-w-full">
                                <Image
                                    src={ad.adUrl!}
                                    alt="Ad"
                                    className="object-contain rounded mx-auto"
                                    height={size}
                                    width={size}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdDisplay;

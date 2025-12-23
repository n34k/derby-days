"use client";
import React, { useState } from "react";
import { NewspaperIcon } from "@heroicons/react/24/solid";
import { $Enums, AdPurchase } from "@/generated/prisma";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Link from "next/link";
import { CldImage } from "next-cloudinary";

type AdDisplayProps = {
    ads: AdPurchase[];
};

const AdDisplay = ({ ads }: AdDisplayProps) => {
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

    const fullPageAds = ads.filter((ad) => ad.size === $Enums.AdSize.FULL_PAGE);
    const halfPageAds = ads.filter((ad) => ad.size === $Enums.AdSize.HALF_PAGE);
    const quarterPageAds = ads.filter((ad) => ad.size === $Enums.AdSize.QUARTER_PAGE);
    const businessCardAds = ads.filter((ad) => ad.size === $Enums.AdSize.BUSINESS_CARD);
    const coverAds = ads.filter(
        (ad) =>
            ad.size === $Enums.AdSize.CENTER_FOLDOUT ||
            ad.size === $Enums.AdSize.INSIDE_BACK_COVER ||
            ad.size === $Enums.AdSize.OUTSIDE_BACK_COVER ||
            ad.size === $Enums.AdSize.INSIDE_FRONT_COVER
    );
    const twoPageAds = ads.filter((ad) => ad.size === $Enums.AdSize.TWO_PAGES);

    console.log("fullpage", fullPageAds);

    console.log(businessCardAds);

    const adSections = [
        { title: "Cover Ads", ads: coverAds, size: 400 },
        { title: "Two Page Ads", ads: twoPageAds, size: 600 },
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
            {ads.length > 0 ? (
                adSections.map(
                    ({ title, ads, size }) =>
                        ads.length > 0 && (
                            <div
                                key={title}
                                className="text-center mb-10 w-full"
                            >
                                <h2 className="text-info-content text-2xl md:text-4xl mb-4">{title}</h2>

                                <div className="flex flex-wrap justify-center gap-5">
                                    {ads.map((ad) => (
                                        <div
                                            key={ad.id}
                                            className="max-w-full"
                                        >
                                            <CldImage
                                                src={ad.adUrl!}
                                                alt="Ad"
                                                className="object-contain rounded mx-auto cursor-pointer"
                                                height={size}
                                                width={size}
                                                onClick={() => setLightboxSrc(ad.adUrl!)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                )
            ) : (
                <Link href="/donate">
                    <p className="text-info-content cursor-pointer transition duration-300 transform hover:scale-110 hover:text-secondary">
                        Be the first to purchase.
                    </p>
                </Link>
            )}

            {/* Single lightbox for the page */}
            <Lightbox
                open={!!lightboxSrc}
                close={() => setLightboxSrc(null)}
                slides={lightboxSrc ? [{ src: lightboxSrc }] : []}
                plugins={[Zoom]}
                zoom={{ maxZoomPixelRatio: 2.5, scrollToZoom: true }}
                carousel={{ finite: true }}
                render={{ buttonPrev: () => null, buttonNext: () => null }}
            />
        </div>
    );
};

export default AdDisplay;

import Link from "next/link";
import React from "react";

import { prisma } from "../../prisma";
import InfoCircle from "./modals/InfoCircle";

const AdPurchaseWidget = async () => {
    const ads = await prisma.product.findMany({
        where: { category: "ad" },
        orderBy: { price: "desc" },
    });

    return (
        <div className="w-[320px] h-[450px] flex flex-col items-center justify-evenly bg-primary p-5 rounded-2xl border-1 border-secondary shadow-lg">
            <div className="flex flex-col text-center">
                <div className="flex flex-row items-center gap-1">
                    <h1 className="text-4xl font-bold text-secondary">Purchase Ad</h1>
                    <InfoCircle>
                        Ads will be displayed in the Derby Days Ad book and the Donors page. Email fresnoderbydays
                        @gmail.com for questions.
                    </InfoCircle>
                </div>
                <p className="text-info-content text-sm md:text-base">CHOOSE SIZE</p>
                <a
                    className="text-blue-600 underline"
                    href="https://drive.google.com/file/d/1SAJET5ydK-mcOxIEEmGiK8j58JbLk_T9/view?usp=sharing"
                    target="_blank"
                >
                    See Past Ad Book
                </a>
            </div>
            <div className="flex flex-col gap-7.5">
                {Object.values(ads).map((ad) => (
                    <Link
                        key={ad.priceId}
                        href={`/checkout/${ad.priceId}`}
                        className="btn btn-secondary btn-lg p-3 transition duration-300 hover:text-secondary hover:scale-110"
                    >
                        {ad.name}: ${ad.price / 100}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AdPurchaseWidget;

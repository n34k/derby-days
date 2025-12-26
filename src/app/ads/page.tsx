import React from "react";
import { prisma } from "../../../prisma";
import Link from "next/link";
import adSizeDisplay from "@/lib/adSizeDisplay";

const AdsPage = async () => {
    const ads = await prisma.ad.findMany({
        orderBy: { price: "desc" },
        where: {
            OR: [{ quantityAvailable: null }, { quantityAvailable: { gt: 0 } }],
        },
    });

    return (
        <div className="p-10 space-y-8">
            {/* Header */}
            <div className="bg-primary border-1 rounded-2xl p-8 text-center">
                <h1 className="text-4xl md:text-7xl font-bold mb-3">Purchase Ads</h1>
                <p className="text-info-content text-lg mb-3 md:text-xl">View available ad sizes and prices below.</p>

                {/* Table container */}
                <div className="overflow-x-auto">
                    <table className="table w-full border border-base-content">
                        <thead className="bg-base-200 text-base-content">
                            <tr>
                                <th className="border px-4 py-3 text-left text-lg">Ad Size</th>
                                <th className="border px-4 py-3 text-left text-lg">Price</th>
                                <th className="border px-4 py-3 text-left text-lg">Dimensions (inches)</th>
                                <th className="border px-4 py-3 text-center text-lg">Purchase</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ads.map((ad) => (
                                <tr
                                    key={ad.productId}
                                    className="hover:bg-base-200 transition"
                                >
                                    <td className="border px-4 py-3 font-medium">{adSizeDisplay(ad.size)}</td>

                                    <td className="border px-4 py-3">${(ad.price / 100).toLocaleString()}</td>

                                    <td className="border px-4 py-3">{ad.sizeInches}</td>

                                    <td className="border px-4 py-3 text-center">
                                        <Link
                                            href={`/checkout/${ad.priceId}`}
                                            className="btn btn-secondary btn-md hover:scale-105 transition"
                                        >
                                            Purchase
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdsPage;

"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import adSizeDisplay from "@/lib/adSizeDisplay";
import { Ad } from "@/generated/prisma";

const AdsPage = () => {
    const router = useRouter();

    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch("/api/ad/available", { cache: "no-store" });
                if (!res.ok) throw new Error(`Request failed: ${res.status}`);

                const data = (await res.json()) as Ad[];
                if (!cancelled) setAds(data);
            } catch (e) {
                if (!cancelled) setError(`Failed to load ads: ${e}`);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const rows = useMemo(() => ads, [ads]);

    return (
        <div className="my-6 px-4 space-y-8 flex justify-center">
            <div className="bg-primary border-1 rounded-2xl p-8 text-center w-full max-w-md md:max-w-xl">
                <h1 className="text-4xl md:text-3xl font-bold mb-3">Purchase Ads</h1>
                <p className="text-info-content text-lg mb-3 md:text-md">
                    Ad purchasers may display their ad on this website’s Donors Page and in the official Derby Days
                    book. All ad purchasers will also receive a complimentary copy of the Derby Days book. View
                    available ad sizes and pricing below.
                </p>
                <p className="text-info-content text-lg mb-3 md:text-md">
                    After purchasing, please email your ad to fresnoderbydays@gmail.com
                </p>
                <div className="overflow-x-auto">
                    <table className="table w-full border border-base-content">
                        <thead className="bg-base-200 text-base-content">
                            <tr>
                                <th className="border p-2 text-left text-lg">Size</th>
                                <th className="border p-2 text-left text-lg">Price</th>
                                <th className="border p-2 text-left text-lg">Dimensions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading && (
                                <tr>
                                    <td
                                        className="border p-2"
                                        colSpan={3}
                                    >
                                        Loading…
                                    </td>
                                </tr>
                            )}

                            {!loading && error && (
                                <tr>
                                    <td
                                        className="border p-2 text-error"
                                        colSpan={3}
                                    >
                                        {error}
                                    </td>
                                </tr>
                            )}

                            {!loading && !error && rows.length === 0 && (
                                <tr>
                                    <td
                                        className="border p-2"
                                        colSpan={3}
                                    >
                                        No ads available right now.
                                    </td>
                                </tr>
                            )}

                            {!loading &&
                                !error &&
                                rows.map((ad) => (
                                    <tr
                                        key={ad.productId}
                                        className="hover:bg-base-200 cursor-pointer transition"
                                        role="link"
                                        tabIndex={0}
                                        onClick={() => router.push(`/checkout/${ad.priceId}`)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                router.push(`/checkout/${ad.priceId}`);
                                            }
                                        }}
                                    >
                                        <td className="border p-2 font-medium">{adSizeDisplay(ad.size)}</td>
                                        <td className="border p-2">${(ad.price / 100).toLocaleString()}</td>
                                        <td className="border p-2">{ad.sizeInches}</td>
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

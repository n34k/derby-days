// src/components/TotalRaisedDisplay.tsx
import React from "react";
import { prisma } from "../../prisma";
import { HeartIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { formatUSD } from "@/lib/formatUSD";

const TotalRaisedDisplay = async () => {
    const stats = await prisma.derbyStats.findFirst({
        select: { totalRaised: true },
    });

    if (!stats) return null;

    const pretty = formatUSD(stats.totalRaised);

    return (
        <section className="relative w-full">
            <div className="mx-auto w-11/12 md:w-5/6">
                <div className="flex flex-col items-center text-center gap-6">
                    {/* Big number */}
                    <div className="relative">
                        <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-secondary to-primary opacity-30 blur-xl" />
                        <div className="relative rounded-2xl bg-base-100 px-8 py-6 md:px-12 md:py-8 ring-1 ring-base-content/10">
                            <span className="block text-sm uppercase tracking-widest text-base-content/60">
                                Total Raised
                            </span>
                            <span className="mt-1 block text-7xl md:text-9xl font-black tabular-nums">
                                {pretty}
                            </span>
                        </div>
                    </div>

                    {/* CTAs */}
                    <div className="mt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href="/donate"
                            className="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-3 
                           font-semibold text-secondary-content shadow-lg hover:shadow-xl
                           hover:brightness-110 transition"
                        >
                            <HeartIcon className="h-5 w-5" />
                            Donate Now
                        </Link>
                    </div>

                    <p className="text-xs text-base-content/50">
                        Every dollar helps us write the next chapter of Derby
                        Days.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default TotalRaisedDisplay;

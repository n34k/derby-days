"use client";
import React, { useState } from "react";
import { formatUSD } from "@/lib/formatUSD";
import greekLetters from "@/lib/greekLetters";
import CloudOrNextImg from "./CloudOrNextImg";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

interface BrotherStandingsProps {
    userStats: {
        image: string | null;
        name: string | null;
        id: string;
        moneyRaised: number;
        teamId: string | null;
    }[];
}

const BrotherStandings = ({ userStats }: BrotherStandingsProps) => {
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

    return (
        <div className="md:h-[70vh] overflow-y-auto bg-primary rounded-lg border flex flex-col items-center px-2 py-4 md:p-10 shadow-lg">
            <h1 className="text-3xl text-center font-bold mb-2 text-base-content">Brother Standings</h1>

            <div className="rounded-lg overflow-scroll bg-base-200">
                {/* Header row */}
                <div className="grid grid-cols-5 text-sm md:text-base font-semibold text-base-content/70 bg-base-300 px-4 py-2">
                    <p>#</p>
                    <p>Pic</p>
                    <p>Name</p>
                    <p className="text-center">Team</p>
                    <p className="text-right">Raised</p>
                </div>

                {/* Data rows */}
                <div className="divide-y divide-base-300">
                    {userStats.map((stats, idx) => {
                        const moneyColor = stats.moneyRaised ? "text-success" : "text-error";

                        return (
                            <div
                                key={stats.id}
                                className="grid grid-cols-5 items-center px-4 py-2 text-base-content"
                            >
                                <p>{idx + 1}</p>
                                {stats.image ? (
                                    <div onClick={() => setLightboxSrc(stats.image!)}>
                                        <CloudOrNextImg
                                            src={stats.image}
                                            cloud={stats.image.includes("cloudinary")}
                                            alt={`${stats.name} Picture`}
                                            size={500}
                                            className="rounded-full w-[40px] h-[40px] border-1 border-info-content cursor-pointer"
                                        />
                                    </div>
                                ) : (
                                    "—"
                                )}
                                <p>{stats.name}</p>
                                <p className="text-center">{stats.teamId ? greekLetters(stats.teamId) : "-"}</p>
                                <p className={`text-right font-semibold ${moneyColor}`}>
                                    {formatUSD(stats.moneyRaised)}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
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

export default BrotherStandings;

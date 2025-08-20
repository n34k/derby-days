import React from "react";
import { prisma } from "../../prisma";
import { formatUSD } from "@/lib/formatUSD";
import greekLetters from "@/lib/greekLetters";

const BrotherStandings = async () => {
    const userStats = await prisma.user.findMany({
        select: { name: true, moneyRaised: true, teamId: true },
        orderBy: { moneyRaised: "desc" },
    });

    return (
        <div className="md:h-[70vh] overflow-y-auto bg-primary rounded-lg border border-secondary flex flex-col items-center p-5 md:p-10 shadow-lg">
            <h1 className="text-3xl text-center font-bold mb-8 text-base-content">
                Brother Standings
            </h1>

            <div className="rounded-lg overflow-scroll bg-base-200">
                {/* Header row */}
                <div className="grid grid-cols-4 text-sm md:text-base font-semibold text-base-content/70 bg-base-300 px-4 py-2">
                    <p>#</p>
                    <p>Name</p>
                    <p className="text-center">Team</p>
                    <p className="text-right">Raised</p>
                </div>

                {/* Data rows */}
                <div className="divide-y divide-base-300">
                    {userStats.map((stats, idx) => {
                        const moneyColor = stats.moneyRaised
                            ? "text-success"
                            : "text-error";

                        return (
                            <div
                                key={stats.name}
                                className="grid grid-cols-4 items-center px-4 py-2 text-base-content"
                            >
                                <p>{idx + 1}</p>
                                <p>{stats.name}</p>
                                <p className="text-center">
                                    {stats.teamId
                                        ? greekLetters(stats.teamId)
                                        : "-"}
                                </p>
                                <p
                                    className={`text-right font-semibold ${moneyColor}`}
                                >
                                    {formatUSD(stats.moneyRaised)}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default BrotherStandings;

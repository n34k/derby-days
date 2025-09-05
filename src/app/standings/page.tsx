import LeaderBoard from "@/components/LeaderBoard";
import React from "react";
import { ChartBarIcon } from "@heroicons/react/24/solid";
import { prisma } from "../../../prisma";
import { getWeeklyRaised } from "@/lib/getWeeklyRaised";

const StandingsPage = async () => {
    const points = await prisma.team.findMany({
        select: {
            id: true,
            points: true,
        },
        orderBy: { points: "desc" },
    });

    const tshirtsSold = await prisma.team.findMany({
        select: {
            id: true,
            tshirtsSold: true,
        },
        orderBy: { tshirtsSold: "desc" },
    });

    const moneyRaised = await getWeeklyRaised();

    return (
        <main className="flex flex-col gap-15 py-15 items-center">
            {points ? (
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl md:text-7xl font-bold">
                            Live Standings
                        </h1>
                        <ChartBarIcon className="w-10 h-10 md:h-20 md:w-20" />
                    </div>
                    <div className="flex flex-col gap-30 items-center">
                        <LeaderBoard metric="points" data={points} />
                        <LeaderBoard metric="tshirtsSold" data={tshirtsSold} />
                        <LeaderBoard metric="moneyRaised" data={moneyRaised} />
                    </div>
                </div>
            ) : (
                <div className="flex flex-1 items-center justify-center">
                    <p className="text-2xl">STANDINGS COMING SOON</p>
                </div>
            )}
        </main>
    );
};

export default StandingsPage;

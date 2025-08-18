import { LeaderboardMetric, LeaderboardLabels } from "@/models/LeaderboardKeys";
import React from "react";
import { prisma } from "../../prisma";
import {
    ShoppingBagIcon,
    StarIcon,
    CurrencyDollarIcon,
} from "@heroicons/react/24/solid";
import { JSX } from "react";
import greekLetters from "@/lib/greekLetters";

type LeaderBoardProps = {
    metric: LeaderboardMetric;
};

const MetricIcons: Record<LeaderboardMetric, JSX.Element> = {
    tshirtsSold: <ShoppingBagIcon className="h-8 w-8 text-secondary" />,
    points: <StarIcon className="h-8 w-8 text-secondary" />,
    moneyRaised: <CurrencyDollarIcon className="h-8 w-8 text-secondary" />,
};

async function LeaderBoard({ metric }: LeaderBoardProps) {
    const teams = await prisma.team.findMany({
        select: {
            id: true,
            name: true,
            tshirtsSold: true,
            points: true,
            moneyRaised: true,
        },
        orderBy: { [metric]: "desc" },
    });

    return (
        <div className="flex flex-col items-center justify-center gap-5">
            <div className="flex items-center justify-center gap-3">
                {MetricIcons[metric]}
                <h1 className="text-4xl font-bold text-secondary">
                    {LeaderboardLabels[metric]}
                </h1>
                {MetricIcons[metric]}
            </div>
            <hr className="w-[97.5vw] border-t border-neutral" />
            <div className="flex flex-col gap-10 text-2xl md:text-4xl">
                {teams.map((team, index) => (
                    <div
                        key={team.id}
                        className="flex flex-col md:flex-row items-center justify-between text-center gap-4 w-[75vw] md:w-[50rem]"
                    >
                        {/* This container holds the rank and name for mobile */}
                        <div className="md:hidden text-5xl">
                            {index + 1}. {greekLetters(team.id)}
                        </div>

                        {/* Desktop-only layout: number and name split */}
                        <div className="hidden md:flex md:flex-row md:justify-between md:gap-5 md:items-center md:text-center w-full">
                            <span className="flex-1 text-left text-4xl">
                                {index + 1}.
                            </span>
                            <span className="flex-1 text-center text-4xl">
                                {greekLetters(team.id)}
                            </span>
                            <span className="flex-1 text-right text-4xl text-success">
                                {metric === "moneyRaised"
                                    ? `$${(team[metric] as number).toFixed(2)}`
                                    : team[metric]}
                            </span>
                        </div>
                        {/* Mobile-only metric below name */}
                        <div className="md:hidden text-5xl text-success">
                            {metric === "moneyRaised"
                                ? `$${(team[metric] as number).toFixed(2)}`
                                : team[metric]}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LeaderBoard;

"use client";
import {
    LeaderboardMetric,
    LeaderboardLabels,
    MoneyRaisedOptions,
    MoneyRaisedOption,
    LeaderBoardRow,
} from "@/models/LeaderboardKeys";
import React, { useMemo, useState } from "react";
import {
    ShoppingBagIcon,
    StarIcon,
    CurrencyDollarIcon,
} from "@heroicons/react/24/solid";
import { JSX } from "react";
import greekLetters from "@/lib/greekLetters";
import SortBy from "./SortBy";

type LeaderBoardProps = {
    metric: LeaderboardMetric;
    data: LeaderBoardRow[];
};

const MetricIcons: Record<LeaderboardMetric, JSX.Element> = {
    tshirtsSold: (
        <ShoppingBagIcon className="h-8 w-8 md:h-12 md:w-12 text-secondary" />
    ),
    points: <StarIcon className="h-8 w-8 md:h-12 md:w-12 text-secondary" />,
    moneyRaised: (
        <CurrencyDollarIcon className="h-8 w-8 md:h-12 md:w-12 text-secondary" />
    ),
};

function LeaderBoard({ metric, data }: LeaderBoardProps) {
    const [moneyRaisedFilter, changeRaisedMoneyFilter] =
        useState<MoneyRaisedOption>("Overall");

    const moneySortChange = (val: MoneyRaisedOption) => {
        changeRaisedMoneyFilter(val);
    };

    const sorted = useMemo(() => {
        const copy = [...data];
        if (metric === "moneyRaised") {
            const key = moneyRaisedFilter === "Overall" ? "overall" : "week";
            copy.sort(
                (a, b) =>
                    (b.moneyRaised?.[key] ?? 0) - (a.moneyRaised?.[key] ?? 0)
            );
        } else {
            copy.sort((a, b) => (b[metric] ?? 0) - (a[metric] ?? 0));
        }
        return copy;
    }, [data, metric, moneyRaisedFilter]);

    return (
        <div className="flex flex-col items-center justify-center gap-5">
            <div className="flex-col justify-center items-center">
                <div className="flex items-center gap-3">
                    {MetricIcons[metric]}
                    <h1 className="text-4xl md:text-6xl font-bold text-secondary">
                        {LeaderboardLabels[metric]}
                    </h1>
                    {MetricIcons[metric]}
                </div>

                <div className="flex justify-center mt-3">
                    <div className="w-1/2">
                        {metric === "moneyRaised" && (
                            <SortBy
                                options={MoneyRaisedOptions}
                                handleChange={moneySortChange}
                                value={moneyRaisedFilter}
                            />
                        )}
                    </div>
                </div>
            </div>

            <hr className="w-[97.5vw] border-t border-neutral" />

            <div className="flex flex-col items-center gap-10 text-2xl md:text-4xl">
                {sorted.map((d, index: number) => {
                    // derive the displayed value from the same filter used for sorting
                    const numericValue =
                        metric === "moneyRaised"
                            ? moneyRaisedFilter === "Overall"
                                ? d.moneyRaised?.overall ?? 0
                                : d.moneyRaised?.week ?? 0
                            : ((d[metric] ?? 0) as number);

                    const formattedValue =
                        metric === "moneyRaised"
                            ? `$${numericValue.toFixed(0)}`
                            : numericValue;

                    return (
                        <div
                            key={d.id}
                            className="flex flex-col md:flex-row items-center justify-between text-center gap-4 w-[75vw]"
                        >
                            {/* This container holds the rank and name for mobile */}
                            <div className="md:hidden text-5xl">
                                {index + 1}. {greekLetters(d.id)}
                            </div>

                            {/* Desktop-only layout: number and name split */}
                            <div className="hidden md:flex w-full">
                                <span className="flex-1 text-left text-6xl">
                                    {index + 1}.
                                </span>
                                <span className="flex-1 text-center text-6xl">
                                    {greekLetters(d.id)}
                                </span>
                                <span className="flex-1 text-right text-6xl text-success">
                                    {formattedValue}
                                </span>
                            </div>

                            {/* Mobile-only metric below name */}
                            <div className="md:hidden text-5xl text-success">
                                {formattedValue}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default LeaderBoard;

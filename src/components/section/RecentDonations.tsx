"use client";
import { CurrencyDollarIcon } from "@heroicons/react/24/solid";
import SortBy from "@/components/SortBy";
import { DonationFilterOption, DonationFilterOptions } from "@/models/donationTypes";
import { useState } from "react";
import { Donation } from "@/generated/prisma";
import Link from "next/link";
import greekLetters from "@/lib/greekLetters";

interface RecentDonationsProps {
    donations: {
        amount: Donation[];
        earliest: Donation[];
        latest: Donation[];
    };
}

const RecentDonations = ({ donations }: RecentDonationsProps) => {
    const latest = donations.latest;
    const amount = donations.amount;
    const earliest = donations.earliest;

    const [donationSortFilter, setDonationSortFilter] = useState<DonationFilterOption>("Latest");
    const [displayedDontations, setDisplayedDonations] = useState<Donation[]>(donations.latest);

    const handleSortChange = (val: DonationFilterOption) => {
        console.log("VAL", val);

        setDonationSortFilter(val);

        switch (val) {
            case "Latest":
                setDisplayedDonations(latest);
                break;
            case "Earliest":
                setDisplayedDonations(earliest);
                break;
            case "Amount":
                setDisplayedDonations(amount);
                break;
        }
    };

    return (
        <div>
            <div className="flex flex-col items-center mb-4">
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl md:text-7xl font-bold">Live Donations</h1>
                    <CurrencyDollarIcon className="w-10 h-10 md:h-20 md:w-20" />
                </div>
                <div className="w-1/2">
                    <SortBy
                        options={DonationFilterOptions}
                        handleChange={handleSortChange}
                        value={donationSortFilter}
                    />
                </div>
            </div>
            {donations.amount.length !== 0 ? (
                <div className="flex flex-col gap-10">
                    {displayedDontations.map((d) => (
                        <div
                            className="flex flex-col items-center justify-center"
                            key={d.id}
                        >
                            <p className="text-3xl">{d.name}</p>

                            <div className="flex flex-row gap-2">
                                <p className="text-3xl text-info-content">
                                    {new Date(d.createdAt).toLocaleDateString("en-US", {
                                        month: "numeric",
                                        day: "numeric",
                                        year: "2-digit",
                                    })}
                                </p>
                                {d.teamId && <p className="text-3xl text-info-content">| {greekLetters(d.teamId)}</p>}
                            </div>

                            <p className="text-success text-3xl font-bold">${d.amount}</p>
                            {d.note && <p className="text-3xl">&quot;{d.note}&quot;</p>}
                        </div>
                    ))}
                </div>
            ) : (
                <Link
                    href="/donate"
                    className="flex justify-center"
                >
                    <p className="text-info-content cursor-pointer transition duration-300 transform hover:scale-110 hover:text-secondary">
                        No donations yet, be the first to donate!
                    </p>
                </Link>
            )}
        </div>
    );
};

export default RecentDonations;

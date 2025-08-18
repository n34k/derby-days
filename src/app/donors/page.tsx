import AdDisplay from "@/section/AdDisplay";
import RecentDonations from "@/section/RecentDonations";
import React from "react";

const DonorsPage = () => {
    return (
        <main className="flex flex-col min-h-screen gap-15 py-15 items-center">
            <AdDisplay />
            <RecentDonations />
        </main>
    );
};
export default DonorsPage;

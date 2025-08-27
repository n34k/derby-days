import AvailableBrothers from "@/components/AvailableBrothers";
import DraftBoard from "@/components/DraftBoard";
import React from "react";

const DraftPage = async () => {
    const year = String(new Date().getFullYear());
    return (
        <main className="flex flex-col justify-evenly gap-5 items-center py-5">
            <h1 className="font-extrabold text-4xl md:text-6xl text-center">
                {year} Derby Days Draft
            </h1>
            <DraftBoard draftId={year} />
            <AvailableBrothers draftId={year} isAdmin={false} />
        </main>
    );
};

export default DraftPage;

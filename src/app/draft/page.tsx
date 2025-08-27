import AvailableBrothers from "@/components/AvailableBrothers";
import React from "react";

const DraftPage = async () => {
    return (
        <main className="flex justify-center py-5">
            <AvailableBrothers draftId="2025" isAdmin={false} />
        </main>
    );
};

export default DraftPage;

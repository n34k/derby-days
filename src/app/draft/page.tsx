import AvailableBrothers from "@/components/AvailableBrothers";
import DraftBoard from "@/components/DraftBoard";
import DraftHeader from "@/components/DraftHeader";
import React from "react";
import { prisma } from "../../../prisma";

const DraftPage = async () => {
    const year = String(new Date().getFullYear());
    const teams = await prisma.team.findMany();
    const draft = await prisma.draft.findUnique({ where: { id: year } });
    const draftStatus = draft?.status;

    return (
        <main className="flex flex-col justify-evenly gap-5 items-center py-5">
            <h1 className="font-extrabold text-4xl md:text-6xl text-center">
                {year} Derby Days Draft
            </h1>
            {(draftStatus && draftStatus === "NOT_STARTED") ||
            draftStatus === "ONGOING" ? (
                <DraftHeader draftId={year} teams={teams} />
            ) : (
                <></>
            )}
            <DraftBoard draftId={year} />
            <AvailableBrothers draftId={year} isAdmin={false} />
        </main>
    );
};

export default DraftPage;

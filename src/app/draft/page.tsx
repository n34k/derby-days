import AvailableBrothers from "@/components/draft/AvailableBrothers";
import DraftBoard from "@/components/draft/DraftBoard";
import DraftHeader from "@/components/draft/DraftHeader";
import React from "react";
import { prisma } from "../../../prisma";
import PickAnimation from "@/components/draft/PickAnimation";
import { RealtimeProvider } from "@/components/providers/RealtimeProvider";

const DraftPage = async () => {
    const year = new Date().getFullYear().toString();

    const [teams, draft] = await Promise.all([
        prisma.team.findMany(),
        prisma.draft.findUnique({ where: { id: year } }),
    ]);

    const draftStatus = draft?.status;
    const draftExists = !!draftStatus;
    const draftOpen = draftStatus !== "COMPLETE";

    return (
        <RealtimeProvider>
            <main className="flex flex-col justify-evenly gap-5 items-center py-5">
                <PickAnimation draftId={year} />
                <h1 className="font-extrabold text-4xl md:text-6xl text-center">
                    {year} Derby Days Draft
                </h1>
                {!draftExists ? (
                    <div className="text-info-content mt-65">
                        DRAFT INFORMATION COMING SOON
                    </div>
                ) : (
                    <>
                        {draftOpen && (
                            <DraftHeader draftId={year} teams={teams} />
                        )}
                        <DraftBoard draftId={year} />
                        {draftOpen && (
                            <AvailableBrothers draftId={year} isAdmin={false} />
                        )}
                    </>
                )}
            </main>
        </RealtimeProvider>
    );
};

export default DraftPage;

import React from "react";
import DraftOrderEdit from "./DraftOrderEdit";
import { prisma } from "../../../prisma";
import CreateDraftButton from "./CreateDraftButton";
import DraftDeleteButton from "./DraftDeleteButton";
import DraftStartButton from "./DraftStartButton";
import AvailableBrothersTable from "./AvailableBrothers";
import getYear from "@/lib/getYear";

const AdminDraftControl = async () => {
    const year = getYear();
    const draftCreatedThisYear = await prisma.draft.findUnique({
        //admin can only create draft once per year
        where: { id: year },
    });

    const derbyCreatedThisYear = await prisma.derbyStats.findUnique({
        where: { id: year },
    });

    const teams = await prisma.team.findMany();

    let allTeamsHaveHeadCoachAndDd = true;

    for (const team of teams) {
        if (!team.headCoachId || !team.derbyDarlingName) {
            allTeamsHaveHeadCoachAndDd = false;
            break;
        }
    }

    let draftStatus;

    if (draftCreatedThisYear) {
        draftStatus = draftCreatedThisYear.status;
    }

    return (
        draftStatus !== "COMPLETE" &&
        derbyCreatedThisYear && (
            <div className="flex justify-center items-center bg-primary border rounded-2xl p-5 w-[90vw]">
                {!draftCreatedThisYear && <CreateDraftButton ddAndCoach={allTeamsHaveHeadCoachAndDd} />}
                {draftCreatedThisYear && draftStatus === "NOT_STARTED" ? (
                    <div className="flex flex-col items-center gap-5">
                        <h1 className="font-bold text-4xl">Pre Draft Controls</h1>
                        <DraftOrderEdit draft={draftCreatedThisYear} />
                        <DraftStartButton />
                        <DraftDeleteButton />
                    </div>
                ) : (
                    <></>
                )}
                {draftCreatedThisYear && draftStatus === "ONGOING" ? (
                    <AvailableBrothersTable
                        draftId={year}
                        numberTeams={teams.length}
                    />
                ) : (
                    <></>
                )}
            </div>
        )
    );
};

export default AdminDraftControl;

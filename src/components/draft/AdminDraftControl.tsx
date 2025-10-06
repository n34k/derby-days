import React from "react";
import DraftOrderEdit from "./DraftOrderEdit";
import { prisma } from "../../../prisma";
import CreateDraftButton from "./CreateDraftButton";
import DraftDeleteButton from "./DraftDeleteButton";
import DraftStartButton from "./DraftStartButton";
import AvailableBrothersTable from "./AvailableBrothers";
import { isAdmin } from "@/lib/isAdmin";
import getYear from "@/lib/getYear";

const AdminDraftControl = async () => {
    const admin = await isAdmin();
    const year = getYear();
    const draftCreatedThisYear = await prisma.draft.findUnique({
        //admin can only create draft once per year
        where: { id: year },
    });

    let draftStatus;

    if (draftCreatedThisYear) {
        draftStatus = draftCreatedThisYear.status;
    }

    return (
        <div className="flex justify-center items-center bg-primary border-1 border-secondary rounded-2xl p-5 w-[90vw]">
            {!draftCreatedThisYear && <CreateDraftButton />}
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
                <AvailableBrothersTable isAdmin={admin} draftId={year} />
            ) : (
                <></>
            )}
        </div>
    );
};

export default AdminDraftControl;

import React from "react";

import UpdateUserForm from "@/components/section/UpdateUserForm";
import UserStats from "@/components/UserStats";
import SignOutButton from "@/components/SignOutButton";
import { getUserSessionData } from "@/lib/getUserSessionData";
import BrotherStats from "@/components/BrotherStandings";
import { redirect } from "next/navigation";
import { prisma } from "../../../prisma";

async function AccountPage() {
    const userData = await getUserSessionData();
    if (!userData) {
        redirect("/");
    }

    const userStats = await prisma.user.findMany({
        select: { id: true, name: true, moneyRaised: true, teamId: true, image: true },
        orderBy: { moneyRaised: "desc" },
    });

    return (
        <div className="flex flex-col gap-10 items-center justify-evenly md:flex-row md:px-15 md:pt-15 p-5">
            <div className="flex flex-col items-center gap-2.5">
                <UpdateUserForm
                    initialImage={userData.image || ""}
                    initialName={userData.name}
                    initialWalkoutSong={userData.walkoutSong ?? ""}
                    initialPublicId={userData.imagePublicId}
                    userId={userData.id}
                />
                <SignOutButton />
            </div>
            <UserStats user={userData} />
            <BrotherStats userStats={userStats} />
        </div>
    );
}

export default AccountPage;

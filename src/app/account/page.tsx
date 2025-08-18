import React from "react";

import UpdateUserForm from "@/section/UpdateUserForm";
import UserStats from "@/components/UserStats";
import SignOutButton from "@/components/SignOutButton";
import { getUserSessionData } from "@/lib/getUserSessionData";

async function AccountPage() {
    const userData = await getUserSessionData();

    return (
        <div className="flex flex-col gap-10 items-center justify-evenly md:flex-row md:px-15 md:pt-25 py-5">
            <div className="flex flex-col items-center gap-2.5">
                <UpdateUserForm
                    initialImage={userData.image}
                    initialName={userData.name}
                    initialWalkoutSong={userData.walkoutSong}
                    initialPublicId={userData.imagePublicId}
                />
                <SignOutButton />
            </div>
            <UserStats user={userData} />
        </div>
    );
}

export default AccountPage;

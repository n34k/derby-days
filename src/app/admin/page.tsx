import React from "react";

import AdminPanel from "@/components/section/AdminPanel";
import { getUserSessionData } from "@/lib/getUserSessionData";
import AdminDraftControl from "@/components/draft/AdminDraftControl";

const AdminPage = async () => {
    const userData = await getUserSessionData();
    return (
        <main className="flex justify-center py-15">
            {userData.globalRole === "ADMIN" && (
                <div className="flex flex-col gap-5 items-center">
                    <AdminPanel />
                    <AdminDraftControl />
                </div>
            )}
        </main>
    );
};

export default AdminPage;

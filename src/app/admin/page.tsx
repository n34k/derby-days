import React from "react";

import AdminPanel from "@/section/AdminPanel";
import { getUserSessionData } from "@/lib/getUserSessionData";

const AdminPage = async () => {
    const userData = await getUserSessionData();
    return (
        <main className="flex justify-center py-15">
            {userData.globalRole === "ADMIN" && <AdminPanel />}
        </main>
    );
};

export default AdminPage;

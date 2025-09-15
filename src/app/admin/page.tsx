import React from "react";

import AdminPanel from "@/components/section/AdminPanel";
import AdminDraftControl from "@/components/draft/AdminDraftControl";
import { isAdmin } from "@/lib/isAdmin";
import { redirect } from "next/navigation";

const AdminPage = async () => {
    const admin = await isAdmin();
    console.log("Is admin:", admin);
    if (!admin) {
        redirect("/");
    }

    return (
        <main className="flex justify-center py-15">
            <div className="flex flex-col gap-5 items-center">
                <AdminPanel />
                <AdminDraftControl />
            </div>
        </main>
    );
};

export default AdminPage;

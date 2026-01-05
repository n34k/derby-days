import React from "react";

import AdminPanel from "@/components/section/AdminPanel";
import AdminDraftControl from "@/components/draft/AdminDraftControl";
import { isAdmin } from "@/lib/isAdmin";
import { redirect } from "next/navigation";
import AdminDerbyControl from "@/components/tables/AdminDerbyControl";
import { prisma } from "../../../prisma";
import getYear from "@/lib/getYear";
import { RealtimeProvider } from "@/components/providers/RealtimeProvider";

const AdminPage = async () => {
    const admin = await isAdmin();

    if (!admin) {
        redirect("/");
    }

    const year = getYear();
    const derby = await prisma.derbyStats.findUnique({ where: { id: year } });
    const usersButAdmin = await prisma.user.findMany({
        select: { id: true, name: true },
        where: { globalRole: { not: "ADMIN" } },
    });

    return (
        <RealtimeProvider>
            <main className="flex justify-center py-15">
                <div className="flex flex-col gap-5 items-center">
                    <AdminPanel />
                    <AdminDraftControl />
                    <AdminDerbyControl
                        derby={derby}
                        users={usersButAdmin}
                    />
                </div>
            </main>
        </RealtimeProvider>
    );
};

export default AdminPage;

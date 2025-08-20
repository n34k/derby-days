// AdminPanel.tsx
import { UsersTable } from "@/components/UsersTable";
import { TeamsTable } from "@/components/TeamsTable";
import { prisma } from "../../prisma";
import { auth } from "../../auth";
import { redirect } from "next/navigation";
import { User } from "@/generated/prisma";
import { ProductsTable } from "@/components/ProductTable";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import AdTable from "@/components/AdTable";

const AdminPanel = async () => {
    const session = await auth();
    const user = session?.user as User;

    if (user.globalRole !== "ADMIN") redirect("/");

    const users = await prisma.user.findMany({ include: { team: true } });
    const teams = await prisma.team.findMany({
        include: { headCoach: { select: { id: true, name: true } } },
    });
    const products = await prisma.product.findMany();
    const ads = await prisma.adPurchase.findMany();

    return (
        <div className="flex flex-col bg-primary p-5 rounded-lg border-1 border-secondary gap-5 w-[90vw] h-[70vh] overflow-scroll ">
            <div className="flex self-center items-center gap-3">
                <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                <Cog6ToothIcon className="w-10 h-10" />
            </div>
            <div className="flex flex-col justify-evenly h-full gap-5">
                <UsersTable users={users} />
                <TeamsTable teams={teams} />
                <ProductsTable products={products} />
                <AdTable ads={ads} />
            </div>
        </div>
    );
};

export default AdminPanel;

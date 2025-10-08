// AdminPanel.tsx
import { UsersTable } from "@/components/tables/UsersTable";
import { TeamsTable } from "@/components/tables/TeamsTable";
import { prisma } from "../../../prisma";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import AdTable from "@/components/tables/AdTable";
import ProductsTable from "../tables/ProductTable";
import EmailsTable from "../tables/EmailsTable";
import DonationTable from "../tables/DonationTable";
import getYear from "@/lib/getYear";

const AdminPanel = async () => {
    const year = getYear();

    const users = await prisma.user.findMany({ include: { team: true } });
    const teams = await prisma.team.findMany({
        include: { headCoach: { select: { id: true, name: true } } },
    });
    const products = await prisma.product.findMany();
    const ads = await prisma.adPurchase.findMany();
    const emails = await prisma.brotherEmails.findMany();
    const donations = await prisma.donation.findMany({
        orderBy: { createdAt: "desc" },
    });
    const draft = await prisma.draft.findUnique({
        where: { id: year },
        select: { status: true },
    });

    return (
        <div className="flex flex-col bg-primary p-5 rounded-lg border-1 border-secondary gap-5 w-[90vw] h-[70vh] overflow-scroll ">
            <div className="flex self-center items-center gap-3">
                <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                <Cog6ToothIcon className="w-10 h-10" />
            </div>
            <div className="flex flex-col justify-evenly h-full gap-5">
                <UsersTable users={users} draftStatus={draft?.status} />
                <TeamsTable teams={teams} draftStatus={draft?.status} />
                <ProductsTable
                    products={products}
                    draftStatus={draft?.status}
                />
                <AdTable ads={ads} />
                <DonationTable donations={donations} />
                <EmailsTable emails={emails} />
            </div>
        </div>
    );
};

export default AdminPanel;

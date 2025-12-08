import { UsersTable } from "@/components/tables/UsersTable";
import { TeamsTable } from "@/components/tables/TeamsTable";
import { prisma } from "../../../prisma";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import EmailsTable from "../tables/EmailsTable";
import DonationTable from "../tables/DonationTable";
import getYear from "@/lib/getYear";
import AdPurchaseTable from "../tables/AdPurchaseTable";
import AdsTable from "../tables/AdTable";
import TshirtsTable from "../tables/TShirtTable";
import TshirtPurchasesTable from "../tables/TShirtPurchaseTable";

const AdminPanel = async () => {
    const year = getYear();

    const users = await prisma.user.findMany({
        orderBy: { globalRole: "asc" },
        include: { team: true },
    });
    const teams = await prisma.team.findMany({
        include: { headCoach: { select: { id: true, name: true } } },
        orderBy: { name: "asc" },
    });

    const ads = await prisma.ad.findMany({
        orderBy: { size: "desc" },
    });

    const tshirts = await prisma.tshirt.findMany({
        orderBy: { name: "asc" },
    });

    const tshirtPurchases = await prisma.tshirtPurchase.findMany({
        orderBy: { createdAt: "desc" },
    });

    const adPurchases = await prisma.adPurchase.findMany({
        orderBy: { createdAt: "desc" },
    });

    const emails = await prisma.brotherEmails.findMany({
        orderBy: { email: "asc" },
    });

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
                <UsersTable
                    users={users}
                    draftStatus={draft?.status}
                />
                <TeamsTable
                    teams={teams}
                    draftStatus={draft?.status}
                />
                <DonationTable
                    donations={donations}
                    users={users}
                    teams={teams}
                />
                <AdPurchaseTable
                    ads={adPurchases}
                    users={users}
                    teams={teams}
                />
                <AdsTable
                    ads={ads}
                    draftStatus={draft?.status}
                />
                <TshirtPurchasesTable purchases={tshirtPurchases} />
                <TshirtsTable
                    tshirts={tshirts}
                    draftStatus={draft?.status}
                />
                <EmailsTable emails={emails} />
            </div>
        </div>
    );
};

export default AdminPanel;

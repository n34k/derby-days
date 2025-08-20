import { User } from "@/generated/prisma";
import greekLetters from "@/lib/greekLetters";
import React from "react";
import InfoBox from "./InfoBox";
import { InfoBoxText } from "@/models/DefaultValues";
import { prisma } from "../../prisma";
import { GlobalRole } from "@/generated/prisma";
interface UserStatsProps {
    user: User;
}

const UserStats = async ({ user }: UserStatsProps) => {
    const userTeam = user.teamId ? greekLetters(user.teamId) : "Coming Soon";
    const adSales = await prisma.adPurchase.findMany({
        where: { userId: user.id },
        select: { amount: true, name: true, createdAt: true },
    });

    const donations = await prisma.donation.findMany({
        where: { userId: user.id },
        select: { amount: true, name: true, createdAt: true },
    });

    const getDisplayRole = () => {
        switch (user.globalRole) {
            case GlobalRole.ADMIN:
                return "Derby Daddy";
            case GlobalRole.BROTHER:
                return "Coach";
            case GlobalRole.HEAD_COACH:
                return "Head Coach";
            case GlobalRole.JUDGE:
                return "Judge";
            default:
                return "This shouldnt show tell Nick";
        }
    };

    const displayRole = getDisplayRole();

    const displayRoleInfo: InfoBoxText = {
        textColor: "text-secondary",
        text: displayRole,
    };

    const teamInfo: InfoBoxText = {
        text: userTeam,
        textColor: "text-base-content",
    };

    const moneyRaisedInfo: InfoBoxText = {
        text: `$${user.moneyRaised}`,
        textColor: user.moneyRaised === 0 ? "text-error" : "text-success",
    };

    return (
        <div className="md:h-[70vh] w-[75vw] md:w-auto bg-primary rounded-lg border-1 border-secondary flex flex-col items-center p-10 shadow-lg min-w-[300px]">
            <h1 className="text-3xl font-bold mb-8 text-base-content">
                Your Stats
            </h1>
            <div className="flex flex-col md:grid grid-cols-2 grid-rows-2 gap-6 w-full">
                <InfoBox title="Role" info={displayRoleInfo} />
                {user.globalRole === "BROTHER" ||
                user.globalRole === "HEAD_COACH" ? (
                    <InfoBox title="Team" info={teamInfo} />
                ) : null}
                <InfoBox title="Money Raised" info={moneyRaisedInfo} />
                <InfoBox title="Ad Sales" saleInfo={adSales} />
                <InfoBox title="Donations" saleInfo={donations} />
            </div>
        </div>
    );
};

export default UserStats;

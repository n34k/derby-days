import { prisma } from "../../prisma";

function getStartOfWeekInTZ(timeZone = "America/Los_Angeles"): Date {
    const now = new Date();

    // get local parts in target TZ
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        weekday: "short",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).formatToParts(now);

    const get = (t: Intl.DateTimeFormatPartTypes) =>
        parts.find((p) => p.type === t)?.value ?? "";

    const yyyy = get("year");
    const mm = get("month");
    const dd = get("day");
    const weekday = get("weekday"); // "Sun".."Sat"
    const idx = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
        weekday
    );

    // midnight local today in TZ
    const localMidnight = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
    const diffToMonday = idx === 0 ? -6 : 1 - idx; // back to Monday
    const mondayLocal = new Date(localMidnight);
    mondayLocal.setDate(localMidnight.getDate() + diffToMonday);

    return mondayLocal;
}

export async function getWeeklyRaised() {
    const weekStart = getStartOfWeekInTZ();

    const adAgg = await prisma.adPurchase.groupBy({
        by: ["teamId"],
        where: { createdAt: { gte: weekStart } },
        _sum: { amount: true },
    });

    const donAgg = await prisma.donation.groupBy({
        by: ["teamId"],
        where: { createdAt: { gte: weekStart } },
        _sum: { amount: true },
    });

    const adMap = Object.fromEntries(
        adAgg.map((a) => [a.teamId, Number(a._sum.amount ?? 0)])
    );
    const donMap = Object.fromEntries(
        donAgg.map((d) => [d.teamId, Number(d._sum.amount ?? 0)])
    );

    const teams = await prisma.team.findMany({
        select: { id: true, name: true, moneyRaised: true },
    });

    return teams.map((t) => {
        const week = (adMap[t.id] ?? 0) + (donMap[t.id] ?? 0);
        return {
            id: t.id,
            name: t.name,
            moneyRaised: {
                overall: Number(t.moneyRaised),
                week,
            },
        };
    });
}

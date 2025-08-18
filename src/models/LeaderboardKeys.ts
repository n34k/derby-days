export type LeaderboardMetric = "points" | "tshirtsSold" | "moneyRaised";

export const LeaderboardKeys: LeaderboardMetric[] = [
    "points",
    "tshirtsSold",
    "moneyRaised",
];

export const LeaderboardLabels: Record<LeaderboardMetric, string> = {
    points: "Points",
    tshirtsSold: "T-Shirts Sold",
    moneyRaised: "Money Raised",
};

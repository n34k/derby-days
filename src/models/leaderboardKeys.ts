export type LeaderboardMetric = "points" | "tshirtsSold" | "moneyRaised";

export type MoneyRaisedOption = "Week" | "Overall";

export const MoneyRaisedOptions: readonly MoneyRaisedOption[] = [
    "Week",
    "Overall",
];

export type LeaderBoardRow = {
    id: string;
    points?: number;
    tshirtsSold?: number;
    moneyRaised?: { overall: number; week: number };
};

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

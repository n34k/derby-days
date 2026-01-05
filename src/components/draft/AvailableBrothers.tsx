"use client";
import { useCallback, useState } from "react";
import { useAvailableBrothers, type Brother } from "@/app/hooks/useAvailableBrothers";
import { User } from "@/generated/prisma";
import { useDraftClock } from "@/app/hooks/useDraftClock";

type Props = {
    draftId: string;
    userData?: User | null;
    numberTeams: number;
};

export default function AvailableBrothersTable({ draftId, userData, numberTeams }: Props) {
    const { list, loading, error, removeById, addBack } = useAvailableBrothers(draftId);
    const [submittingId, setSubmittingId] = useState<string | null>(null);
    const admin = userData?.globalRole === "ADMIN";
    const isHeadCoach = userData?.globalRole === "HEAD_COACH";
    const headCoachTeam = userData?.teamId;
    const draftState = useDraftClock(draftId, numberTeams);
    const currTeamPicking = draftState.teamId;
    const draftStatus = draftState.status;

    const canPick = draftStatus === "ONGOING" && (admin || currTeamPicking === headCoachTeam);

    const onPick = useCallback(
        async (b: Brother) => {
            console.log("ONPICK");

            if (!admin && !isHeadCoach) return;

            const ok = window.confirm(`Draft ${b.name}?`);
            if (!ok) return;

            setSubmittingId(b.id);
            removeById?.(b.id);

            try {
                const res = await fetch(`/api/draft/${draftId}/pick`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ playerId: b.id }),
                });
                if (!res.ok) {
                    addBack?.(b); // revert on failure
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body?.error ?? `HTTP ${res.status}`);
                }
            } catch (e) {
                console.error("Pick failed:", e);
                alert("Failed to make pick. Please try again.");
            } finally {
                setSubmittingId(null);
            }
        },
        [isHeadCoach, admin, draftId, removeById, addBack]
    );

    console.log("ADMIN: ", admin);

    if (loading) return <p>Loading available brothers…</p>;
    if (error) {
        console.error("AvailableBrothers error:", error);
        return null;
    }
    if (!list?.length) return <h2 className="text-xl font-extrabold">All brothers have been drafted 🎉</h2>;

    const columns = 4; // fixed
    const rows: Brother[][] = [];
    for (let i = 0; i < list.length; i += columns) {
        rows.push(list.slice(i, i + columns));
    }

    return (
        <div className="flex flex-col overflow-x-auto border rounded-lg bg-primary w-[90vw]">
            <div className="bg-base-300">
                <h1 className="text-4xl font-bold text-center my-3">Available Brothers</h1>
                {isHeadCoach &&
                    (currTeamPicking === headCoachTeam ? (
                        <p className="text-3xl font-bold text-secondary text-center my-3">It is now your pick!</p>
                    ) : (
                        <p className="text-3xl font-bold text-info-content text-center my-3">
                            Please wait for your turn
                        </p>
                    ))}
            </div>
            <table className="min-w-full border-collapse text-sm">
                <tbody>
                    {rows.map((row, rIdx) => (
                        <tr key={rIdx}>
                            {row.map((b, cIdx) => {
                                const disabled = submittingId === b.id;
                                return (
                                    <td
                                        key={cIdx}
                                        className={[
                                            "border p-3 text-center font-medium select-none",
                                            canPick
                                                ? "transition duration-300 transform hover:scale-110 hover:bg-secondary hover:bg-opacity-10"
                                                : "",
                                            disabled ? "opacity-60 cursor-not-allowed" : "",
                                        ].join(" ")}
                                        onClick={() => (!disabled && canPick ? onPick(b) : undefined)}
                                        aria-disabled={disabled}
                                    >
                                        <div className="flex-col flex">
                                            <span>{b.name}</span>
                                        </div>
                                    </td>
                                );
                            })}
                            {row.length < columns &&
                                Array.from({
                                    length: columns - row.length,
                                }).map((_, i) => (
                                    <td
                                        key={`empty-${i}`}
                                        className="border p-3"
                                    />
                                ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

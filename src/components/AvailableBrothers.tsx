"use client";
import { useCallback, useState } from "react";
import {
    useAvailableBrothers,
    type Brother,
} from "@/app/hooks/useAvailableBrothers";

type Props = {
    draftId: string;
    isAdmin?: boolean;
};

export default function AvailableBrothersTable({
    draftId,
    isAdmin = false,
}: Props) {
    const { list, loading, error, removeById, addBack } =
        useAvailableBrothers(draftId);
    const [submittingId, setSubmittingId] = useState<string | null>(null);

    const onPick = useCallback(
        async (b: Brother) => {
            if (!isAdmin) return;
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
        [isAdmin, draftId, removeById, addBack]
    );

    if (loading) return <p>Loading available brothers…</p>;
    if (error) {
        console.error("AvailableBrothers error:", error);
        return null;
    }
    if (!list?.length) return <p>All brothers have been drafted 🎉</p>;

    const columns = 4; // fixed
    const rows: Brother[][] = [];
    for (let i = 0; i < list.length; i += columns) {
        rows.push(list.slice(i, i + columns));
    }

    return (
        <div className="overflow-x-auto border-1 border-secondary rounded-lg bg-primary w-[90vw]">
            <h1 className="text-4xl font-bold text-center my-3">
                Available Brothers
            </h1>
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
                                            "border border-secondary p-3 text-center font-medium select-none text-info-content",
                                            isAdmin
                                                ? "transition duration-300 transform hover:scale-110 hover:bg-secondary hover:bg-opacity-10"
                                                : "",
                                            disabled
                                                ? "opacity-60 cursor-not-allowed"
                                                : "",
                                        ].join(" ")}
                                        onClick={() =>
                                            !disabled && isAdmin
                                                ? onPick(b)
                                                : undefined
                                        }
                                        aria-disabled={disabled}
                                    >
                                        {b.name}
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

"use client";
import { useDraftBoard } from "@/app/hooks/useDraftBoard";
import greekLetters from "@/lib/greekLetters";

export default function DraftBoard({ draftId }: { draftId: string }) {
    const { teams, grid, rounds, loading } = useDraftBoard(draftId);

    if (loading) return <div>Loading board…</div>;
    if (!teams.length) return <div>No teams configured.</div>;

    return (
        <div className="overflow-x-auto border rounded-lg bg-primary w-[90vw]">
            <table className="min-w-full border-collapse text-sm">
                <thead className="bg-base-300">
                    <tr>
                        <th className="p-3 text-center w-28">Round</th>
                        {teams.map((t) => (
                            <th
                                key={t.id}
                                className="text-2xl p-3 text-center"
                            >
                                {greekLetters(t.id)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rounds }).map((_, rIdx) => (
                        <tr key={rIdx}>
                            <td className="p-3 border font-semibold text-center text-lg">{rIdx + 1}</td>
                            {teams.map((t, cIdx) => {
                                const cell = grid[rIdx]?.[cIdx] ?? null;
                                return (
                                    <td
                                        key={t.id}
                                        className="border text-center"
                                    >
                                        {cell?.name ?? <span className="text-info-content">—</span>}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

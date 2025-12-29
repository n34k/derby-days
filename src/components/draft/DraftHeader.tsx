// src/components/draft/DraftHeader.tsx
"use client";
import { useMemo } from "react";
import { useDraftClock } from "@/app/hooks/useDraftClock";
import { useCountdown } from "@/app/hooks/useCountdown";
import greekLetters from "@/lib/greekLetters";

type Team = { id: string; name: string };

export default function DraftHeader({ draftId, teams }: { draftId: string; teams: Team[] }) {
    const state = useDraftClock(draftId, teams.length);
    const { mmss } = useCountdown(state.deadlineAt);

    const teamName = useMemo(() => {
        const t = teams.find((t) => t.id === state.teamId);
        return t?.name ?? "-";
    }, [teams, state.teamId]);

    return (
        <div className="border w-[90vw] rounded-lg p-4 flex items-center justify-between bg-base-300">
            <div className="flex flex-col items-center gap-1 text-center">
                <div className="text-xs md:text-sm text-info-content">On the clock: </div>
                <div className="font-bold text-4xl md:text-6xl">
                    {state.teamId ? greekLetters(state.teamId) : teamName}
                </div>
            </div>
            <div className="text-4xl md:text-7xl font-mono tabular-nums">
                {state.status === "ONGOING" && state.deadlineAt ? mmss : "--:--"}
            </div>

            <div className="flex items-center gap-8">
                <div className="flex flex-col items-center gap-1 text-center">
                    <div className="text-xs md:text-sm text-info-content">Round</div>
                    <div className="font-bold text-4xl md:text-6xl">{state.round}</div>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                    <div className="text-xs md:text-sm text-info-content">Pick</div>
                    <div className="font-bold text-4xl md:text-6xl">{state.pickNo ?? "—"}</div>
                </div>
            </div>
        </div>
    );
}

"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDraftChannel } from "./useDraftChannel";

type TeamCol = { id: string; name: string };
type Cell = {
    playerId: string;
    name: string | null;
    overallPickNo: number;
} | null;

export function useDraftBoard(draftId: string) {
    const [teams, setTeams] = useState<TeamCol[]>([]);
    const [grid, setGrid] = useState<Cell[][]>([]);
    const [rounds, setRounds] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    const readyRef = useRef(false);

    const teamIndex = useMemo(() => {
        const idx: Record<string, number> = {};
        teams.forEach((t, i) => (idx[t.id] = i));
        return idx;
    }, [teams]);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/draft/${draftId}/board`, {
                    cache: "no-store",
                });
                if (!res.ok) throw new Error("Failed to load board");
                const data = await res.json();
                if (!alive) return;
                setTeams(data.teams);
                setRounds(data.rounds);
                setGrid(data.grid);
                readyRef.current = true; //ready to accept events
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
            readyRef.current = false;
        };
    }, [draftId]);

    // Live updates, only handle once ready
    useDraftChannel(`public-draft-${draftId}`, (evt) => {
        if (!readyRef.current) return;
        if (evt?.type !== "ANNOUNCE") return;

        const teamId = evt.teamId as string | undefined;
        const round = Number(evt.round);
        const pickNo = Number(evt.pickNo);

        if (!teamId || !Number.isInteger(round)) return;

        const r = round - 1;
        const c = teamIndex[teamId];
        if (c == null || !grid[r]) return; //guard

        setGrid((prev) => {
            if (!prev[r]) return prev;
            const next = prev.map((row) => row.slice());
            next[r][c] = {
                playerId: evt.player.id,
                name: evt.player.name ?? null,
                overallPickNo: pickNo,
            };
            return next;
        });
    });

    return { teams, grid, rounds, loading };
}

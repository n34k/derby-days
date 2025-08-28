// src/hooks/useDraftClock.ts
"use client";
import { useEffect, useMemo, useState } from "react";
import { useDraftChannel } from "./useDraftChannel";
import { PublicEvent } from "@/models/eventTypes";

function deriveRoundInfo(pickNo: number, teamCount: number) {
    if (!pickNo || !teamCount) return { round: null, pickInRound: null };
    const round = Math.floor((pickNo - 1) / teamCount) + 1;
    const i = ((pickNo - 1) % teamCount) + 1;
    return { round, pickInRound: i };
}

export type DraftClockState = {
    status: "NOT_STARTED" | "ONGOING" | "PAUSED" | "COMPLETE";
    pickNo: number | null;
    teamId: string | null;
    deadlineAt: number | null;
    round: number | null;
    pickInRound: number | null;
};

export function useDraftClock(draftId: string, teamIds: string[]) {
    const [state, setState] = useState<DraftClockState>({
        status: "NOT_STARTED",
        pickNo: null,
        teamId: null,
        deadlineAt: null,
        round: null,
        pickInRound: null,
    });

    const teamCount = teamIds.length;

    //hydrate on mount and on focus/visibilitychange
    useEffect(() => {
        let alive = true;
        const fetchState = async () => {
            try {
                const res = await fetch(`/api/draft/${draftId}/state`, {
                    cache: "no-store",
                });
                if (!res.ok) return;
                const data = await res.json();
                const { round, pickInRound } = deriveRoundInfo(
                    Number(data.pickNo),
                    teamCount
                );
                if (alive) {
                    setState({
                        status: data.status,
                        pickNo: data.pickNo ?? null,
                        teamId: data.teamId ?? null,
                        deadlineAt: data.deadlineAt ?? null,
                        round,
                        pickInRound,
                    });
                }
            } catch {}
        };

        fetchState();

        const onFocus = () => fetchState();
        const onVis = () => {
            if (document.visibilityState === "visible") fetchState();
        };
        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", onVis);
        window.addEventListener("online", onFocus);

        return () => {
            alive = false;
            window.removeEventListener("focus", onFocus);
            document.removeEventListener("visibilitychange", onVis);
            window.removeEventListener("online", onFocus);
        };
    }, [draftId, teamCount]);

    // live updates from Pusher
    useDraftChannel(`public-draft-${draftId}`, (evt: PublicEvent) => {
        if (evt?.type !== "STATE") return;
        const pickNo = Number(evt.pickNo) || null;
        const { round, pickInRound } = pickNo
            ? deriveRoundInfo(pickNo, teamCount)
            : { round: null, pickInRound: null };
        setState({
            status: evt.status,
            pickNo,
            teamId: evt.teamId ?? null,
            deadlineAt:
                typeof evt.deadlineAt === "number" ? evt.deadlineAt : null,
            round,
            pickInRound,
        });
    });

    const teamIndex = useMemo(() => {
        const m: Record<string, number> = {};
        teamIds.forEach((id, i) => (m[id] = i));
        return m;
    }, [teamIds]);

    return { state, teamIndex };
}

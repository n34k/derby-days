"use client";
import { useEffect, useState } from "react";
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

export function useDraftClock(draftId: string, numberTeams: number) {
    const [state, setState] = useState<DraftClockState>({
        status: "NOT_STARTED",
        pickNo: null,
        teamId: null,
        deadlineAt: null,
        round: null,
        pickInRound: null,
    });

    //hydrate on mount and on focus/visibilitychange
    useEffect(() => {
        let alive = true;
        const fetchState = async () => {
            try {
                const res = await fetch(`/api/draft/${draftId}/state`, { cache: "no-store" });

                if (!res.ok) {
                    console.log("draft/state failed", res.status, await res.text());
                    return;
                }

                const data = await res.json();
                console.log("data:", data);

                const pickNo = data.pickNo ?? null;
                const { round, pickInRound } = deriveRoundInfo(Number(pickNo), numberTeams);

                if (!alive) return;
                console.log("fetchState setState", Date.now());

                setState({
                    status: data.status,
                    pickNo,
                    teamId: data.teamId ?? null,
                    deadlineAt: data.deadlineAt ?? null,
                    round,
                    pickInRound,
                });
            } catch (e) {
                console.error("fetchState error", e);
            }
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
    }, [draftId, numberTeams]);

    // live updates from Pusher
    useDraftChannel(`public-draft-${draftId}`, (evt: PublicEvent) => {
        if (evt?.type === "PICK_IS_IN") {
            setState((prev) => ({ ...prev, status: "PAUSED" }));
            return;
        }
        if (evt?.type !== "STATE") return;

        const pickNo = Number(evt.pickNo) || null;
        console.log("pusher STATE", evt, Date.now());
        const { round, pickInRound } = pickNo
            ? deriveRoundInfo(pickNo, numberTeams)
            : { round: null, pickInRound: null };
        setState({
            status: evt.status,
            pickNo,
            teamId: evt.teamId ?? null,
            deadlineAt: typeof evt.deadlineAt === "number" ? evt.deadlineAt : null,
            round,
            pickInRound,
        });
    });
    return state;
}

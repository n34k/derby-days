"use client";
import { useEffect, useRef, useState } from "react";
import { useDraftChannel } from "./useDraftChannel";
import { PickEvent } from "@/models/eventTypes";

const usePickIsIn = (draftId: string) => {
    const [pick, setPick] = useState<PickEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const readyRef = useRef(false);

    useEffect(() => {
        let alive = true;

        (async () => {
            setLoading(true);

            try {
                const res = await fetch(`/api/draft/${draftId}/pick`, { cache: "no-store" });

                if (res.status === 204) {
                    if (!alive) return;
                    setPick(null);
                    readyRef.current = true;
                    return;
                }

                if (!res.ok) {
                    const text = await res.text().catch(() => "");
                    throw new Error(`Failed to get unannounced picks (${res.status}): ${text}`);
                }

                const data = await res.json();

                if (!alive) return;

                const p = data?.pick;
                if (!p) {
                    setPick(null);
                    readyRef.current = true;
                    return;
                }

                const normalizedPick: PickEvent = {
                    type: "PICK_IS_IN",
                    pickId: p.id,
                    pickNo: p.overallPickNo,
                    teamId: p.teamId,
                    round: p.round,
                    player: {
                        id: p.userId,
                        name: p.user?.name ?? "",
                        image: p.user?.image ?? null,
                        walkoutSong: p.user?.walkoutSong ?? "",
                    },
                };

                setPick(normalizedPick);
                readyRef.current = true;
            } catch (e) {
                console.error(e);
                if (!alive) return;
                setPick(null);
                readyRef.current = true;
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
            readyRef.current = false;
        };
    }, [draftId]);

    useDraftChannel(`public-draft-${draftId}`, (evt) => {
        console.log("EVT", evt);

        if (!readyRef.current) return;
        console.log("readt ref", readyRef);
        if (evt?.type === "PICK_IS_IN") {
            setPick(evt);
            return;
        }

        if (evt?.type === "ANNOUNCE") {
            setPick(null);
        }
    });

    return { pick, loading };
};

export default usePickIsIn;

"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useDraftChannel } from "./useDraftChannel";
import { publicChannel } from "@/models/eventTypes";

export type Brother = { id: string; name: string; image?: string | null };

export function useAvailableBrothers(draftId: string) {
    const [list, setList] = useState<Brother[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | unknown>(null);
    const onceRef = useRef(false);

    // initial fetch
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/draft/${draftId}/available`, {
                    cache: "no-store",
                });
                if (!res.ok)
                    throw new Error(
                        (await res.json()).error ?? `HTTP ${res.status}`
                    );
                const data = await res.json();
                if (alive) setList((data?.available ?? []) as Brother[]);
            } catch (e) {
                if (alive) setError(e);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [draftId]);

    // realtime updates
    useDraftChannel(publicChannel(draftId), (evt) => {
        if (evt.type === "ANNOUNCE") {
            setList((prev) => prev.filter((b) => b.id !== evt.player.id));
        }
        if (evt.type === "UNDO") {
            // const b = {
            //     id: evt.playerId,
            //     name: evt.playerName ?? "Restored",
            //     image: evt.playerImage ?? null,
            // };
            // setList((prev) =>
            //     prev.some((x) => x.id === b.id)
            //         ? prev
            //         : [...prev, b].sort((a, c) => a.name.localeCompare(c.name))
            // );
        }
        if (evt.type === "BOARD_UPDATE" && !onceRef.current) {
            // Optional: on first board update, do a light resync to be safe
            onceRef.current = true;
            (async () => {
                try {
                    const res = await fetch(`/api/draft/${draftId}/available`, {
                        cache: "no-store",
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setList((data?.available ?? []) as Brother[]);
                    }
                } catch {}
            })();
        }
    });

    const removeById = useCallback((id: string) => {
        setList((prev) => prev.filter((b) => b.id !== id));
    }, []);

    const addBack = useCallback((b: Brother) => {
        setList((prev) =>
            prev.some((x) => x.id === b.id)
                ? prev
                : [...prev, b].sort((a, c) => a.name.localeCompare(c.name))
        );
    }, []);

    return { list, loading, error, removeById, addBack, setList };
}

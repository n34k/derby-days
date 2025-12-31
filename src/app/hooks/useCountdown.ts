"use client";
import { useEffect, useState } from "react";

export function useCountdown(deadlineAt: number | null) {
    const [now, setNow] = useState<number>(() => Date.now());

    useEffect(() => {
        if (!deadlineAt) return; // nothing to tick
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, [deadlineAt]);

    if (!deadlineAt) return { msLeft: null, mmss: "--:--", expired: false };

    const msLeft = Math.max(0, deadlineAt - now);
    const m = Math.floor(msLeft / 60000);
    const s = Math.floor((msLeft % 60000) / 1000);
    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");
    return { msLeft, mmss: `${mm}:${ss}`, expired: msLeft === 0 };
}

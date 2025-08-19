"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

type SessionStatus = "open" | "complete" | null;

export default function Page() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const [status, setStatus] = useState<SessionStatus>(null);

    useEffect(() => {
        if (status !== "complete") return;
        (async () => {
            const confetti = (await import("canvas-confetti")).default;
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.35 } });
            setTimeout(
                () =>
                    confetti({
                        particleCount: 80,
                        angle: 60,
                        spread: 60,
                        origin: { x: 0 },
                    }),
                200
            );
            setTimeout(
                () =>
                    confetti({
                        particleCount: 80,
                        angle: 120,
                        spread: 60,
                        origin: { x: 1 },
                    }),
                260
            );
        })();
    }, [status]);

    useEffect(() => {
        if (!sessionId) return;
        (async () => {
            try {
                const res = await fetch(
                    `/api/session-status?session_id=${sessionId}`
                );
                const data = await res.json();
                setStatus((data?.status as SessionStatus) ?? null);
            } catch {
                console.error("Error fetching session");
            }
        })();
    }, [sessionId]);

    // Client redirect for non-complete payments
    useEffect(() => {
        if (status === "open") router.replace("/");
    }, [status, router]);

    if (!status) {
        return (
            <main className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-pulse h-8 w-8 rounded-full bg-base-300" />
            </main>
        );
    }

    return (
        <main className="flex items-center justify-center px-4 py-40 text-center">
            <div className="flex flex-col items-center justify-center gap-6 max-w-xl w-full">
                <div className="inline-flex items-center gap-3">
                    <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                        Your transaction was successful
                    </h1>
                    <CheckCircleIcon className="h-7 w-7 md:h-9 md:w-9 text-success animate-bounce" />
                </div>

                <p className="text-base md:text-xl text-base-content/70">
                    {"Thank you!"} Your generosity makes a difference.
                </p>
                <div className="mt-2 flex flex-col gap-5 w-[200px] md:w-[250px]">
                    <Link
                        href="/standings"
                        className="btn btn-secondary btn-block shadow-lg"
                    >
                        View Standings
                    </Link>
                    <Link
                        href="/donors"
                        className="btn btn-secondary btn-block shadow-lg"
                    >
                        View Donations
                    </Link>
                    <button
                        className="btn btn-outline btn-block"
                        onClick={async () => {
                            const confetti = (await import("canvas-confetti"))
                                .default;
                            confetti({
                                particleCount: 200,
                                spread: 70,
                                origin: { y: 0.5 },
                            });
                        }}
                    >
                        Celebrate Again 🎉
                    </button>
                </div>
                <p className="text-xs text-base-content/50">
                    Want to keep the momentum going? Invite a friend or family
                    member to donate.
                </p>
            </div>
        </main>
    );
}

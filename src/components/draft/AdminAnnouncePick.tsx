"use client";
import React, { useMemo, useState } from "react";
import usePickIsIn from "@/app/hooks/usePickIsIn";
import greekLetters from "@/lib/greekLetters";
import Image from "next/image";

interface AdminAnnouncePickProps {
    draftId: string;
}

const AdminAnnouncePick = ({ draftId }: AdminAnnouncePickProps) => {
    const { loading, pick } = usePickIsIn(draftId);

    const [submitting, setSubmitting] = useState(false);

    const canAnnounce = useMemo(() => {
        return !!pick?.pickId && !loading && !submitting;
    }, [pick?.pickId, loading, submitting]);

    const handleAnnounce = async () => {
        if (!pick?.pickId) return;

        setSubmitting(true);

        try {
            const res = await fetch(`/api/draft/${draftId}/announce`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pickId: pick.pickId }),
            });

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(`Announce failed (${res.status}): ${text}`);
            }
        } catch (e) {
            console.error("Announce pick error:", e);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-md rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
            <div className="text-lg font-semibold text-center">Announce Pick</div>
            <div className="mt-4">
                {loading ? (
                    <div className="text-sm opacity-70">Loading current pick...</div>
                ) : !pick ? (
                    <div className="text-sm opacity-70 text-center">No pick is currently in.</div>
                ) : (
                    <div className="flex flex-col gap-2 items-center rounded-xl border border-base-200 bg-base-200/30 p-3">
                        <div className="text-lg">
                            Round {pick.round} • Pick {pick.pickNo}
                        </div>
                        <div className="text-lg">
                            {pick.player.name} • {greekLetters(pick.teamId)}
                        </div>
                        {pick.player.walkoutSong && (
                            <span className="text-center">
                                <div className="text-info-content">Walkout Song: </div>
                                <div className="text-lg">{pick.player.walkoutSong}</div>
                            </span>
                        )}
                        {pick.player.image && (
                            <Image
                                width={150}
                                height={150}
                                src={pick.player.image}
                                alt="pick image"
                                className="rounded-full border border-white"
                            />
                        )}
                        <button
                            className="btn btn-secondary w-full mt-2"
                            disabled={!canAnnounce}
                            onClick={handleAnnounce}
                        >
                            {submitting ? "Announcing..." : "Announce"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAnnouncePick;

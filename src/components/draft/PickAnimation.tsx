"use client";
import { useDraftChannel } from "@/app/hooks/useDraftChannel";
import { useCallback, useEffect, useState } from "react";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import greekLetters from "@/lib/greekLetters";
import CloudOrNextImg from "../CloudOrNextImg";

interface PickAnimationProps {
    draftId: string;
}

type PickInfo = {
    player: {
        id: string;
        name: string;
        image?: string | null | undefined;
        walkoutSong?: string | null | undefined;
    };
    teamId: string;
    pickNo: number;
};

const DISPLAY_TIME = 30000;

const PickAnimation = ({ draftId }: PickAnimationProps) => {
    const [pick, setPick] = useState<PickInfo | null>(null);
    const [until, setUntil] = useState<number | null>(null);
    const [progress, setProgress] = useState(1); // 1..0

    useDraftChannel(`public-draft-${draftId}`, (evt) => {
        if (evt.type === "ANNOUNCE") {
            const a: PickInfo = {
                player: evt.player,
                pickNo: evt.pickNo,
                teamId: evt.teamId,
            };
            setPick(a);
            setUntil(Date.now() + DISPLAY_TIME);
        }
    });

    useEffect(() => {
        if (!until) return;
        const id = setInterval(() => {
            const now = Date.now();
            const left = Math.max(0, until - now);
            setProgress(left / DISPLAY_TIME);
            if (left === 0) {
                setPick(null);
                setUntil(null);
                setProgress(1);
            }
        }, 100);
        return () => clearInterval(id);
    }, [until]);

    // dismiss handlers
    const dismiss = useCallback(() => {
        setPick(null);
        setUntil(null);
        setProgress(1);
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") dismiss();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [dismiss]);

    return (
        <AnimatePresence>
            {pick && (
                <motion.div
                    key="overlay"
                    className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={dismiss}
                >
                    {/* Stop click-through on the card */}
                    <motion.div
                        className="flex flex-col items-center w-[65vw] rounded-2xl border bg-primary shadow-2xl overflow-hidden"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.98, opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 120,
                            damping: 14,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* top bar / progress */}
                        <div className="relative h-1 w-full bg-white">
                            <div
                                className="absolute left-0 top-0 h-1 bg-base-100 transition-[width]"
                                style={{
                                    width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
                                }}
                            />
                        </div>

                        {pick.player.image && (
                            <CloudOrNextImg
                                src={pick.player.image}
                                cloud={pick.player.image.includes("cloudinary")}
                                alt={pick.player.name ?? "Player"}
                                className="h-56 w-56 mt-2 md:h-100 md:w-100 rounded-full object-cover border border-black"
                                size={500}
                            />
                        )}

                        {/* Text block */}
                        <div className="text-center my-2">
                            <div className="text-2xl uppercase tracking-widest text-info-content">
                                Pick #{pick.pickNo}
                            </div>
                            <div className="text-4xl md:text-6xl font-extrabold">{pick.player.name}</div>
                            <div className="mt-3 text-3xl md:text-6xl">
                                <span className="font-semibold">{greekLetters(pick.teamId)}</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PickAnimation;

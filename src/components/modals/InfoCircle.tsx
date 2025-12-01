"use client";
import React, { ReactNode, useEffect, useState } from "react";

interface InfoCircleProps {
    children: ReactNode;
}

const InfoCircle = ({ children }: InfoCircleProps) => {
    const [isTouch, setIsTouch] = useState(false);
    const [open, setOpen] = useState(false);

    // Detect touch device once on mount
    useEffect(() => {
        setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
    }, []);

    return (
        <div className="relative inline-flex items-center justify-center">
            {/* Circle */}
            <div
                className="border border-primary-content w-4 h-4 rounded-full cursor-pointer flex items-center justify-center peer"
                onClick={isTouch ? () => setOpen((prev) => !prev) : undefined}
            >
                <p className="text-[10px] leading-none">i</p>
            </div>

            {/* Tooltip */}
            <div
                className={`
                    absolute bottom-full mb-1 left-1/2 -translate-x-1/2
                    text-xs z-50 bg-white text-black rounded-md p-1
                    transition-opacity duration-200 pointer-events-none w-36
                    ${isTouch && open ? "opacity-100" : "opacity-0"}
                    ${!isTouch ? "peer-hover:opacity-100" : ""}
                `}
            >
                {children}
            </div>
        </div>
    );
};

export default InfoCircle;

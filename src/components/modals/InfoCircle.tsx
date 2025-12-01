import React, { ReactNode } from "react";

interface InfoCircleProps {
    children: ReactNode;
}

const InfoCircle = ({ children }: InfoCircleProps) => {
    return (
        <div className="relative inline-flex items-center justify-center">
            <div className="border border-primary-content w-4 h-4 rounded-full cursor-pointer flex items-center justify-center peer">
                <p className="text-[10px] leading-none">i</p>
            </div>

            <div
                className="
                    text-xs z-50 transition-opacity duration-200 p-1
                    absolute bottom-full mb-1
                    bg-white text-black rounded-md border-1 shadow-lg
                    opacity-0 peer-hover:opacity-100
                    pointer-events-none w-36
                "
            >
                {children}
            </div>
        </div>
    );
};

export default InfoCircle;

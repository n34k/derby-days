"use client";
import React from "react";
import Image from "next/image";

type Coach = {
    name: string | null;
    image?: string | null;
};

type CoachesCardProps = {
    coaches: Coach[];
};

const CoachesCard: React.FC<CoachesCardProps> = ({ coaches }) => {
    const isEmpty = coaches.length === 0;

    return (
        <div className="flex flex-col items-center justify-start gap-2.5 h-[60vh] md:w-[30vw] bg-primary rounded-lg border-2 border-secondary p-5">
            {isEmpty ? (
                // empty state: center everything
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <h2 className="text-4xl font-semibold">Coaches</h2>
                    <p className="text-2xl opacity-70">Coming soon</p>
                </div>
            ) : (
                <>
                    <h2 className="text-4xl font-semibold">Coaches</h2>
                    {/* scrolling list */}
                    <div className="w-full flex-1 overflow-y-auto">
                        <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {coaches.map((coach, idx) => (
                                <li
                                    key={`${coach.name ?? "coach"}-${idx}`}
                                    className="flex flex-col items-center gap-2.5"
                                >
                                    {coach.image ? (
                                        <Image
                                            src={coach.image}
                                            alt={`${
                                                coach.name ?? "Coach"
                                            }'s profile photo`}
                                            width={80}
                                            height={80}
                                            className="rounded-full [80px] h-[80px]"
                                        />
                                    ) : (
                                        <p className="w-[80px] h-[80px] rounded-full bg-secondary/20 flex items-center justify-center text-sm">
                                            X
                                        </p>
                                    )}
                                    <h3 className="text-lg text-info-content text-center">
                                        {coach.name}
                                    </h3>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
};

export default CoachesCard;

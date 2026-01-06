import React from "react";
import { prisma } from "../../../prisma";
import getYear from "@/lib/getYear";
import InfoCircle from "@/components/modals/InfoCircle";

const page = async () => {
    const year = getYear();

    const entries = await prisma.scheduleEntry.findMany({
        orderBy: { startTime: "asc" },
    });

    return (
        <main className="flex flex-col items-center justify-center py-10 px-10 gap-10 overflow-x-hidden">
            <div className="flex flex-col items-center justify-center gap-5 p-5 bg-primary rounded-lg border-1 w-[85vw]">
                {/* Header */}
                <div className="flex flex-row gap-1 mb-2">
                    <h1 className="text-5xl text-base-content font-bold">{year} Event Schedule</h1>
                    <InfoCircle>Official Derby Days event schedule. Times and locations may change.</InfoCircle>
                </div>

                {/* Events */}
                {entries.length > 0 ? (
                    <ul className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                        {entries.map((entry) => (
                            <li
                                key={entry.id}
                                className="bg-base-200 rounded-lg border border-base-content/20 p-4 flex flex-col gap-2"
                            >
                                <div className="text-center flex flex-col gap-1">
                                    <h3 className="text-2xl font-bold text-base-content">{entry.title}</h3>

                                    <p className="text-info-content text-lg">
                                        {new Date(entry.startTime).toLocaleString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                            hour: "numeric",
                                            minute: "2-digit",
                                        })}
                                    </p>

                                    {entry.location && <p className="text-base-content/90">{entry.location}</p>}
                                </div>

                                {entry.description && (
                                    <p className="text-base-content mt-2 text-center whitespace-pre-line">
                                        {entry.description}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-base-content">Schedule coming soon.</p>
                )}
            </div>
        </main>
    );
};

export default page;

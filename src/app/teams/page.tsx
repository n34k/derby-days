import React from "react";
import { prisma } from "../../../prisma";
import greekLetters from "@/lib/greekLetters";
import Link from "next/link";

const TeamsOverviewPage = async () => {
    const teams = await prisma.team.findMany();

    return (
        <main className="flex flex-col md:flex-row h-dvh w-dvw overflow-hidden">
            {teams.map((team) => (
                <Link
                    href={`/teams/${team.id}`}
                    key={team.id}
                    className="relative flex-1 h-full flex items-center justify-center bg-center bg-cover"
                    style={{ backgroundImage: `url(/images/chapterhouse.jpg)` }} //url(images/${team.id}.jpg)
                >
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40" />

                    {/* Content above overlay */}
                    <span className="relative text-6xl font-bold text-white drop-shadow-lg">
                        {greekLetters(team.id)}
                    </span>
                </Link>
            ))}
        </main>
    );
};

export default TeamsOverviewPage;

"use client";
import React from "react";
import {
    ClipboardDocumentCheckIcon,
    SparklesIcon,
} from "@heroicons/react/24/solid";
import CloudOrNextImg from "./CloudOrNextImg";

type PersonCardProps = {
    role: string;
    person: {
        name: string | null;
        image?: string | null | undefined;
    } | null;
};

const PersonCard = ({ role, person }: PersonCardProps) => {
    const hasPerson = !!person && (person.name || person.image);

    return (
        <div className="flex items-center justify-center flex-col gap-6 h-[60vh] md:w-[30vw] bg-primary rounded-lg border-1 border-secondary p-5">
            <div className="flex gap-3">
                <h2 className="text-4xl font-semibold">{role}</h2>
                {role === "Derby Darling" ? (
                    <SparklesIcon className="h-10 w-10" />
                ) : (
                    <ClipboardDocumentCheckIcon className="h-10 w-10" />
                )}
            </div>

            {hasPerson ? (
                <>
                    {person?.image && (
                        <CloudOrNextImg
                            src={person.image}
                            alt={`${person.name ?? "Profile"} photo`}
                            cloud={person.image.includes("cloudinary")}
                            size={1000}
                            className="border-1 border-secondary rounded-sm w-[350px] h-[350px]"
                        />
                    )}
                    <h2 className="text-3xl text-info-content">
                        {person?.name}
                    </h2>
                </>
            ) : (
                <p className="text-2xl opacity-70">Coming soon</p>
            )}
        </div>
    );
};

export default PersonCard;

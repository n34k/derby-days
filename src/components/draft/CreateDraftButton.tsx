"use client";
import getYear from "@/lib/getYear";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const CreateDraftButton = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const year = getYear();

    const onClick = async () => {
        const confirmed = window.confirm(
            `Are you sure you want to create the ${year} draft? Only do this if all uses are signed in and teams are set. This will stop you from creating or deleting teams, users, and prodcuts and stop people from creating a new account. You can undo this later.`
        );
        if (!confirmed) return;

        setIsLoading(true);

        const res = await fetch(`/api/draft/${year}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ year }),
        });

        if (!res.ok) {
            console.error("Failed to create draft", await res.json());
            return;
        }

        router.refresh();
        setIsLoading(false);
    };

    return (
        <div>
            {isLoading ? (
                <div className="flex items-center justify-center text-4xl font-bold bg-base-100 rounded-xl border-1 border-secondary w-[75vw] h-[100px]">
                    Loading
                </div>
            ) : (
                <button
                    className="text-4xl font-bold bg-base-100 rounded-xl border-1 border-secondary w-[75vw] h-[100px] transition duration-300 transform hover:scale-110 hover:bg-secondary hover:bg-opacity-10"
                    onClick={onClick}
                >
                    Create Draft
                </button>
            )}
        </div>
    );
};

export default CreateDraftButton;

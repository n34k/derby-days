"use client";
import React from "react";
import { useRouter } from "next/navigation";
import getYear from "@/lib/getYear";

const DraftStartButton = () => {
    const router = useRouter();
    const year = getYear();

    const onClick = async () => {
        const phrase = `START DRAFT ${year}`;
        const input = window.prompt(
            `To confirm, type:\n\n${phrase}\n\nThis action cannot be undone.`
        );

        if (input !== phrase) {
            alert("Derby Days not ended — confirmation phrase did not match.");
            return;
        }

        const res = await fetch(`/api/draft/${year}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status: "ONGOING" }),
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
            console.error("Failed to delete draft", await res.json());
            return;
        }
        router.refresh();
    };
    return (
        <button
            className="btn btn-lg btn-secondary transition duration-300 transform hover:scale-110 hover:bg-accent hover:bg-opacity-10"
            onClick={onClick}
        >
            START DRAFT
        </button>
    );
};

export default DraftStartButton;

"use client";
import React from "react";
import { useRouter } from "next/navigation";

const DraftStartButton = () => {
    const router = useRouter();
    const year = String(new Date().getFullYear());

    const onClick = async () => {
        const confirmed = window.confirm(
            `Are you sure you want to start the draft? THIS CANT BE UNDONE.`
        );

        if (!confirmed) return;

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

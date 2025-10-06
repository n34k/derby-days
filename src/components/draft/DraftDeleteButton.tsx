"use client";
import React from "react";
import { useRouter } from "next/navigation";
import getYear from "@/lib/getYear";

const DraftDeleteButton = () => {
    const router = useRouter();
    const year = getYear();

    const onClick = async () => {
        const confirmed = window.confirm(
            `Are you sure you want to delete the draft?`
        );

        if (!confirmed) return;

        const res = await fetch(`/api/draft/${year}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
            console.error("Failed to delete draft", await res.json());
            return;
        }
        router.refresh();
    };

    return (
        <button className="btn btn-error btn-sm w-[150px]" onClick={onClick}>
            Delete Current Draft
        </button>
    );
};

export default DraftDeleteButton;

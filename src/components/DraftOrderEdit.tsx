"use client";
import { Draft } from "@/generated/prisma";
import greekLetters from "@/lib/greekLetters";
import React, { useState } from "react";

interface DraftOrderEditProps {
    draft: Draft;
}

const DraftOrderEdit = ({ draft }: DraftOrderEditProps) => {
    const [order, setOrder] = useState<string[]>(draft.teamOrder);
    const [originalOrder, setOriginalOrder] = useState<string[]>(
        draft.teamOrder
    );
    const [saved, setSaved] = useState(true);

    const move = (from: number, to: number) => {
        if (to < 0 || to >= order.length) return;
        const updated = [...order];
        const [moved] = updated.splice(from, 1);
        updated.splice(to, 0, moved);
        setOrder(updated);
        setSaved(false);
    };

    const saveOrder = async () => {
        const res = await fetch(`/api/draft/${draft.id}/order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ teamOrder: order }),
        });
        if (!res.ok) {
            console.error("Failed to save order", await res.json());
            return;
        }
        alert("Order saved!");
        setOriginalOrder(order);
        setSaved(true);
    };

    const cancel = () => {
        setOrder(originalOrder);
        setSaved(true);
    };

    return (
        <div className="space-y-4 w-full">
            <h2 className="text-xl text-center">Order</h2>
            <ol className="space-y-2">
                {order.map((teamId, index) => (
                    <li
                        key={teamId}
                        className="flex items-center justify-between border p-2 rounded bg-base-100"
                    >
                        <span>
                            {index + 1}. {greekLetters(teamId)}
                        </span>
                        <div className="space-x-2">
                            <button
                                onClick={() => move(index, index - 1)}
                                disabled={index === 0}
                                className="px-2 py-1 border rounded disabled:hidden transition duration-300 transform hover:scale-110 hover:bg-secondary hover:bg-opacity-10"
                            >
                                ↑
                            </button>
                            <button
                                onClick={() => move(index, index + 1)}
                                disabled={index === order.length - 1}
                                className="px-2 py-1 border rounded disabled:hidden transition duration-300 transform hover:scale-110 hover:bg-secondary hover:bg-opacity-10"
                            >
                                ↓
                            </button>
                        </div>
                    </li>
                ))}
            </ol>
            {!saved && (
                <div className="flex justify-evenly">
                    <button className="btn btn-sm" onClick={cancel}>
                        Cancel
                    </button>
                    <button onClick={saveOrder} className="btn btn-sm">
                        Save
                    </button>
                </div>
            )}
        </div>
    );
};

export default DraftOrderEdit;

"use client";
import React, { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { TshirtPurchase } from "@/generated/prisma";

interface TshirtPurchasesTableProps {
    purchases: TshirtPurchase[];
}

const TshirtPurchasesTable: React.FC<TshirtPurchasesTableProps> = ({ purchases }) => {
    const [expanded, setExpanded] = useState(false);

    // Helper to render sizeQty JSON cleanly
    const renderSizeQty = (value: TshirtPurchase["sizeQty"]) => {
        if (value == null) return "-";

        // Prisma Json -> any on the frontend
        if (typeof value === "string") return value;

        try {
            // Try to pretty-print if it's an object like { S: 2, M: 1 }
            if (typeof value === "object" && value !== null) {
                const entries = Object.entries(value as Record<string, string>);
                if (entries.length === 0) return "-";

                return entries.map(([size, qty]) => `${size}: ${qty}`).join(", ");
            }

            return JSON.stringify(value);
        } catch {
            return JSON.stringify(value);
        }
    };

    return (
        <div>
            {/* Header / Controls */}
            <div className="flex gap-2 items-center pb-2.5">
                <h2 className="text-2xl font-semibold">T-Shirt Purchases</h2>

                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    aria-expanded={expanded}
                    aria-controls="tshirt-purchases-table-panel"
                    className="p-1 rounded hover:bg-base-200 transition"
                    title={expanded ? "Collapse" : "Expand"}
                >
                    <ChevronDownIcon className={`w-7 h-7 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>
            </div>

            {expanded && (
                <div
                    id="tshirt-purchases-table-panel"
                    className="overflow-x-auto w-full"
                >
                    <table className="w-full border border-base-content text-sm">
                        <thead className="bg-base-200">
                            <tr>
                                <th className="border px-2 py-1">Team ID</th>
                                <th className="border px-2 py-1">Email</th>
                                <th className="border px-2 py-1">Name</th>
                                <th className="border px-2 py-1">Size / Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.length > 0 ? (
                                purchases
                                    .slice()
                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                    .map((purchase) => (
                                        <tr
                                            key={purchase.id}
                                            className="hover:bg-base-200"
                                        >
                                            <td className="border px-2 py-1">{purchase.teamId ?? "-"}</td>
                                            <td className="border px-2 py-1">{purchase.email}</td>
                                            <td className="border px-2 py-1">{purchase.name ?? "-"}</td>
                                            <td className="border px-2 py-1">{renderSizeQty(purchase.sizeQty)}</td>
                                        </tr>
                                    ))
                            ) : (
                                <tr>
                                    <td
                                        className="px-2 py-4 text-center"
                                        colSpan={4}
                                    >
                                        No t-shirt purchases yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TshirtPurchasesTable;

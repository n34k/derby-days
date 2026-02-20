"use client";
import React, { useMemo, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { TshirtPurchase } from "@/generated/prisma";
import greekLetters from "@/lib/greekLetters";
import { Size, tshirtSizes } from "@/models/tshirtSizes";

interface TshirtPurchasesTableProps {
    purchases: TshirtPurchase[];
}

type CartItem = {
    qty: number;
    name: string;
    size: string;
    productId: string;
};

type AggregatedShirt = {
    productId: string;
    name: string;
    sizeQty: Record<string, number>; // e.g. { S: 3, M: 2 }
};

const TshirtPurchasesTable: React.FC<TshirtPurchasesTableProps> = ({ purchases }) => {
    const [expanded, setExpanded] = useState(false);

    // Helper to render sizeQty JSON cleanly
    const renderSizeQty = (value: TshirtPurchase["sizeQty"]) => {
        if (value == null) return "-";

        if (typeof value === "string") return value;

        try {
            if (Array.isArray(value)) {
                if (value.length === 0) return "-";

                return value
                    .map((item) => {
                        const { name, size, qty } = item as {
                            name?: string;
                            size?: string;
                            qty?: number;
                        };

                        return `${name ?? "Item"} (${size ?? "-"}) × ${qty ?? 0}`;
                    })
                    .join(", ");
            }

            return JSON.stringify(value);
        } catch {
            return JSON.stringify(value);
        }
    };

    const aggregatePurchasesByShirtSize = (purchases: TshirtPurchase[]): AggregatedShirt[] => {
        const map: Record<string, AggregatedShirt> = {};

        for (const purchase of purchases) {
            // sizeQty should be an array of cart items, but it's typed as JsonValue[]
            const rawItems = purchase.sizeQty;

            for (const raw of rawItems) {
                if (raw == null || typeof raw !== "object" || Array.isArray(raw)) continue;

                const item = raw as Partial<CartItem>;

                if (
                    typeof item.productId !== "string" ||
                    typeof item.size !== "string" ||
                    typeof item.qty !== "number"
                ) {
                    continue; // skip malformed entries
                }

                const productId = item.productId;
                const size = item.size;
                const qty = item.qty;
                const name = typeof item.name === "string" ? item.name : "Unknown Shirt";

                if (!map[productId]) {
                    map[productId] = {
                        productId,
                        name,
                        sizeQty: {},
                    };
                }

                map[productId].sizeQty[size] = (map[productId].sizeQty[size] ?? 0) + qty;
            }
        }

        return Object.values(map);
    };

    const totalOrdersByShirtBySize = useMemo(() => aggregatePurchasesByShirtSize(purchases), [purchases]);

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
                    <div className="w-full mb-3">
                        <div className="flex flex-col md:flex-row md:items-center gap-6 overflow-x-auto whitespace-nowrap rounded-md border border-base-content/20 bg-base-100 px-4 py-3">
                            <h2 className="text-lg font-semibold text-primary-content">Total Orders By Shirt:</h2>

                            {totalOrdersByShirtBySize.map((s) => {
                                const orderMap = new Map(tshirtSizes.map((size, i) => [size, i]));

                                const orderedSizes = (Object.entries(s.sizeQty) as [Size, number][]).sort(
                                    ([a], [b]) => (orderMap.get(a) ?? 999) - (orderMap.get(b) ?? 999),
                                );

                                return (
                                    <div
                                        key={s.productId}
                                        className="flex gap-2"
                                    >
                                        <span className="text-info-content">{s.name}:</span>

                                        {orderedSizes.map(([size, qty]) => (
                                            <span
                                                key={size}
                                                className="badge badge-outline text-info-content"
                                            >
                                                {size}: {qty}
                                            </span>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
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
                                            <td className="border px-2 py-1">{greekLetters(purchase.teamId ?? "-")}</td>
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

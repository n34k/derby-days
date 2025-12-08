"use client";
import React, { useEffect, useMemo, useState } from "react";
import { formatUSD } from "@/lib/formatUSD";
import { Tshirt } from "@/generated/prisma";
import InfoCircle from "@/components/modals/InfoCircle";

type Team = { id: string; name: string };

const ShirtsOrder = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [shirts, setShirts] = useState<Tshirt[]>([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [qty, setQty] = useState<Record<string, number>>({});
    const [teamId, setTeamId] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // fetch teams
        fetch("/api/teams")
            .then((r) => r.json())
            .then(setTeams);
        // fetch only shirts
        fetch("/api/tshirt")
            .then((r) => r.json())
            .then((items: Tshirt[]) => {
                setShirts(items);
                // init quantities to 0
                const init: Record<string, number> = {};
                items.forEach((p) => (init[p.productId] = 0));
                setQty(init);
            });
    }, []);

    const lineSubtotals = useMemo(() => {
        return shirts.map((p) => ({
            id: p.productId,
            name: p.name,
            priceCents: p.price,
            qty: qty[p.productId] ?? 0,
            subtotalCents: (qty[p.productId] ?? 0) * p.price,
        }));
    }, [shirts, qty]);

    const totalCents = useMemo(() => lineSubtotals.reduce((s, li) => s + li.subtotalCents, 0), [lineSubtotals]);

    const canCheckout = totalCents > 0 && !!teamId;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!canCheckout) return;

        const items = lineSubtotals
            .filter((li) => li.qty > 0)
            .map((li) => ({
                productId: li.id, // your DB product ID
                quantity: li.qty,
            }));

        if (items.length === 0) {
            alert("Please select at least one shirt.");
            return;
        }

        const metadata = {
            email,
            name,
            category: "shirt",
            teamId,
            items: JSON.stringify(items),
        };

        setLoading(true);
        try {
            const res = await fetch("/api/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items, metadata }),
            });

            const data = await res.json();
            if (!res.ok || !data.url) {
                console.error("Checkout failed:", data);
                alert(data.error ?? "Unable to start checkout. Please try again.");
                setLoading(false);
                return;
            }

            window.location.href = data.url;
        } catch (err) {
            console.error("Checkout error:", err);
            alert("Unexpected error starting checkout.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex items-center justify-center pb-10">
            <form
                className="flex flex-col rounded-2xl border-1 border-secondary gap-4 items-center bg-primary p-8 md:w-[720px] mt-10 mx-5"
                onSubmit={handleSubmit}
            >
                <h1 className="text-3xl font-bold text-primary-content">T-Shirts Purchase</h1>
                {/* Name */}
                <div className="form-control w-full max-w-md">
                    <label className="label">
                        <span className="label-text">Name</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        className="input input-bordered text-black bg-white rounded-sm w-full"
                        required
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                {/* Email */}
                <div className="form-control w-full max-w-md">
                    <label className="label">
                        <span className="label-text">Email</span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        className="input input-bordered text-black bg-white rounded-sm w-full"
                        required
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                {/* Team select */}
                <div className="form-control w-full max-w-md">
                    <label className="label flex items-center gap-1">
                        <span className="label-text">Team for credit</span>
                        <InfoCircle>Your purchase will add to this teams total in the standings.</InfoCircle>
                    </label>
                    <select
                        className="select select-bordered bg-white text-black rounded-sm w-full"
                        value={teamId}
                        onChange={(e) => setTeamId(e.target.value)}
                        required
                    >
                        <option
                            value=""
                            disabled
                            hidden
                        >
                            -
                        </option>
                        {teams.map((t) => (
                            <option
                                key={t.id}
                                value={t.id}
                            >
                                {t.name}
                            </option>
                        ))}
                    </select>
                </div>
                {/* shirts grid */}
                <div className="w-full max-w-md mt-2">
                    <h2 className="text-xl font-semibold text-primary-content mb-2">Choose sizes</h2>
                    <ul className="flex flex-col gap-3">
                        {shirts.map((p) => (
                            <li
                                key={p.productId}
                                className="flex items-center justify-between bg-base-100 rounded-lg px-3 py-2"
                            >
                                <div className="flex flex-col">
                                    <span className="text-primary-content font-medium">{p.name}</span>
                                    <span className="text-sm opacity-80">{formatUSD(p.price / 100)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min={0}
                                        max={10}
                                        value={qty[p.productId] ?? 0}
                                        onChange={(e) => {
                                            const val = Math.max(0, Math.min(10, Number(e.target.value || 0)));
                                            setQty((prev) => ({
                                                ...prev,
                                                [p.productId]: val,
                                            }));
                                        }}
                                        className="input input-bordered w-20 text-center bg-white text-black rounded-sm"
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Totals */}
                <div className="w-full max-w-md mt-4">
                    <div className="flex items-center justify-between">
                        <span className="text-primary-content font-semibold">Total</span>
                        <span className="text-primary-content font-bold">{formatUSD(totalCents / 100)}</span>
                    </div>
                </div>
                <button
                    type="submit"
                    className="btn btn-secondary w-full max-w-md mt-2"
                    disabled={loading || !canCheckout}
                >
                    {loading ? <span className="loading loading-spinner" /> : "Continue to Payment"}
                </button>
                {!canCheckout && (
                    <p className="text-sm opacity-80 mt-1">Select a team and at least one shirt to continue.</p>
                )}
            </form>
        </main>
    );
};

export default ShirtsOrder;

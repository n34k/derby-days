"use client";
import React, { useEffect, useMemo, useState } from "react";
import { formatUSD } from "@/lib/formatUSD";
import { Tshirt } from "@/generated/prisma";
import InfoCircle from "@/components/modals/InfoCircle";
import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/24/outline";

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
        fetch("/api/teams")
            .then((r) => r.json())
            .then(setTeams);

        fetch("/api/tshirt")
            .then((r) => r.json())
            .then((items: Tshirt[]) => {
                setShirts(items);
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

    const canCheckout = totalCents > 0 && !!teamId && !!name && !!email;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!canCheckout) return;

        const items = lineSubtotals.filter((li) => li.qty > 0).map((li) => ({ productId: li.id, quantity: li.qty }));

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
        <div className="flex justify-center my-6 px-4">
            <form
                className="flex flex-col rounded-2xl border gap-4 items-center bg-primary overflow-y-scroll p-8 w-full max-w-md md:max-w-xl"
                onSubmit={handleSubmit}
            >
                <h1 className="text-3xl font-bold text-primary-content">T-Shirts Purchase</h1>

                {/* Name */}
                <div className="form-control w-full max-w-md md:max-w-xl">
                    <label className="label">
                        <span className="label-text">Name</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        className="input input-bordered text-black bg-white rounded-sm w-full"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                    />
                </div>

                {/* Email */}
                <div className="form-control w-full max-w-md md:max-w-xl">
                    <label className="label">
                        <span className="label-text">Email</span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        className="input input-bordered text-black bg-white rounded-sm w-full"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                </div>

                {/* Team select */}
                <div className="form-control w-full max-w-md md:max-w-xl">
                    <label className="label flex items-center gap-1">
                        <span className="label-text">Team for credit</span>
                        <InfoCircle>Your purchase will add to this team&apos;s total in the standings.</InfoCircle>
                    </label>
                    <select
                        className="select select-bordered bg-white text-black rounded-sm w-full"
                        value={teamId}
                        onChange={(e) => setTeamId(e.target.value)}
                        required
                        disabled={loading}
                    >
                        <option value="">Select a team…</option>
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

                {/* Shirts */}
                <div className="w-full max-w-md md:max-w-xl mt-2">
                    <label className="label">
                        <span className="label-text text-lg font-semibold text-primary-content">Choose sizes</span>
                    </label>

                    <ul className="flex flex-col gap-2">
                        {shirts.map((p) => {
                            const currentQty = qty[p.productId] ?? 0;

                            return (
                                <li
                                    key={p.productId}
                                    className="border border-base-content/20 bg-base-100 rounded-sm px-3 py-3"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex flex-col text-left">
                                            <span className="text-primary-content font-medium">{p.name}</span>
                                            <span className="text-sm opacity-80">{formatUSD(p.price / 100)}</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => {
                                                    if (currentQty === 0) return;
                                                    setQty((prev) => ({ ...prev, [p.productId]: currentQty - 1 }));
                                                }}
                                                disabled={loading || currentQty === 0}
                                                aria-label={`Decrease ${p.name}`}
                                            >
                                                <MinusCircleIcon className="w-6 h-6" />
                                            </button>

                                            <span className="min-w-[2ch] text-center text-primary-content">
                                                {currentQty}
                                            </span>

                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => {
                                                    if (currentQty === 10) return;
                                                    setQty((prev) => ({ ...prev, [p.productId]: currentQty + 1 }));
                                                }}
                                                disabled={loading || currentQty === 10}
                                                aria-label={`Increase ${p.name}`}
                                            >
                                                <PlusCircleIcon className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Total */}
                <div className="w-full max-w-md md:max-w-xl mt-2">
                    <div className="flex items-center justify-between">
                        <span className="text-primary-content font-semibold">Total</span>
                        <span className="text-primary-content font-bold">{formatUSD(totalCents / 100)}</span>
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-secondary w-full max-w-md md:max-w-xl"
                    disabled={loading || !canCheckout}
                >
                    {loading ? <span className="loading loading-spinner" /> : "Continue to Payment"}
                </button>
            </form>
        </div>
    );
};

export default ShirtsOrder;

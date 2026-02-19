"use client";
import React, { useEffect, useState } from "react";
import { formatUSD } from "@/lib/formatUSD";
import { Tshirt } from "@/generated/prisma";
import InfoCircle from "@/components/modals/InfoCircle";
import { tshirtSizes } from "@/models/tshirtSizes";
import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/24/outline";

type Team = { id: string; name: string };

type ShirtAddToCart = { name: string; productId: string; size: string };

export type ShirtCart = ShirtAddToCart & {
    qty: number;
};

const ShirtsOrder = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [shirts, setShirts] = useState<Tshirt[]>([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [teamId, setTeamId] = useState("");
    const [loading, setLoading] = useState(false);
    const [cart, setCart] = useState<ShirtCart[]>([]);

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
            });
    }, []);

    const canCheckout = cart.length > 0 && !!teamId && !!name && !!email;

    const addToCart = (shirt: ShirtAddToCart) => {
        setCart((prevCart) => {
            const existing = prevCart.find((item) => item.productId === shirt.productId && item.size === shirt.size);

            if (existing) {
                return prevCart.map((item) =>
                    item.productId === shirt.productId && item.size === shirt.size
                        ? { ...item, qty: item.qty + 1 }
                        : item,
                );
            }

            return [...prevCart, { ...shirt, qty: 1 }];
        });
    };

    const incQty = (productId: string, size: string) => {
        setCart((prev) =>
            prev.map((item) =>
                item.productId === productId && item.size === size
                    ? { ...item, qty: Math.min(10, item.qty + 1) }
                    : item,
            ),
        );
    };

    const decQty = (productId: string, size: string) => {
        setCart((prev) =>
            prev
                .map((item) =>
                    item.productId === productId && item.size === size ? { ...item, qty: item.qty - 1 } : item,
                )
                .filter((item) => item.qty > 0),
        );
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!canCheckout) return;

        const metadata = {
            email,
            name,
            category: "shirt",
            teamId,
            userData: null,
            items: JSON.stringify(cart),
        };

        setLoading(true);
        try {
            const res = await fetch("/api/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: cart, metadata }),
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
                        <span className="label-text text-lg font-semibold text-primary-content">Choose shirts</span>
                    </label>

                    <ul className="flex flex-col gap-2">
                        {shirts.map((p) => {
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
                                            {tshirtSizes.map((s) => (
                                                <button
                                                    className="btn"
                                                    type="button"
                                                    key={s}
                                                    onClick={() =>
                                                        addToCart({ size: s, productId: p.productId, name: p.name })
                                                    }
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="w-full max-w-md md:max-w-xl mt-2">
                    <label className="label">
                        <span className="label-text text-lg font-semibold text-primary-content">Cart</span>
                    </label>
                    {cart.length === 0 ? (
                        <p className="text-center text-info-content">Cart is empty</p>
                    ) : (
                        <ul>
                            {cart.map((s) => {
                                const key = s.productId + s.size;
                                return (
                                    <li
                                        key={key}
                                        className="flex flex-row justify-between border border-base-content/20 bg-base-100 rounded-sm px-3 py-3"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex flex-col text-left">
                                                <span className="text-primary-content font-medium">{s.name}</span>
                                                <span className="text-sm opacity-80">Size: {s.size}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => decQty(s.productId, s.size)}
                                            >
                                                <MinusCircleIcon className="w-6 h-6" />
                                            </button>
                                            <span className="min-w-[2ch] text-center text-primary-content">
                                                {s.qty}
                                            </span>
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => incQty(s.productId, s.size)}
                                                disabled={loading || s.qty === 10}
                                            >
                                                <PlusCircleIcon className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
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

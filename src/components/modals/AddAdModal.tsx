"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { User } from "@/generated/prisma";

type TeamOption = { id: string; name: string };

type Props = {
    isOpen: boolean;
    onClose: () => void;
    teams: TeamOption[];
    users: Pick<User, "id" | "name" | "email">[];
};

type Size = "Quarter Page" | "Half Page" | "Full Page" | "Business Card";
type ReferredByType = "" | "TEAM" | "USER";

export default function AddAdModal({ isOpen, onClose, teams, users }: Props) {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [size, setSize] = useState<Size | "">("");
    const [referredByType, setReferredByType] = useState<ReferredByType>("");
    const [referredById, setReferredById] = useState<string>("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const resetForm = () => {
        setName("");
        setEmail("");
        setSize("");
        setReferredByType("");
        setReferredById("");
    };

    const canSubmit =
        name.trim().length > 0 &&
        email.trim().length > 0 &&
        size !== "" &&
        // require referredBy selection:
        referredByType !== "" &&
        referredById !== "";

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch("/api/admin/ad", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    size,
                    referredByType, // "TEAM" | "USER"
                    referredById, // id of the selected team or user
                }),
            });

            if (!res.ok) {
                let msg = "Failed to add ad";
                try {
                    const data = await res.json();
                    msg = data?.error || msg;
                } catch {}
                throw new Error(msg);
            }

            await res.json();
            onClose();
            resetForm();
        } catch (err) {
            setError((err as Error)?.message || "Something went wrong");
        } finally {
            setSubmitting(false);
            router.refresh();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-primary p-6 rounded-xl shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Add Ad</h2>

                <form onSubmit={submit} className="space-y-3">
                    {/* Name */}
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={submitting}
                    />

                    {/* Email */}
                    <input
                        type="email"
                        className="input input-bordered w-full"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={submitting}
                    />

                    {/* Size */}
                    <select
                        className="select select-bordered w-full"
                        value={size}
                        onChange={(e) => setSize(e.target.value as Size | "")}
                        disabled={submitting}
                    >
                        <option value="">Select size…</option>
                        <option value="Quarter Page">Quarter Page</option>
                        <option value="Half Page">Half Page</option>
                        <option value="Full Page">Full Page</option>
                        <option value="Business Card">Business Card</option>
                    </select>

                    {/* Referred By: choose Team or User */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            className={`btn ${
                                referredByType === "TEAM" ? "btn-secondary" : ""
                            }`}
                            onClick={() => {
                                setReferredByType("TEAM");
                                setReferredById("");
                            }}
                            disabled={submitting}
                        >
                            Referred by Team
                        </button>
                        <button
                            type="button"
                            className={`btn ${
                                referredByType === "USER" ? "btn-secondary" : ""
                            }`}
                            onClick={() => {
                                setReferredByType("USER");
                                setReferredById("");
                            }}
                            disabled={submitting}
                        >
                            Referred by User
                        </button>
                    </div>

                    {/* Conditional dropdown based on choice */}
                    {referredByType === "TEAM" && (
                        <select
                            className="select select-bordered w-full"
                            value={referredById}
                            onChange={(e) => setReferredById(e.target.value)}
                            disabled={submitting}
                        >
                            <option value="">Select a team…</option>
                            {teams.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    )}

                    {referredByType === "USER" && (
                        <select
                            className="select select-bordered w-full"
                            value={referredById}
                            onChange={(e) => setReferredById(e.target.value)}
                            disabled={submitting}
                        >
                            <option value="">Select a user…</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name || u.email}
                                </option>
                            ))}
                        </select>
                    )}

                    {error && <p className="text-error text-sm">{error}</p>}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            className="btn"
                            onClick={() => {
                                onClose();
                            }}
                            disabled={submitting}
                            title="Close"
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </button>

                        <button
                            type="submit"
                            className="btn btn-secondary"
                            disabled={!canSubmit || submitting}
                        >
                            {submitting ? (
                                "Adding…"
                            ) : (
                                <CheckIcon className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

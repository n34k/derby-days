"use client";
import { useMemo, useState } from "react";
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

type ReferredByType = "" | "TEAM" | "USER";

export default function AddDonationModal({
    isOpen,
    onClose,
    teams,
    users,
}: Props) {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [note, setNote] = useState("");
    const [amount, setAmount] = useState<string>("");

    const [referredByType, setReferredByType] = useState<ReferredByType>("");
    const [referredById, setReferredById] = useState<string>("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sortedTeams = useMemo(
        () => [...teams].sort((a, b) => a.name.localeCompare(b.name)),
        [teams]
    );
    const sortedUsers = useMemo(
        () =>
            [...users].sort((a, b) =>
                (a.name ?? a.email ?? "").localeCompare(b.name ?? b.email ?? "")
            ),
        [users]
    );

    if (!isOpen) return null;

    const resetForm = () => {
        setName("");
        setEmail("");
        setNote("");
        setAmount("");
        setReferredByType("");
        setReferredById("");
    };

    const parsedAmount = (() => {
        const n = Number(amount);
        return Number.isFinite(n) ? n : NaN;
    })();

    const amountValid = parsedAmount > 0;

    const canSubmit =
        name.trim().length > 0 &&
        email.trim().length > 0 &&
        amountValid &&
        referredByType !== "" &&
        referredById !== "";

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch("/api/admin/donation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    note: note.trim() || null,
                    amount: Number(parsedAmount.toFixed(2)), // ensure 2-decimal precision
                    referredByType, // "TEAM" | "USER"
                    referredById, // id of the selected team or user
                }),
            });

            if (!res.ok) {
                let msg = "Failed to add donation";
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
                <h2 className="text-xl font-bold mb-4">Add Donation</h2>

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

                    {/* Amount */}
                    <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        className="input input-bordered w-full"
                        placeholder="Amount (e.g., 50.00)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={submitting}
                    />
                    {!amountValid && amount !== "" && (
                        <p className="text-xs text-error -mt-2">
                            Enter a valid amount &gt; 0
                        </p>
                    )}

                    {/* Note (optional) */}
                    <textarea
                        className="textarea textarea-bordered w-full"
                        placeholder="Note (optional)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        disabled={submitting}
                        rows={3}
                    />

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

                    {/* Conditional dropdown */}
                    {referredByType === "TEAM" && (
                        <select
                            className="select select-bordered w-full"
                            value={referredById}
                            onChange={(e) => setReferredById(e.target.value)}
                            disabled={submitting}
                        >
                            <option value="">Select a team…</option>
                            {sortedTeams.map((t) => (
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
                            {sortedUsers.map((u) => (
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
                            onClick={onClose}
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

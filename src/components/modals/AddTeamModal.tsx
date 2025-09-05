"use client";

import { useMemo, useState } from "react";
import { PREDEFINED_TEAMS } from "@/lib/predefinedTeams";
import { useRouter } from "next/navigation";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    existingIds: string[]; // ids already in DB
};

export default function AddTeamModal({ isOpen, onClose, existingIds }: Props) {
    const router = useRouter();
    const [id, setid] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const remaining = useMemo(() => {
        const taken = new Set(existingIds);
        const all = PREDEFINED_TEAMS.filter((t) => !taken.has(t.id));
        return all;
    }, [existingIds]);

    if (!isOpen) return null;

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/team", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) {
                let msg = "Failed to add team";
                try {
                    const data = await res.json();
                    msg = data?.error || msg;
                } catch {}
                throw new Error(msg);
            }
            const data = await res.json();
            console.log("team added succ", data);
            onClose();
            setid("");
        } catch {
            setError("Something went wrong");
        } finally {
            setSubmitting(false);
            router.refresh();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-primary p-6 rounded-xl shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Add Team</h2>
                <form onSubmit={submit} className="space-y-3">
                    <select
                        className="select select-bordered w-full"
                        value={id}
                        onChange={(e) => setid(e.target.value)}
                        disabled={submitting}
                    >
                        <option value="">Select a team…</option>
                        {remaining.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>

                    {error && <p className="text-error text-sm">{error}</p>}

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            className="btn"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                        <button
                            type="submit"
                            className="btn btn-secondary"
                            disabled={!id || submitting}
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

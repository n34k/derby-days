"use client";

import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { useState } from "react";

type EmailAddModalProps = {
    isOpen: boolean;
    onClose: () => void;
    existingEmails: string[];
};

export default function EmailAddModal({
    isOpen,
    onClose,
    existingEmails,
}: EmailAddModalProps) {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const normalized = email.trim().toLowerCase();
    const isDuplicate = existingEmails
        .map((e) => e.toLowerCase().trim())
        .includes(normalized);

    const canSubmit = !!normalized && !isDuplicate && !submitting;

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: normalized }),
            });

            if (!res.ok) {
                let msg = "Failed to add email";
                try {
                    const data = await res.json();
                    msg = data?.error || msg;
                } catch {}
                throw new Error(msg);
            }

            setEmail("");
            router.refresh();
            onClose();
        } catch {
            setError("Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-primary p-6 rounded-xl shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Add Email</h2>
                <form onSubmit={submit} className="space-y-4">
                    <div className="form-control">
                        <input
                            className="input input-bordered w-full"
                            placeholder="brother@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={submitting}
                        />
                    </div>

                    {isDuplicate && (
                        <p className="text-error text-sm">
                            This email is already added.
                        </p>
                    )}
                    {error && <p className="text-error text-sm">{error}</p>}

                    <div className="flex justify-end gap-3">
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
                            disabled={!canSubmit}
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export default function AddScheduleEntryModal({ isOpen, onClose }: Props) {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [startTime, setStartTime] = useState(""); // datetime-local string

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setLocation("");
        setStartTime("");
    };

    const canSubmit =
        title.trim().length > 0 && startTime.trim().length > 0 && !Number.isNaN(new Date(startTime).getTime());

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch("/api/admin/scheduleEntry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description: description.trim() ? description : null,
                    location: location.trim() ? location : null,
                    startTime: new Date(startTime).toISOString(),
                }),
            });

            if (!res.ok) {
                let msg = "Failed to add schedule entry";
                try {
                    const data = await res.json();
                    msg = data?.error || msg;
                } catch {}
                throw new Error(msg);
            }

            await res.json();
            onClose();
            resetForm();
            router.refresh();
        } catch (err) {
            setError((err as Error)?.message || "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-primary p-6 rounded-xl shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Add Schedule Entry</h2>

                <form
                    onSubmit={submit}
                    className="space-y-3"
                >
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={submitting}
                    />

                    <textarea
                        className="textarea textarea-bordered w-full"
                        placeholder="Description (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={submitting}
                        rows={3}
                    />

                    <input
                        type="text"
                        className="input input-bordered w-full"
                        placeholder="Location (optional)"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        disabled={submitting}
                    />

                    <input
                        type="datetime-local"
                        className="input input-bordered w-full"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        disabled={submitting}
                    />

                    {error && <p className="text-error text-sm">{error}</p>}

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            className="btn"
                            onClick={() => onClose()}
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
                            {submitting ? "Adding…" : <CheckIcon className="h-4 w-4" />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

"use client";

import React, { useMemo, useState } from "react";
import { PencilIcon, XMarkIcon, CheckIcon, TrashIcon, ChevronDownIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import AddScheduleEntryModal from "@/components/modals/AddScheduleEntryModal";
import { ScheduleEntry } from "@/generated/prisma";

type EditedEntry = Partial<{
    title: string;
    description: string | null;
    location: string | null;
    startTime: string; // ISO
}>;

function toDateTimeLocalValue(iso: string) {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

interface ScheduleEntriesTableProps {
    entries: ScheduleEntry[];
}

const ScheduleEntriesTable: React.FC<ScheduleEntriesTableProps> = ({ entries }) => {
    const router = useRouter();

    const [expanded, setExpanded] = useState(false);
    const [editing, setEditing] = useState(false);
    const [edited, setEdited] = useState<Record<string, EditedEntry>>({});
    const [loading, setLoading] = useState(false);
    const [addOpen, setAddOpen] = useState(false);

    const hasUnsavedChanges = Object.keys(edited).length > 0;

    const orderedEntries = useMemo(() => {
        return [...entries].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }, [entries]);

    const toggleEditing = () => setEditing((v) => !v);

    const cancelEditing = () => {
        if (hasUnsavedChanges) {
            const confirmed = window.confirm("You have unsaved changes, are you sure you want to cancel?");
            if (!confirmed) return;
        }
        setEditing(false);
        setEdited({});
    };

    const handleChange = (id: string, field: keyof EditedEntry, value: string | null) => {
        setEdited((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value,
            },
        }));
    };

    const handleSave = async () => {
        const updates = Object.entries(edited);
        if (updates.length === 0) return;

        setLoading(true);

        try {
            for (const [id, patch] of updates) {
                const res = await fetch(`/api/admin/scheduleEntry/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(patch),
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    console.error(`Failed to update schedule entry ${id}:`, err);
                }
            }

            // Since you are not keeping local state, this is your single source of truth:
            router.refresh();
            setEdited({});
            setEditing(false);
        } catch (e) {
            console.error("Error saving schedule entries:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this schedule entry?")) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/scheduleEntry/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                console.error("Failed to delete schedule entry:", err);
                return;
            }

            // If the deleted row had pending edits, drop them
            setEdited((prev) => {
                if (!prev[id]) return prev;
                const next = { ...prev };
                delete next[id];
                return next;
            });

            router.refresh();
        } catch (e) {
            console.error("Error deleting schedule entry:", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <AddScheduleEntryModal
                isOpen={addOpen}
                onClose={() => {
                    setAddOpen(false);
                    router.refresh(); // ensure list updates after POST
                }}
            />

            <div className="flex flex-wrap items-center gap-2.5 pb-2.5">
                <h2 className="text-2xl font-semibold">Schedule Entries</h2>

                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    aria-expanded={expanded}
                    className="p-1 rounded hover:bg-base-200 transition"
                    title={expanded ? "Collapse" : "Expand"}
                >
                    <ChevronDownIcon className={`w-7 h-7 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>

                {expanded &&
                    (editing ? (
                        <>
                            <button
                                className={`btn btn-circle ${loading ? "btn-primary" : "btn-secondary"}`}
                                onClick={loading ? undefined : cancelEditing}
                                disabled={loading}
                                title="Cancel"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>

                            <button
                                className={`btn btn-circle ${loading ? "btn-primary" : "btn-secondary"}`}
                                onClick={loading ? undefined : () => setAddOpen(true)}
                                disabled={loading}
                                title="Add"
                            >
                                <PlusIcon className="h-4 w-4" />
                            </button>

                            <button
                                className={`btn btn-circle ${loading ? "btn-primary" : "btn-secondary"}`}
                                onClick={loading ? undefined : handleSave}
                                disabled={!hasUnsavedChanges || loading}
                                title="Save"
                            >
                                <CheckIcon className="h-4 w-4" />
                            </button>
                        </>
                    ) : (
                        <button
                            className="btn btn-circle btn-secondary"
                            onClick={toggleEditing}
                            title="Edit"
                        >
                            <PencilIcon className="h-4 w-4" />
                        </button>
                    ))}
            </div>

            {expanded && (
                <div className="overflow-x-auto w-full">
                    <table className="md:table-fixed w-full border border-base-content text-sm">
                        <thead className="bg-base-200">
                            <tr>
                                <th className="border px-2 py-1">Title</th>
                                <th className="border px-2 py-1">Description</th>
                                <th className="border px-2 py-1">Start Time</th>
                                <th className="border px-2 py-1">Location</th>
                                {editing && <th className="border px-2 py-1 w-[60px]">Delete</th>}
                            </tr>
                        </thead>

                        <tbody>
                            {orderedEntries.map((entry) => {
                                const isEdited = edited[entry.id];

                                const titleVal = (isEdited?.title ?? entry.title) as string;
                                const descVal = (isEdited?.description ?? entry.description) as string | null;
                                const locVal = (isEdited?.location ?? entry.location) as string | null;

                                // Prisma type is Date for startTime at runtime, but could serialize to string depending on how you pass it.
                                // Normalize to ISO string for the input:
                                const rawStart = isEdited?.startTime ?? entry.startTime;
                                const startIso =
                                    typeof rawStart === "string" ? rawStart : new Date(rawStart).toISOString();

                                return (
                                    <tr key={entry.id}>
                                        <td className="border px-2 py-1 text-center">
                                            {editing ? (
                                                <input
                                                    className="w-full"
                                                    value={titleVal}
                                                    onChange={(e) => handleChange(entry.id, "title", e.target.value)}
                                                />
                                            ) : (
                                                entry.title
                                            )}
                                        </td>

                                        <td className="border px-2 py-1 text-center">
                                            {editing ? (
                                                <input
                                                    className="w-full"
                                                    value={descVal ?? ""}
                                                    placeholder="—"
                                                    onChange={(e) =>
                                                        handleChange(
                                                            entry.id,
                                                            "description",
                                                            e.target.value.trim() ? e.target.value : null
                                                        )
                                                    }
                                                />
                                            ) : (
                                                entry.description ?? "—"
                                            )}
                                        </td>

                                        <td className="border px-2 py-1 text-center">
                                            {editing ? (
                                                <input
                                                    type="datetime-local"
                                                    className="w-full"
                                                    value={toDateTimeLocalValue(startIso)}
                                                    onChange={(e) => {
                                                        const dt = new Date(e.target.value);
                                                        handleChange(entry.id, "startTime", dt.toISOString());
                                                    }}
                                                />
                                            ) : (
                                                new Date(entry.startTime).toLocaleString()
                                            )}
                                        </td>

                                        <td className="border px-2 py-1 text-center">
                                            {editing ? (
                                                <input
                                                    className="w-full"
                                                    value={locVal ?? ""}
                                                    placeholder="—"
                                                    onChange={(e) =>
                                                        handleChange(
                                                            entry.id,
                                                            "location",
                                                            e.target.value.trim() ? e.target.value : null
                                                        )
                                                    }
                                                />
                                            ) : (
                                                entry.location ?? "—"
                                            )}
                                        </td>

                                        {editing && (
                                            <td className="border px-2 py-1">
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => handleDelete(entry.id)}
                                                        className="btn btn-error btn-circle"
                                                        disabled={loading}
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}

                            {orderedEntries.length === 0 && (
                                <tr>
                                    <td
                                        className="border px-2 py-4 text-center"
                                        colSpan={editing ? 5 : 4}
                                    >
                                        No schedule entries yet.
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

export default ScheduleEntriesTable;

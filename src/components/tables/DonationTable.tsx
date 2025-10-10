"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    CheckIcon,
    PencilIcon,
    XMarkIcon,
    ChevronDownIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";
import type { Donation, Team, User } from "@/generated/prisma";
import greekLetters from "@/lib/greekLetters";
import AddDonationModal from "../modals/AddDonationModal";

type DonationTableProps = {
    donations: Donation[];
    users: Pick<User, "id" | "name" | "email">[];
    teams: Pick<Team, "id" | "name">[];
};

export default function DonationTable({
    donations,
    users,
    teams,
}: DonationTableProps) {
    const router = useRouter();
    const [expanded, setExpanded] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editedNotes, setEditedNotes] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // newest first
    const rows = useMemo(
        () =>
            [...donations].sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            ),
        [donations]
    );

    // Fast user lookup
    const userNameById = useMemo(() => {
        const m = new Map<string, string>();
        for (const u of users) {
            m.set(u.id, u.name ?? u.email ?? "Unnamed");
        }
        return m;
    }, [users]);

    const handleNoteChange = (id: string, val: string) => {
        setEditedNotes((prev) => ({ ...prev, [id]: val }));
    };

    const hasUnsaved = Object.keys(editedNotes).length > 0;

    const toggleEditing = () => setEditing((e) => !e);

    const cancelEditing = () => {
        if (hasUnsaved && !confirm("Discard unsaved changes?")) return;
        setEditedNotes({});
        setEditing(false);
    };

    const handleSave = async () => {
        if (!hasUnsaved) return;
        setSaving(true);
        setError(null);
        try {
            for (const [id, note] of Object.entries(editedNotes)) {
                const res = await fetch(`/api/admin/donation/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ note }),
                });
                if (!res.ok) {
                    let msg = `Failed to save note for donation ${id}`;
                    try {
                        const data = await res.json();
                        msg = data?.error || msg;
                    } catch {}
                    throw new Error(msg);
                }
            }
            setEditedNotes({});
            setEditing(false);
            router.refresh();
        } catch {
            setError("Save failed");
        } finally {
            setSaving(false);
        }
    };

    const onToggleExpanded = () => {
        if (expanded && editing && hasUnsaved) {
            const ok = confirm("Discard unsaved changes and collapse?");
            if (!ok) return;
            setEditedNotes({});
            setEditing(false);
        }
        setExpanded((v) => !v);
    };

    const formatAmount = (n: number) => `$${(n ?? 0).toFixed(2)}`;
    const formatDate = (d: string | Date) =>
        new Date(d).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <div>
            {/* Create Donation Modal */}
            <AddDonationModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                teams={teams}
                users={users}
            />

            {/* Header / Controls */}
            <div className="flex items-center gap-2 pb-2.5">
                <h2 className="text-2xl font-semibold">Donations</h2>

                {/* Chevron toggle */}
                <button
                    type="button"
                    onClick={onToggleExpanded}
                    aria-expanded={expanded}
                    aria-controls="donations-table-panel"
                    className="p-1 rounded hover:bg-base-200 transition"
                    title={expanded ? "Collapse" : "Expand"}
                >
                    <ChevronDownIcon
                        className={`w-7 h-7 transition-transform ${
                            expanded ? "rotate-180" : ""
                        }`}
                    />
                </button>

                {expanded && (
                    <>
                        {!editing ? (
                            <button
                                className="btn btn-secondary btn-circle"
                                onClick={toggleEditing}
                            >
                                <PencilIcon className="h-4 w-4" />
                            </button>
                        ) : (
                            <>
                                <button
                                    className="btn btn-secondary btn-circle"
                                    onClick={cancelEditing}
                                    disabled={saving}
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                                {/* Add donation button */}
                                <button
                                    className="btn btn-secondary btn-circle"
                                    onClick={() => setShowCreateModal(true)}
                                >
                                    <PlusIcon className="h-4 w-4" />
                                </button>
                                <button
                                    className="btn btn-secondary btn-circle"
                                    onClick={handleSave}
                                    disabled={saving || !hasUnsaved}
                                    title={
                                        !hasUnsaved
                                            ? "No changes to save"
                                            : undefined
                                    }
                                >
                                    <CheckIcon className="h-4 w-4" />
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>

            {error && <p className="text-error text-sm mb-2">{error}</p>}

            {/* Only render table when expanded */}
            {expanded && (
                <div
                    id="donations-table-panel"
                    className="overflow-x-auto w-full"
                    role="region"
                    aria-live="polite"
                >
                    <table className="w-full border border-base-content text-sm">
                        <thead className="bg-base-200">
                            <tr>
                                <th className="border px-2 py-1">Date</th>
                                <th className="border px-2 py-1">Name</th>
                                <th className="border px-2 py-1">Email</th>
                                {/* Team stays, displayed via greekLetters */}
                                <th className="border px-2 py-1">Team</th>
                                {/* NEW: User column */}
                                <th className="border px-2 py-1">User</th>
                                <th className="border px-2 py-1">Amount</th>
                                <th className="border px-2 py-1">Note</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((d) => {
                                const noteDraft =
                                    d.id in editedNotes
                                        ? editedNotes[d.id]
                                        : d.note ?? "";
                                const userName =
                                    d.userId && userNameById.get(d.userId)
                                        ? userNameById.get(d.userId)
                                        : null;

                                return (
                                    <tr key={d.id}>
                                        <td className="border px-2 py-1 whitespace-nowrap text-center">
                                            {formatDate(d.createdAt)}
                                        </td>
                                        <td className="border px-2 py-1 text-center">
                                            {d.name || "—"}
                                        </td>
                                        <td className="border px-2 py-1 text-center">
                                            {d.email}
                                        </td>
                                        <td className="border px-2 py-1 text-center">
                                            {d.teamId
                                                ? greekLetters(d.teamId)
                                                : "—"}
                                        </td>
                                        <td className="border px-2 py-1 text-center">
                                            {userName ?? "—"}
                                        </td>
                                        <td className="border px-2 py-1 text-right">
                                            {formatAmount(d.amount)}
                                        </td>
                                        <td className="border px-2 py-1">
                                            {editing ? (
                                                <input
                                                    className="w-full max-w-xs"
                                                    value={noteDraft}
                                                    onChange={(e) =>
                                                        handleNoteChange(
                                                            d.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Add a note…"
                                                    disabled={saving}
                                                />
                                            ) : (
                                                d.note ?? "—"
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {rows.length === 0 && (
                                <tr>
                                    <td
                                        className="border px-2 py-4 text-center"
                                        colSpan={7}
                                    >
                                        No donations yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

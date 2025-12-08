"use client";
import React, { useEffect, useState } from "react";
import { DraftStatus, GlobalRole, User } from "@/generated/prisma";
import { PencilIcon, XMarkIcon, CheckIcon, TrashIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import greekLetters from "@/lib/greekLetters";
import CloudOrNextImg from "../CloudOrNextImg";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

interface UserTableProps {
    users: User[];
    draftStatus: DraftStatus | undefined;
}

export const UsersTable = ({ users, draftStatus }: UserTableProps) => {
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editedUsers, setEditedUsers] = useState<Record<string, Partial<User>>>({});
    const [usersState, setUsersState] = useState<User[]>(users);
    const deleteAllowed = !draftStatus || draftStatus === "NOT_CREATED";
    const hasUnsavedChanges = Object.keys(editedUsers).length > 0; // to make sure no one leaves with unsaved changes
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setUsersState(users);
    }, [users]);

    const toggleEditing = () => setEditing((e) => !e);

    const cancelEditing = () => {
        if (hasUnsavedChanges) {
            const confirmed = window.confirm("You have unsaved changes, are you sure you want to cancel?");
            if (!confirmed) return;
        }
        setEditing(false);
        setEditedUsers({});
    };

    const handleChange = (userId: string, field: keyof User, value: User[keyof User]) => {
        setEditedUsers((prev) => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                [field]: value,
            },
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        const updates = Object.entries(editedUsers);
        for (const [userId, updatedFields] of updates) {
            try {
                const response = await fetch(`/api/admin/user/${userId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedFields),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error(`Failed to update user ${userId}:`, errorData);
                    continue;
                }
                await response.json();
                setUsersState((prev) => prev.map((u) => (u.id === userId ? ({ ...u, ...updatedFields } as User) : u)));
            } catch (error) {
                console.error(`Error updating user ${userId}:`, error);
            } finally {
                setLoading(false);
            }
        }
        setEditing(false);
        setEditedUsers({});
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetch(`/api/admin/user/${userId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const error = await res.json();
                console.error("Failed to delete user:", error);
                return;
            }
            setUsersState((prev) => prev.filter((u) => u.id !== userId));
        } catch (err) {
            console.error("Error deleting user:", err);
        }
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2.5 items-center pb-2.5">
                <h2 className="text-2xl font-semibold">Users</h2>
                {/* Chevron toggle */}
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    aria-expanded={expanded}
                    aria-controls="ad-table-panel"
                    className="p-1 rounded hover:bg-base-200 transition"
                    title={expanded ? "Collapse" : "Expand"}
                >
                    <ChevronDownIcon className={`w-7 h-7 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>
                {expanded &&
                    draftStatus !== "COMPLETE" &&
                    (editing ? (
                        <>
                            {loading ? (
                                <>
                                    <button className="btn btn-primary btn-circle">
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>
                                    <button className="btn btn-primary btn-circle">
                                        <CheckIcon className="h-4 w-4" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        className="btn btn-secondary btn-circle"
                                        onClick={cancelEditing}
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-circle"
                                        onClick={handleSave}
                                        disabled={!hasUnsavedChanges}
                                    >
                                        <CheckIcon className="h-4 w-4" />
                                    </button>
                                </>
                            )}
                        </>
                    ) : (
                        <button
                            className="btn btn-secondary btn-circle"
                            onClick={toggleEditing}
                        >
                            <PencilIcon className="h-4 w-4" />
                        </button>
                    ))}
            </div>

            {/* No max-height wrapper; just render when expanded */}
            {expanded && (
                <div id="users-table-panel">
                    <div className="overflow-x-auto w-full">
                        <table className="md:table-fixed w-full border border-base-content text-sm">
                            <thead className="bg-base-200">
                                <tr>
                                    <th className="border px-2 py-1 w-[140px]">Name</th>
                                    <th className="border px-2 py-1">Email</th>
                                    <th className="border px-2 py-1 w-[55px]">Image</th>
                                    <th className="border px-2 py-1 w-[75px]">Money Raised</th>
                                    <th className="border px-2 py-1">Walkout Song</th>
                                    <th className="border px-2 py-1 w-[120px]">Role</th>
                                    <th className="border px-2 py-1 w-[55px]">Team</th>
                                    {editing && deleteAllowed && (
                                        <th className="border py-1 w-[55px] text-center">Delete</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {usersState.map((user) => {
                                    const isUserEdited = editedUsers[user.id];
                                    return (
                                        <tr key={user.id}>
                                            <td className="border px-2 py-1 text-center">
                                                {editing ? (
                                                    <input
                                                        className="w-[120px] text-center"
                                                        value={isUserEdited?.name ?? user.name ?? ""}
                                                        onChange={(e) => handleChange(user.id, "name", e.target.value)}
                                                    />
                                                ) : (
                                                    user.name ?? "—"
                                                )}
                                            </td>

                                            <td className="border px-2 py-1 text-center">{user.email}</td>

                                            <td className="border px-2 py-1">
                                                {/* Image renders ONLY when expanded because table is conditionally mounted */}
                                                {user.image ? (
                                                    <div onClick={() => setLightboxSrc(user.image!)}>
                                                        <CloudOrNextImg
                                                            src={user.image}
                                                            cloud={user.image.includes("cloudinary")}
                                                            alt={`${user.name} Picture`}
                                                            size={500}
                                                            className="rounded-full w-[40px] h-[40px] border-1 border-info-content cursor-pointer"
                                                        />
                                                    </div>
                                                ) : (
                                                    "—"
                                                )}
                                            </td>

                                            <td className="border px-2">
                                                <div className="flex items-center justify-center">
                                                    ${user.moneyRaised.toFixed(2)}
                                                </div>
                                            </td>

                                            <td className="border px-2 py-1">
                                                <div className="md:overflow-x-auto md:whitespace-nowrap">
                                                    {editing ? (
                                                        <input
                                                            className="w-full truncate"
                                                            value={isUserEdited?.walkoutSong ?? user.walkoutSong ?? ""}
                                                            onChange={(e) =>
                                                                handleChange(user.id, "walkoutSong", e.target.value)
                                                            }
                                                        />
                                                    ) : (
                                                        user.walkoutSong ?? "—"
                                                    )}
                                                </div>
                                            </td>

                                            <td className="border px-2 py-1 w-[120px] text-center">
                                                {editing &&
                                                user.globalRole !== GlobalRole.HEAD_COACH &&
                                                user.globalRole !== GlobalRole.ADMIN ? (
                                                    <select
                                                        className="truncate"
                                                        value={isUserEdited?.globalRole ?? user.globalRole}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                user.id,
                                                                "globalRole",
                                                                e.target.value as User["globalRole"]
                                                            )
                                                        }
                                                    >
                                                        <option value="JUDGE">JUDGE</option>
                                                        <option value="BROTHER">BROTHER</option>
                                                    </select>
                                                ) : (
                                                    user.globalRole
                                                )}
                                            </td>

                                            <td className="border px-2 py-1 text-center">
                                                {user.teamId ? greekLetters(user.teamId) : "—"}
                                            </td>

                                            {editing && deleteAllowed && (
                                                <td className="border px-2 py-1 w-[55px]">
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="btn btn-error btn-circle"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            <Lightbox
                open={!!lightboxSrc}
                close={() => setLightboxSrc(null)}
                slides={lightboxSrc ? [{ src: lightboxSrc }] : []}
                plugins={[Zoom]}
                zoom={{ maxZoomPixelRatio: 2.5, scrollToZoom: true }}
                carousel={{ finite: true }}
                render={{ buttonPrev: () => null, buttonNext: () => null }}
            />
        </div>
    );
};

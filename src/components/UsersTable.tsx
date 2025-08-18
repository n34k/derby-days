"use client";
import React, { useState } from "react";
import { User } from "@/generated/prisma";
import {
    PencilIcon,
    XMarkIcon,
    CheckIcon,
    TrashIcon,
    ChevronDownIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

export const UsersTable = ({ users }: { users: User[] }) => {
    const [expanded, setExpanded] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editedUsers, setEditedUsers] = useState<
        Record<string, Partial<User>>
    >({});
    const [usersState, setUsersState] = useState<User[]>(users);

    const toggleEditing = () => setEditing((e) => !e);

    const handleChange = (
        userId: string,
        field: keyof User,
        value: User[keyof User]
    ) => {
        setEditedUsers((prev) => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                [field]: value,
            },
        }));
    };

    const handleSave = async () => {
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
                    console.error(
                        `Failed to update user ${userId}:`,
                        errorData
                    );
                    continue;
                }
                await response.json();
                setUsersState((prev) =>
                    prev.map((u) =>
                        u.id === userId
                            ? ({ ...u, ...updatedFields } as User)
                            : u
                    )
                );
            } catch (error) {
                console.error(`Error updating user ${userId}:`, error);
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
            <div className="flex flex-wrap gap-2.5 items-center pb-5">
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
                    <ChevronDownIcon
                        className={`w-7 h-7 transition-transform ${
                            expanded ? "rotate-180" : ""
                        }`}
                    />
                </button>
                {expanded &&
                    (editing ? (
                        <>
                            <button
                                className="btn btn-secondary w-1/4 md:w-28"
                                onClick={toggleEditing}
                            >
                                Cancel <XMarkIcon className="h-4 w-4" />
                            </button>
                            <button
                                className="btn btn-secondary w-1/4 md:w-28"
                                onClick={handleSave}
                            >
                                Save <CheckIcon className="h-4 w-4" />
                            </button>
                        </>
                    ) : (
                        <button
                            className="btn btn-secondary w-1/4 md:w-28"
                            onClick={toggleEditing}
                        >
                            Edit <PencilIcon className="h-4 w-4" />
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
                                    <th className="border px-2 py-1">Name</th>
                                    <th className="border px-2 py-1">Email</th>
                                    <th className="border px-2 py-1 md:w-[55px]">
                                        Image
                                    </th>
                                    <th className="border px-2 py-1">
                                        Money Raised
                                    </th>
                                    <th className="border px-2 py-1">
                                        Walkout Song
                                    </th>
                                    <th className="border px-2 py-1">Role</th>
                                    <th className="border px-2 py-1">Team</th>
                                    {editing && (
                                        <th className="border px-2 py-1">
                                            Actions
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {usersState.map((user) => {
                                    const isUserEdited = editedUsers[user.id];
                                    return (
                                        <tr key={user.id}>
                                            <td className="border px-2 py-1">
                                                {editing ? (
                                                    <input
                                                        className="w-full max-w-[150px] truncate"
                                                        value={
                                                            isUserEdited?.name ??
                                                            user.name ??
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                user.id,
                                                                "name",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    user.name ?? "—"
                                                )}
                                            </td>

                                            <td className="border px-2 py-1">
                                                <div className="md:overflow-x-auto md:whitespace-nowrap">
                                                    {user.email}
                                                </div>
                                            </td>

                                            <td className="border px-2 py-1">
                                                {/* Image renders ONLY when expanded because table is conditionally mounted */}
                                                {user.image ? (
                                                    <Image
                                                        src={user.image}
                                                        alt="User"
                                                        width={40}
                                                        height={40}
                                                        className="rounded-full"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    "—"
                                                )}
                                            </td>

                                            <td className="border px-2 py-1">
                                                <div className="md:flex md:justify-center">
                                                    {editing ? (
                                                        <input
                                                            className="w-full max-w-[50px] truncate"
                                                            type="number"
                                                            value={
                                                                isUserEdited?.moneyRaised ??
                                                                user.moneyRaised
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    user.id,
                                                                    "moneyRaised",
                                                                    parseFloat(
                                                                        e.target
                                                                            .value ||
                                                                            "0"
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        `$${user.moneyRaised.toFixed(
                                                            2
                                                        )}`
                                                    )}
                                                </div>
                                            </td>

                                            <td className="border px-2 py-1">
                                                <div className="md:overflow-x-auto md:whitespace-nowrap">
                                                    {editing ? (
                                                        <input
                                                            className="w-full max-w-[150px] truncate"
                                                            value={
                                                                isUserEdited?.walkoutSong ??
                                                                user.walkoutSong ??
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    user.id,
                                                                    "walkoutSong",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        user.walkoutSong ?? "—"
                                                    )}
                                                </div>
                                            </td>

                                            <td className="border px-2 py-1">
                                                {editing ? (
                                                    <select
                                                        className="w-full max-w-[150px] truncate"
                                                        value={
                                                            isUserEdited?.globalRole ??
                                                            user.globalRole
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                user.id,
                                                                "globalRole",
                                                                e.target
                                                                    .value as User["globalRole"]
                                                            )
                                                        }
                                                    >
                                                        <option value="ADMIN">
                                                            ADMIN
                                                        </option>
                                                        <option value="JUDGE">
                                                            JUDGE
                                                        </option>
                                                        <option value="BROTHER">
                                                            BROTHER
                                                        </option>
                                                        {user.globalRole ===
                                                            "HEAD_COACH" && (
                                                            <option value="HEAD_COACH">
                                                                HEAD_COACH
                                                            </option>
                                                        )}
                                                    </select>
                                                ) : (
                                                    user.globalRole
                                                )}
                                            </td>

                                            <td className="border px-2 py-1">
                                                {user.teamId ?? "—"}
                                            </td>

                                            {editing && (
                                                <td className="border px-2 py-1">
                                                    <div className="flex justify-center">
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    user.id
                                                                )
                                                            }
                                                            className="btn btn-error btn-xs text-white"
                                                        >
                                                            Delete
                                                            <TrashIcon className="h-4 w-4 ml-1" />
                                                        </button>
                                                    </div>
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
        </div>
    );
};

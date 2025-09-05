"use client";
import { BrotherEmails } from "@/generated/prisma";
import { useRouter } from "next/navigation";

import React, { useState } from "react";
import {
    TrashIcon,
    CheckIcon,
    XMarkIcon,
    PlusIcon,
    ChevronDownIcon,
    PencilIcon,
} from "@heroicons/react/24/outline";
import EmailAddModal from "../modals/EmailAddModal";

interface EmailsTableProps {
    emails: BrotherEmails[];
}

const EmailsTable = ({ emails }: EmailsTableProps) => {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const toggleEditing = () => setEditing((e) => !e);

    const handleDelete = async (email: string) => {
        if (!confirm("Are you sure you want to delete this email?")) return;
        try {
            const res = await fetch(`/api/admin/email/${email}`, {
                method: "DELETE",
            });
            if (!res.ok) return;
            router.refresh();
        } catch (err) {
            console.error("Error deleting product:", err);
        }
    };

    const onModalClose = () => {
        setShowCreateModal(false);
    };

    return (
        <div>
            <EmailAddModal
                isOpen={showCreateModal}
                onClose={onModalClose}
                existingEmails={emails.map((e) => e.email)}
            />
            <div className="flex gap-2 items-center pb-5">
                <h2 className="text-2xl font-semibold">
                    Allowed Account Emails
                </h2>

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
                                className="btn btn-secondary btn-circle self-center"
                                onClick={toggleEditing}
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                            <button
                                className="btn btn-secondary btn-circle self-center"
                                onClick={() => setShowCreateModal(true)}
                            >
                                <PlusIcon className="h-4 w-4" />
                            </button>
                        </>
                    ) : (
                        <button
                            className="btn btn-secondary btn-circle self-center"
                            onClick={toggleEditing}
                        >
                            <PencilIcon className="h-4 w-4" />
                        </button>
                    ))}
            </div>

            {expanded && (
                <div className="overflow-x-auto w-full">
                    <table className="w-full border border-base-content text-sm mb-5">
                        <thead className="bg-base-200">
                            <tr>
                                <th className="border px-2 py-1">Email</th>
                                <th className="border px-2 py-1">
                                    Account Made
                                </th>
                                {editing && (
                                    <th className="border px-2 py-1">Delete</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {emails.map((e) => {
                                return (
                                    <tr key={e.email}>
                                        <td className="border px-2 py-1 text-center">
                                            {e.email}
                                        </td>
                                        <td className="border px-2 py-1 text-center w-[50px]">
                                            {e.accountMade ? (
                                                <CheckIcon className="h-8 w-8 inline-block text-success" />
                                            ) : (
                                                <XMarkIcon className="h-8 w-8 inline-block text-error" />
                                            )}
                                        </td>
                                        {editing && (
                                            <td className="border px-2 py-1 text-center w-[50px]">
                                                <button
                                                    className="btn btn-circle btn-error"
                                                    onClick={() =>
                                                        handleDelete(e.email)
                                                    }
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
            )}
        </div>
    );
};

export default EmailsTable;

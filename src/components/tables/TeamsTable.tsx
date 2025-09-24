"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    PencilIcon,
    XMarkIcon,
    CheckIcon,
    TrashIcon,
    ChevronDownIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";
import {
    CldImage,
    CldUploadWidget,
    CloudinaryUploadWidgetInfo,
} from "next-cloudinary";
import { useRouter } from "next/navigation";
import {
    CoachOption,
    EditedTeam,
    TeamWithCoach,
} from "@/models/teamTableTypes";
import AddTeamModal from "../modals/AddTeamModal";
import { MAX_TEAMS } from "@/lib/predefinedTeams";
import { DraftStatus } from "@/generated/prisma";

interface TeamsTableProps {
    teams: TeamWithCoach[];
    draftStatus: DraftStatus | undefined;
}

export const TeamsTable = ({ teams, draftStatus }: TeamsTableProps) => {
    const router = useRouter();
    console.log("DRAFT STATUS", draftStatus);
    const createOrDeleteAllowed = !draftStatus || draftStatus === "NOT_CREATED";
    console.log("NODE_ENV", process.env.NODE_ENV);
    const [expanded, setExpanded] = useState(false); // NEW: collapsed by default
    const [editing, setEditing] = useState(false);
    const [editedTeams, setEditedTeams] = useState<Record<string, EditedTeam>>(
        {}
    );
    const [teamState, setTeamState] = useState<TeamWithCoach[]>(teams);

    // Head coach dropdown options
    const [coachOptions, setCoachOptions] = useState<CoachOption[]>([]);
    const [loadingCoaches, setLoadingCoaches] = useState(false);
    const [coachErr, setCoachErr] = useState<string | null>(null);
    const [addOpen, setAddOpen] = useState(false);

    // Cloudinary upload in-flight state (per team)
    const [uploadingTeamId, setUploadingTeamId] = useState<string | null>(null);

    const hasUnsavedChanges = Object.keys(editedTeams).length > 0; // to make sure no one leaves with unsaved changes

    const existingIds = teamState.map((t) => t.id); // ensure Team has slug

    const toggleEditing = () => setEditing((e) => !e);

    const cancelEditing = () => {
        if (hasUnsavedChanges) {
            const confirmed = window.confirm(
                "You have unsaved changes, are you sure you want to cancel?"
            );

            if (!confirmed) return;
        }
        setEditing(false);
        setEditedTeams({});
    };

    const handleChange = (
        teamId: string,
        field: keyof TeamWithCoach,
        value: TeamWithCoach[keyof TeamWithCoach]
    ) => {
        setEditedTeams((prev) => ({
            ...prev,
            [teamId]: {
                ...prev[teamId],
                [field]: value,
            },
        }));
    };

    const handleSave = async () => {
        const updates = Object.entries(editedTeams);

        for (const [teamId, updatedFields] of updates) {
            try {
                const response = await fetch(`/api/admin/team/${teamId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedFields),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error(
                        `Failed to update team ${teamId}:`,
                        errorData
                    );
                    continue;
                }

                const resJson = await response.json();
                const freshTeam = (resJson?.team ??
                    null) as TeamWithCoach | null;

                setTeamState((prev) =>
                    prev.map((t) =>
                        t.id === teamId
                            ? freshTeam ?? { ...t, ...updatedFields }
                            : t
                    )
                );
            } catch (error) {
                console.error(`Error updating team ${teamId}:`, error);
            }
        }

        setEditing(false);
        setEditedTeams({});
        router.refresh();
    };

    const handleDelete = async (teamId: string) => {
        if (!confirm("Are you sure you want to delete this team?")) return;

        try {
            const res = await fetch(`/api/admin/team/${teamId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                console.error("Failed to delete team:", error);
                return;
            }
            setTeamState((prev) => prev.filter((team) => team.id !== teamId));
            router.refresh();
        } catch (err) {
            console.error("Error deleting team:", err);
        }
    };

    // --- Cloudinary: upload/replace Derby Darling image immediately ---
    const handleUploadDerby = async (
        info: CloudinaryUploadWidgetInfo,
        teamId: string
    ) => {
        try {
            setUploadingTeamId(teamId);
            const body = {
                derbyDarlingImageUrl: info.secure_url,
                derbyDarlingPublicId: info.public_id,
            };

            const res = await fetch(`/api/admin/team/${teamId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                console.error("Failed to attach Derby Darling image:", err);
                return;
            }

            const updated = await res.json();
            const freshTeam = (updated?.team ?? null) as TeamWithCoach | null;

            setTeamState((prev) =>
                prev.map((t) =>
                    t.id === teamId
                        ? freshTeam ?? {
                              ...t,
                              derbyDarlingImageUrl: body.derbyDarlingImageUrl,
                              derbyDarlingPublicId: body.derbyDarlingPublicId,
                          }
                        : t
                )
            );

            setEditedTeams((prev) => ({
                ...prev,
                [teamId]: {
                    ...prev[teamId],
                    derbyDarlingImageUrl: info.secure_url,
                    derbyDarlingPublicId: info.public_id,
                },
            }));
        } finally {
            setUploadingTeamId(null);
            router.refresh();
        }
    };

    // Fetch head-coach options
    useEffect(() => {
        (async () => {
            setLoadingCoaches(true);
            setCoachErr(null);
            try {
                const res = await fetch("/api/admin/user", {
                    cache: "no-store",
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                const brothers = Array.isArray(data?.brothers)
                    ? data.brothers
                    : [];
                const options: CoachOption[] = brothers.map(
                    (u: { id: string; name?: string | null }) => ({
                        id: u.id,
                        name: u.name ?? "Unnamed",
                    })
                );
                options.sort((a, b) => a.name.localeCompare(b.name));
                setCoachOptions(options);
            } catch (e) {
                setCoachErr("Failed to load coach options");
                console.error(e);
            } finally {
                setLoadingCoaches(false);
            }
        })();
    }, []);

    useEffect(() => {
        //to make sure table updated after router.refresh() since this table store state for teams
        setTeamState(teams);
    }, [teams]);

    const uploadBtnLabel = useMemo(
        () => (id: string, hasImage: boolean) =>
            uploadingTeamId === id
                ? "Uploading..."
                : hasImage
                ? "Replace"
                : "Upload",
        [uploadingTeamId]
    );

    return (
        <div>
            {/* Header / Controls */}
            <AddTeamModal
                isOpen={addOpen}
                onClose={() => setAddOpen(false)}
                existingIds={existingIds}
            />
            <div className="flex flex-wrap items-center gap-2.5 pb-5">
                <h2 className="text-2xl font-semibold">Teams</h2>

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
                                className="btn btn-secondary btn-circle"
                                onClick={cancelEditing}
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                            {createOrDeleteAllowed &&
                                teams.length !== MAX_TEAMS && (
                                    <button
                                        className="btn btn-secondary btn-circle"
                                        onClick={() => setAddOpen(true)}
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                    </button>
                                )}
                            <button
                                className="btn btn-secondary btn-circle"
                                onClick={handleSave}
                            >
                                <CheckIcon className="h-4 w-4" />
                            </button>
                        </>
                    ) : (
                        <button
                            className="btn btn-circle btn-secondary"
                            onClick={toggleEditing}
                        >
                            <PencilIcon className="h-4 w-4" />
                        </button>
                    ))}
            </div>
            {/* Only render the table when expanded → CldImage & UploadWidget won't load/init until then */}
            {expanded && (
                <div className="overflow-x-auto w-full">
                    <table className="md:table-fixed w-full border border-base-content text-sm">
                        <thead className="bg-base-200">
                            <tr>
                                <th className="border px-2 py-1">Name</th>
                                <th className="border px-2 py-1">T-Shirts</th>
                                <th className="border px-2 py-1">
                                    Money Raised
                                </th>
                                <th className="border px-2 py-1">Points</th>
                                <th className="border px-2 py-1">Head Coach</th>
                                <th className="border px-2 py-1">
                                    Derby Darling Name
                                </th>
                                <th className="border px-2 py-1">
                                    Derby Darling Image
                                </th>
                                {createOrDeleteAllowed && editing && (
                                    <th className="border px-2 py-1 w-[60px]">
                                        Delete
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {teamState.map((team) => {
                                const isEdited = editedTeams[team.id];
                                const currentImageUrl =
                                    (isEdited?.derbyDarlingImageUrl ??
                                        team.derbyDarlingImageUrl) ||
                                    "";
                                const hasImage = Boolean(currentImageUrl);

                                return (
                                    <tr key={team.id}>
                                        {/* Team Name */}
                                        <td className="border px-2 py-1 text-center">
                                            {editing ? (
                                                <input
                                                    className="w-full max-w-[150px] truncate text-center"
                                                    value={
                                                        isEdited?.name ??
                                                        team.name
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            team.id,
                                                            "name",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            ) : (
                                                team.name
                                            )}
                                        </td>

                                        {/* T-Shirts */}
                                        <td className="border px-2 py-1 text-center">
                                            {editing ? (
                                                <input
                                                    type="number"
                                                    className="w-full max-w-[80px] text-center"
                                                    value={
                                                        isEdited?.tshirtsSold ??
                                                        team.tshirtsSold ??
                                                        0
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            team.id,
                                                            "tshirtsSold",
                                                            parseInt(
                                                                e.target
                                                                    .value ||
                                                                    "0",
                                                                10
                                                            )
                                                        )
                                                    }
                                                />
                                            ) : (
                                                team.tshirtsSold ?? "—"
                                            )}
                                        </td>

                                        {/* Money Raised */}
                                        <td className="border px-2 py-1 text-center">
                                            $
                                            {(team.moneyRaised ?? 0).toFixed(2)}
                                        </td>

                                        {/* Points */}
                                        <td className="border px-2 py-1 text-center">
                                            {editing ? (
                                                <input
                                                    type="number"
                                                    className="w-full max-w-[80px] text-center"
                                                    value={
                                                        isEdited?.points ??
                                                        team.points ??
                                                        0
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            team.id,
                                                            "points",
                                                            parseInt(
                                                                e.target
                                                                    .value ||
                                                                    "0",
                                                                10
                                                            )
                                                        )
                                                    }
                                                />
                                            ) : (
                                                team.points ?? "—"
                                            )}
                                        </td>

                                        {/* Head Coach (dropdown) */}
                                        <td className="border px-2 py-1 text-center">
                                            {editing ? (
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        className="w-full max-w-[220px]"
                                                        value={
                                                            isEdited?.headCoachId ??
                                                            team.headCoachId ??
                                                            ""
                                                        }
                                                        onChange={(e) => {
                                                            const val =
                                                                e.target.value; // "" means clear
                                                            handleChange(
                                                                team.id,
                                                                "headCoachId",
                                                                val
                                                            );
                                                        }}
                                                        disabled={
                                                            loadingCoaches ||
                                                            Boolean(coachErr)
                                                        }
                                                    >
                                                        <option value="">
                                                            {team.headCoach
                                                                ? `${team.headCoach.name}`
                                                                : "None"}
                                                        </option>
                                                        {coachOptions.map(
                                                            (opt) => (
                                                                <option
                                                                    key={opt.id}
                                                                    value={
                                                                        opt.id
                                                                    }
                                                                >
                                                                    {opt.name}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                    {loadingCoaches && (
                                                        <span className="text-xs opacity-70">
                                                            loading…
                                                        </span>
                                                    )}
                                                    {coachErr && (
                                                        <span className="text-xs text-error">
                                                            {coachErr}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                team.headCoach?.name ?? "—"
                                            )}
                                        </td>

                                        {/* Derby Darling Name */}
                                        <td className="border px-2 py-1 text-center">
                                            {editing ? (
                                                <input
                                                    className="w-full max-w-[220px]"
                                                    placeholder="Derby Darling name"
                                                    value={
                                                        isEdited?.derbyDarlingName ??
                                                        team.derbyDarlingName ??
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            team.id,
                                                            "derbyDarlingName",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            ) : (
                                                team.derbyDarlingName ?? "—"
                                            )}
                                        </td>

                                        {/* Derby Darling Image */}
                                        <td className="border px-2 py-1">
                                            <CldUploadWidget
                                                signatureEndpoint="/api/sign-cloudinary-params"
                                                uploadPreset="darlingpic"
                                                options={{
                                                    sources: ["local"],
                                                    multiple: false,
                                                    publicId: "",
                                                    folder: `${process.env}/darling/${team.id}`,
                                                }}
                                                onSuccess={(results) => {
                                                    const info =
                                                        results.info as CloudinaryUploadWidgetInfo;
                                                    handleUploadDerby(
                                                        info,
                                                        team.id
                                                    );
                                                }}
                                            >
                                                {({ open }) => (
                                                    <div className="flex justify-center items-center">
                                                        {hasImage ? (
                                                            <button
                                                                type="button"
                                                                aria-label="Change Derby Darling photo"
                                                                className={`rounded-full overflow-hidden h-15 w-15 focus:outline-none focus:ring focus:ring-offset-1 ${
                                                                    uploadingTeamId ===
                                                                    team.id
                                                                        ? "opacity-50 pointer-events-none"
                                                                        : ""
                                                                }`}
                                                                onClick={() =>
                                                                    open()
                                                                }
                                                                disabled={
                                                                    uploadingTeamId ===
                                                                    team.id
                                                                }
                                                                title="Click to replace photo"
                                                            >
                                                                <CldImage
                                                                    src={
                                                                        currentImageUrl
                                                                    }
                                                                    alt="Derby Darling"
                                                                    width={40}
                                                                    height={40}
                                                                    className="h-15 w-15 rounded-full object-cover"
                                                                />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className={`btn btn-secondary btn-xs w-15 h-15 md:btn-sm transition-all duration-300 ${
                                                                    uploadingTeamId ===
                                                                    team.id
                                                                        ? "opacity-50 pointer-events-none"
                                                                        : ""
                                                                }`}
                                                                onClick={() =>
                                                                    open()
                                                                }
                                                                disabled={
                                                                    uploadingTeamId ===
                                                                    team.id
                                                                }
                                                            >
                                                                {uploadBtnLabel(
                                                                    team.id,
                                                                    false
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </CldUploadWidget>
                                        </td>

                                        {/* Delete */}
                                        {createOrDeleteAllowed && editing && (
                                            <td className="border px-2 py-1">
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                team.id
                                                            )
                                                        }
                                                        className="btn btn-error btn-circle"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
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
            )}
        </div>
    );
};

export default TeamsTable;

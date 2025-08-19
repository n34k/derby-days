"use client";
import React, { useEffect, useState } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { formatUSD } from "@/lib/formatUSD";

type Team = { id: string; name: string };
type Brother = { id: string; name: string; teamId: string };

type MetadataFormProps = {
    onSubmit: (metadata: {
        email: string;
        name: string;
        note: string;
        referredBy: string;
        teamId: string;
    }) => void;
    loading?: boolean;
    productName: string;
    productCost: number;
};

export const MetadataForm = ({
    onSubmit,
    loading,
    productName,
    productCost,
}: MetadataFormProps) => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [users, setUsers] = useState<Brother[]>([]);
    const [referrerType, setReferrerType] = useState<"brother" | "team" | "">(
        ""
    );
    const [referredBy, setReferredBy] = useState("");
    const [teamId, setTeamId] = useState("");

    useEffect(() => {
        fetch("/api/teams")
            .then((res) => res.json())
            .then(setTeams);
        fetch("/api/user")
            .then((res) => res.json())
            .then(setUsers);
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const email = (form.elements.namedItem("email") as HTMLInputElement)
            .value;
        const name = (form.elements.namedItem("name") as HTMLInputElement)
            .value;
        const note = (form.elements.namedItem("note") as HTMLInputElement)
            .value;

        if (referrerType === "") {
            alert("Please select a referrer (Brother or Team).");
            return;
        }

        let finalReferredBy = "";
        let finalTeamId = "";

        if (referrerType === "brother") {
            finalReferredBy = referredBy;
            const brother = users.find((u) => u.id === referredBy);
            if (brother && brother.teamId) {
                finalTeamId = brother.teamId;
            }
        } else if (referrerType === "team") {
            finalTeamId = teamId;
        }

        onSubmit({
            email,
            name,
            note,
            referredBy: finalReferredBy,
            teamId: finalTeamId,
        });
    };

    return (
        <form
            className="flex flex-col rounded-2xl border-2 border-secondary gap-4 items-center bg-primary overflow-y-scroll p-8 md:w-fit mt-10 mx-5"
            onSubmit={handleSubmit}
        >
            <h1 className="text-3xl font-bold text-primary-content">
                {loading ? "" : `${formatUSD(productCost)} ${productName}`}
            </h1>

            <div className="form-control w-full max-w-md">
                <label className="label">
                    <span className="label-text">Email</span>
                </label>
                <input
                    type="email"
                    name="email"
                    className="input input-bordered text-black bg-white rounded-sm w-full"
                    required
                />
            </div>

            <div className="form-control w-full max-w-md">
                <label className="label">
                    <span className="label-text">Name</span>
                </label>
                <input
                    type="text"
                    name="name"
                    className="input input-bordered text-black bg-white rounded-sm w-full"
                    required
                />
            </div>

            <div className="form-control w-full max-w-md">
                <label className="label">
                    <span className="label-text">Note (optional)</span>
                    <InformationCircleIcon
                        onClick={() =>
                            alert(
                                "This will be displayed on the donors page along with your name"
                            )
                        }
                        className="h-4 w-4 label-text hover:text-accent"
                    />
                </label>
                <textarea
                    name="note"
                    className="textarea textarea-bordered text-black bg-white rounded-sm w-full"
                />
            </div>

            <div className="form-control w-full max-w-md">
                <label className="label flex items-center gap-1">
                    <span className="label-text">Referred By</span>
                    <InformationCircleIcon
                        onClick={() =>
                            alert(
                                "Choose who brought you here. If you choose a team, this will add to their total. If you choose a brother, it will add to his total and his team's total"
                            )
                        }
                        className="h-4 w-4 label-text hover:text-accent"
                    />
                </label>
                <div className="flex flex-row gap-4">
                    <div className="flex-1">
                        <label className="label">
                            <span className="text-sm">Brother</span>
                        </label>
                        <select
                            className="select select-bordered bg-white text-black rounded-sm w-full"
                            value={referrerType === "brother" ? referredBy : ""}
                            onChange={(e) => {
                                setReferredBy(e.target.value);
                                setReferrerType("brother");
                                setTeamId("");
                            }}
                        >
                            <option value="" disabled hidden>
                                -
                            </option>
                            {users.map((bro) => (
                                <option key={bro.id} value={bro.id}>
                                    {bro.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1">
                        <label className="label">
                            <span className="text-sm">Team</span>
                        </label>
                        <select
                            className="select select-bordered bg-white text-black rounded-sm w-full"
                            value={referrerType === "team" ? teamId : ""}
                            onChange={(e) => {
                                setTeamId(e.target.value);
                                setReferrerType("team");
                                setReferredBy("");
                            }}
                        >
                            <option value="" disabled hidden>
                                -
                            </option>
                            {teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                className="btn btn-secondary w-full max-w-md"
                disabled={loading}
            >
                {loading ? (
                    <span className="loading loading-spinner" />
                ) : (
                    "Continue to Payment"
                )}
            </button>
        </form>
    );
};

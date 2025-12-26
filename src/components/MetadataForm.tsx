"use client";
import React, { useEffect, useMemo, useState } from "react";
import { formatUSD } from "@/lib/formatUSD";
import InfoCircle from "./modals/InfoCircle";

type Team = { id: string; name: string };
type Brother = { id: string; name: string; teamId: string };

type MetadataFormProps = {
    onSubmit: (metadata: {
        email: string;
        name: string;
        note: string;
        address?: string;
        referredBy: string; // brotherId if credited to brother, else ""
        teamId: string; // teamId if credited to team, or derived from brother.teamId
    }) => void;
    loading?: boolean;
    productName: string;
    productCost: number;
};

type ReferredByType = "TEAM" | "BROTHER";

export const MetadataForm = ({ onSubmit, loading, productName, productCost }: MetadataFormProps) => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [users, setUsers] = useState<Brother[]>([]);

    // AddDonationModal-style state
    const [referredByType, setReferredByType] = useState<ReferredByType>("TEAM");
    const [referredById, setReferredById] = useState<string>(""); // teamId or brotherId depending on type

    const donation = productName.includes("Donation");

    useEffect(() => {
        fetch("/api/teams")
            .then((res) => res.json())
            .then(setTeams);

        fetch("/api/user")
            .then((res) => res.json())
            .then(setUsers);
    }, []);

    // Optional (but matches AddDonationModal UX): stable sorted dropdowns
    const sortedTeams = useMemo(() => [...teams].sort((a, b) => a.name.localeCompare(b.name)), [teams]);
    const sortedUsers = useMemo(() => [...users].sort((a, b) => a.name.localeCompare(b.name)), [users]);

    const canSubmitReferrer = referredById !== "";

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;

        const email = (form.elements.namedItem("email") as HTMLInputElement).value;
        const name = (form.elements.namedItem("name") as HTMLInputElement).value;
        const address = (form.elements.namedItem("address") as HTMLInputElement).value;

        let note = "";
        if (donation) {
            note = (form.elements.namedItem("note") as HTMLInputElement).value;
        }

        if (!canSubmitReferrer) {
            alert("Please choose who gets donation credit (Team or Brother) and select one.");
            return;
        }

        let finalReferredBy = "";
        let finalTeamId = "";

        if (referredByType === "BROTHER") {
            finalReferredBy = referredById;

            const brother = users.find((u) => u.id === referredById);
            if (brother?.teamId) {
                finalTeamId = brother.teamId;
            }
        }

        if (referredByType === "TEAM") {
            finalTeamId = referredById;
        }

        onSubmit({
            email,
            name,
            address,
            note,
            referredBy: finalReferredBy,
            teamId: finalTeamId,
        });
    };

    return (
        <form
            className="flex flex-col rounded-2xl border-1 border-secondary gap-4 items-center bg-primary overflow-y-scroll p-8 md:w-fit mt-10 mx-5"
            onSubmit={handleSubmit}
        >
            <h1 className="text-3xl font-bold text-primary-content">
                {loading ? "" : `${formatUSD(productCost)} ${productName}`}
            </h1>

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
                    <span className="label-text">Email</span>
                </label>
                <input
                    type="email"
                    name="email"
                    className="input input-bordered text-black bg-white rounded-sm w-full"
                    required
                />
            </div>

            {!donation && (
                <div className="form-control w-full max-w-md">
                    <label className="label">
                        <span className="label-text">Address</span>
                        <InfoCircle>
                            All ad purchasers will be mailed a copy of the Derby Days book to this address.
                        </InfoCircle>
                    </label>
                    <input
                        type="text"
                        name="address"
                        className="input input-bordered text-black bg-white rounded-sm w-full"
                        required
                    />
                </div>
            )}

            {donation && (
                <div className="form-control w-full max-w-md">
                    <label className="label">
                        <span className="label-text">Note (optional)</span>
                        <InfoCircle>
                            Leave a message that will be seen with your donation on the donors page. Please do not leave
                            innapropiate or offensive notes as they will be removed
                        </InfoCircle>
                    </label>
                    <textarea
                        name="note"
                        className="textarea textarea-bordered text-black bg-white rounded-sm w-full"
                    />
                </div>
            )}

            <div className="form-control w-full max-w-md">
                <label className="label flex items-center gap-1">
                    <span className="label-text">Donation Credit</span>
                    <InfoCircle>
                        Choose who brought you here. If you are a member of a sorority or you were brought here by one,
                        choose the team option. If you are a brother of Sigma Chi or were brought here by one, choose
                        the brother option.
                    </InfoCircle>
                </label>

                {/* Type buttons */}
                <div className="grid grid-cols-2 gap-2 my-2">
                    <button
                        type="button"
                        className={`btn btn-primary ${referredByType === "TEAM" ? "btn-secondary" : ""}`}
                        onClick={() => {
                            setReferredByType("TEAM");
                            setReferredById("");
                        }}
                        disabled={loading}
                    >
                        Referred by Team
                    </button>

                    <button
                        type="button"
                        className={`btn btn-primary ${referredByType === "BROTHER" ? "btn-secondary" : ""}`}
                        onClick={() => {
                            setReferredByType("BROTHER");
                            setReferredById("");
                        }}
                        disabled={loading}
                    >
                        Referred by Brother
                    </button>
                </div>

                {/* Conditional dropdown */}
                {referredByType === "TEAM" && (
                    <select
                        className="select select-bordered bg-white text-black rounded-sm w-full mt-2"
                        value={referredById}
                        onChange={(e) => setReferredById(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">Select a team…</option>
                        {sortedTeams.map((t) => (
                            <option
                                key={t.id}
                                value={t.id}
                            >
                                {t.name}
                            </option>
                        ))}
                    </select>
                )}

                {referredByType === "BROTHER" && (
                    <select
                        className="select select-bordered bg-white text-black rounded-sm w-full mt-2"
                        value={referredById}
                        onChange={(e) => setReferredById(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">Select a brother…</option>
                        {sortedUsers.map((u) => (
                            <option
                                key={u.id}
                                value={u.id}
                            >
                                {u.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <button
                type="submit"
                className="btn btn-secondary w-full max-w-md"
                disabled={loading}
            >
                {loading ? <span className="loading loading-spinner" /> : "Continue to Payment"}
            </button>
        </form>
    );
};

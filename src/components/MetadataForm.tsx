"use client";
import React, { useEffect, useState } from "react";

type Team = { id: string; name: string };
type Brother = { id: string; name: string };

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

export const MetadataForm = ({ onSubmit, loading, productName, productCost }: MetadataFormProps) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<Brother[]>([]);
  const [referrerType, setReferrerType] = useState<"brother" | "team" | "">("");
  const [referredBy, setReferredBy] = useState("");
  const [teamId, setTeamId] = useState("");

  useEffect(() => {
    fetch("/api/teams").then(res => res.json()).then(setTeams);
    fetch("/api/user").then(res => res.json()).then(setUsers);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const note = (form.elements.namedItem("note") as HTMLInputElement).value;

    onSubmit({ email, name, note, referredBy: referrerType === "brother" ? referredBy : "", teamId: referrerType === "team" ? teamId : "" });
  };

  return (
    <form
      className="flex flex-col rounded-2xl border-2 border-secondary gap-4 items-center bg-primary overflow-y-scroll p-8 md:w-fit mt-10 mx-5"
      onSubmit={handleSubmit}
    >
      <h1 className="text-3xl font-bold text-primary-content">{loading ? '' : `$${productCost} ${productName}`}</h1>

      <div className="form-control w-full max-w-md">
        <label className="label"><span className="label-text">Email</span></label>
        <input type="email" name="email" className="input input-bordered text-black bg-white rounded-sm w-full" required />
      </div>

      <div className="form-control w-full max-w-md">
        <label className="label"><span className="label-text">Name (optional)</span></label>
        <input type="text" name="name" className="input input-bordered text-black bg-white rounded-sm w-full" />
      </div>

      <div className="form-control w-full max-w-md">
        <label className="label"><span className="label-text">Note (optional)</span></label>
        <textarea name="note" className="textarea textarea-bordered text-black bg-white rounded-sm w-full" />
      </div>

      <div className="form-control w-full max-w-md">
        <label className="label"><span className="label-text">Referral</span></label>
        <div className="flex gap-2">
          <select
            className="select select-bordered bg-white text-black rounded-sm w-1/2"
            value={referrerType === "brother" ? referredBy : ""}
            onChange={(e) => {
              setReferredBy(e.target.value);
              setReferrerType("brother");
              setTeamId("");
            }}
          >
            <option value="">Sigma Chi Brother</option>
            {users.map(bro => (
              <option key={bro.id} value={bro.id}>{bro.name}</option>
            ))}
          </select>

          <select
            className="select select-bordered bg-white text-black rounded-sm w-1/2"
            value={referrerType === "team" ? teamId : ""}
            onChange={(e) => {
              setTeamId(e.target.value);
              setReferrerType("team");
              setReferredBy("");
            }}
          >
            <option value="">Team (e.g., Sorority)</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
      </div>

      <button type="submit" className="btn btn-secondary w-full max-w-md" disabled={loading}>
        {loading ? <span className="loading loading-spinner" /> : "Continue to Payment"}
      </button>
    </form>
  );
};

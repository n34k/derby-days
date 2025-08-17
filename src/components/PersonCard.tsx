"use client";
import React from "react";
import { CldImage } from "next-cloudinary";

type PersonCardProps = {
  role: string;
  person: {
    name: string | null;
    image?: string | null | undefined;
  } | null;
};

const PersonCard = ({ role, person }: PersonCardProps) => {
  const hasPerson = !!person && (person.name || person.image);

  return (
    <div className="flex items-center justify-center flex-col gap-2.5 h-[60vh] md:w-[30vw] bg-primary rounded-lg border-2 border-secondary p-5">
      <h2 className="text-4xl font-semibold">{role}</h2>

      {hasPerson ? (
        <>
          {person?.image && (
            <CldImage
              src={person.image}
              alt={`${person.name ?? "Profile"} photo`}
              width={350}
              height={350}
              className="rounded-2xl"
            />
          )}
          <h2 className="text-4xl font-semibold">{person?.name}</h2>
        </>
      ) : (
        <p className="text-2xl opacity-70">Coming soon</p>
      )}
    </div>
  );
};

export default PersonCard;
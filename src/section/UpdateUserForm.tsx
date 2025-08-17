"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  CldUploadWidget,
  CldImage,
  CloudinaryUploadWidgetInfo,
} from "next-cloudinary";
import {
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

import TextInput from "../components/TextInput";

interface Props {
  initialName: string | null | undefined;
  initialImage: string | null | undefined;
  initialWalkoutSong: string;
  initialPublicId: string | undefined;
}

const UpdateUserForm = ({
  initialName,
  initialImage,
  initialWalkoutSong,
  initialPublicId,
}: Props) => {
  const [name, setName] = useState<string | null | undefined>(initialName);
  const [walkoutSong, setWalkoutSong] = useState<string>(initialWalkoutSong);
  const [imagePublicId, setPublicId] = useState(initialPublicId);
  const [image, setImage] = useState<string | null | undefined>(initialImage);

  const [savedName, setSavedName] = useState<string | null | undefined>(
    initialName
  );
  const [savedWalkoutSong, setSavedWalkoutSong] =
    useState<string>(initialWalkoutSong);

  const [editing, setEditing] = useState<boolean>(false);

  const toggleEditing = () => {
    setEditing(!editing);
  };

  const resetForm = () => {
    setName(savedName);
    setWalkoutSong(savedWalkoutSong);
  };

  const handleCancel = () => {
    setName(savedName);
    setWalkoutSong(savedWalkoutSong);
    resetForm();
    toggleEditing();
  };

  const submitUpdate = async (
    updatedName = name,
    updatedImage = image,
    updatedWalkoutSong = walkoutSong,
    updatedPublicId = imagePublicId
  ) => {
    //called after updating profile pic to save form to prevent orphans pics to cloud
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: updatedName,
          image: updatedImage,
          walkoutSong: updatedWalkoutSong,
          imagePublicId: updatedPublicId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSavedName(name);
        setSavedWalkoutSong(walkoutSong);
        toggleEditing();
      } else {
        console.error("Update failed", data.error, data.details);
      }
    } catch (err) {
      console.error("Request error", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    //for form
    e.preventDefault();
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          image,
          walkoutSong,
          imagePublicId,
        }),
      });

      const data = await res.json();
      console.log("DATA", data);

      if (res.ok) {
        setSavedName(data.name);
        setSavedWalkoutSong(data.walkoutSong);
        toggleEditing();
      } else {
        console.error("Update failed", data.error, data.details);
      }
    } catch (err) {
      console.error("Request error", err);
    }
  };

  return (
    <form
      className="h-[70vh] bg-primary rounded-lg border-2 border-secondary"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col items-center p-10">
        <div className="w-[225px] h-[225px] rounded-full overflow-hidden shadow-lg self-center">
          {imagePublicId ? (
            <CldImage
              className="object-cover"
              src={image ?? ""}
              alt="Profile Picture"
              width={225}
              height={225}
            />
          ) : (
            <Image
              className="object-cover"
              src={image ?? ""}
              alt="Profile Picture"
              width={225}
              height={225}
            />
          )}
        </div>
        <CldUploadWidget
          signatureEndpoint="/api/sign-cloudinary-params"
          uploadPreset="profilepic"
          options={{ sources: ["local"], multiple: false }}
          onSuccess={(results) => {
            const info = results.info as CloudinaryUploadWidgetInfo;
            setPublicId(info.public_id);
            setImage(info.secure_url);
            submitUpdate(name, info.secure_url, walkoutSong, info.public_id);
          }}
        >
          {({ open }) => (
            <button
              type="button"
              className={`btn btn-secondary w-1/2 mt-2.5 transition-all duration-300 
                ${
                  editing
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
              onClick={() => open()}
            >
              Edit Pic
              <ArrowUpTrayIcon className="h-4 w-4" />
            </button>
          )}
        </CldUploadWidget>
        <div className="flex flex-col gap-5">
          <TextInput
            title="Full Name"
            onChange={setName}
            readOnly={!editing}
            value={name ?? ""}
          />
          <TextInput
            title="Walkout Song"
            onChange={setWalkoutSong}
            readOnly={!editing}
            value={walkoutSong}
          />
          {editing ? (
            <div className="flex justify-evenly">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={handleCancel}
              >
                Cancel
                <XMarkIcon className="h-4 w-4" />
              </button>
              <button className="btn btn-secondary" type="submit">
                Submit
                <CheckIcon className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              className="btn btn-secondary w-1/2 self-center"
              onClick={toggleEditing}
            >
              Edit
              <PencilIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default UpdateUserForm;

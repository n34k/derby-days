"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import {
    UserGroupIcon,
    TrophyIcon,
    HeartIcon,
    ClipboardDocumentListIcon,
    UserIcon,
    Cog6ToothIcon,
    ArrowLeftEndOnRectangleIcon,
    ScaleIcon,
} from "@heroicons/react/24/solid";
import { DraftStatus, User } from "@/generated/prisma";

interface NavBarProps {
    userData: User | null;
    teamsMade: boolean;
    draftStatus: DraftStatus;
}

const NavBar = ({ userData, teamsMade, draftStatus }: NavBarProps) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const userRole = userData?.globalRole || "NONE";

    const canShowDraft =
        draftStatus === "NOT_STARTED" ||
        draftStatus === "COMPLETE" ||
        userRole === "ADMIN";

    console.log("STAUTS", draftStatus);

    return (
        <header className="sticky top-0 w-full z-50 bg-base border-b-1 border-info-content backdrop-blur-md shadow-lg">
            <div className="relative">
                <div className="flex justify-between items-center px-5 text-text">
                    {/* Logo */}
                    <Link href="/" onClick={() => setMenuOpen(false)}>
                        <Image
                            src="/images/logo.png"
                            alt="Derby Days"
                            width={70}
                            height={40}
                            priority
                            className="h-20 cursor-pointer transition duration-300 transform hover:scale-110"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex gap-20 items-center">
                        {teamsMade && (
                            <Link
                                href="/teams"
                                className="p-3 text-base-content font-semibold transition duration-300 transform hover:scale-110 hover:bg-secondary hover:bg-opacity-10 rounded-md"
                            >
                                Teams
                            </Link>
                        )}
                        {teamsMade && (
                            <Link
                                href="/standings"
                                className="p-3 text-base-content font-semibold transition duration-300 transform hover:scale-110 hover:bg-secondary hover:bg-opacity-10 rounded-md"
                            >
                                Standings
                            </Link>
                        )}
                        <Link
                            href="/donors"
                            className="p-3 text-base-content font-semibold transition duration-300 transform hover:scale-110 hover:bg-secondary hover:bg-opacity-10 rounded-md"
                        >
                            Donors
                        </Link>
                        {canShowDraft && (
                            <Link
                                href="/draft"
                                className="p-3 text-base-content font-semibold transition duration-300 transform hover:scale-110 hover:bg-secondary hover:bg-opacity-10 rounded-md"
                            >
                                Draft
                            </Link>
                        )}
                        <Link
                            href="/judges"
                            className="p-3 text-base-content font-semibold transition duration-300 transform hover:scale-110 hover:bg-secondary hover:bg-opacity-10 rounded-md"
                        >
                            Judges
                        </Link>
                        {userData ? (
                            <Link
                                href="/account"
                                className="p-3 text-base-content font-semibold transition duration-300 transform hover:scale-110 hover:bg-secondary hover:bg-opacity-10 rounded-md"
                            >
                                Account
                            </Link>
                        ) : (
                            <Link
                                href="/signin"
                                className="p-3 text-base-content font-semibold transition duration-300 transform hover:scale-110 hover:bg-secondary hover:bg-opacity-10 rounded-md"
                            >
                                Sign In
                            </Link>
                        )}
                        {userRole === "ADMIN" && (
                            <Link
                                href="/admin"
                                className="p-3 text-base-content font-semibold transition duration-300 transform hover:scale-110 hover:bg-secondary hover:bg-opacity-10 rounded-md"
                            >
                                Admin
                            </Link>
                        )}
                    </nav>

                    {/* Desktop Button */}
                    <Link href="/donate" className="">
                        <button className="btn btn-secondary btn-lg p-3 transition duration-300 hover:text-secondary hover:scale-110">
                            Support Us
                        </button>
                    </Link>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden z-50"
                        onClick={() => setMenuOpen((prev) => !prev)}
                    >
                        {menuOpen ? (
                            <XMarkIcon className="h-10 w-18 text-base-content" />
                        ) : (
                            <Bars3Icon className="h-10 w-18 text-base-content" />
                        )}
                    </button>
                </div>

                {/* Dropdown Menu */}
                <div
                    className={`flex justify-evenly items-center md:hidden w-full bg-base backdrop-blur-md border-t-1 shadow-lg overflow-hidden
            transition-[max-height] duration-50 ${
                menuOpen ? "max-h-[60vh] py-3" : "max-h-0"
            } `}
                >
                    {teamsMade && (
                        <Link
                            className="flex flex-col items-center"
                            href="/teams"
                            onClick={() => setMenuOpen(false)}
                        >
                            <UserGroupIcon className="h-8 w-8 text-base-content" />
                            <p className="text-base-content font-bold">Teams</p>
                        </Link>
                    )}
                    {teamsMade && (
                        <Link
                            className="flex flex-col items-center"
                            href="/standings"
                            onClick={() => setMenuOpen(false)}
                        >
                            <TrophyIcon className="h-8 w-8 text-base-content" />
                            <p className="text-base-content font-bold">
                                Standings
                            </p>
                        </Link>
                    )}
                    <Link
                        className="flex flex-col items-center"
                        href="/donors"
                        onClick={() => setMenuOpen(false)}
                    >
                        <HeartIcon className="h-8 w-8 text-base-content" />
                        <p className="text-base-content font-bold">Donors</p>
                    </Link>
                    {canShowDraft && (
                        <Link
                            className="flex flex-col items-center"
                            href="/draft"
                            onClick={() => setMenuOpen(false)}
                        >
                            <ClipboardDocumentListIcon className="h-8 w-8 text-base-content" />
                            <p className="text-base-content font-bold">Draft</p>
                        </Link>
                    )}
                    <Link
                        className="flex flex-col items-center"
                        href="/judges"
                        onClick={() => setMenuOpen(false)}
                    >
                        <ScaleIcon className="h-8 w-8 text-base-content" />
                        <p className="text-base-content font-bold">Judges</p>
                    </Link>
                    {userData ? (
                        <Link
                            className="flex flex-col items-center"
                            href="/account"
                            onClick={() => setMenuOpen(false)}
                        >
                            <UserIcon className="h-8 w-8 text-base-content" />
                            <p className="text-base-content font-bold">
                                Account
                            </p>
                        </Link>
                    ) : (
                        <Link href="/signin">
                            <button
                                type="submit"
                                className="flex flex-col items-center"
                                onClick={() => setMenuOpen(false)}
                            >
                                <ArrowLeftEndOnRectangleIcon className="h-8 w-8 text-base-content" />
                                <p className="text-base-content font-bold">
                                    Sign In
                                </p>
                            </button>
                        </Link>
                    )}
                    {userRole === "ADMIN" && (
                        <Link
                            className="flex flex-col items-center"
                            href="/admin"
                            onClick={() => setMenuOpen(false)}
                        >
                            <Cog6ToothIcon className="h-8 w-8 text-base-content" />
                            <p className="text-base-content font-bold">Admin</p>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default NavBar;

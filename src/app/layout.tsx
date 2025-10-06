import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/section/NavBar";
import { auth } from "../../auth";
import Footer from "@/components/section/Footer";
import { getUserSessionData } from "@/lib/getUserSessionData";
import "yet-another-react-lightbox/styles.css";
import { prisma } from "../../prisma";
import { DraftStatus } from "@/generated/prisma";
import getYear from "@/lib/getYear";
//
const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "600", "700"], // adjust as needed
    variable: "--font-poppins",
});

export const metadata: Metadata = {
    title: "Fresno State Derby Days",
    description: "Sigma Chi Epsilon Eta Derby Days landing page",
};

export default async function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const session = await auth();
    let userData = null;
    if (session) {
        userData = await getUserSessionData();
    }

    const teams = await prisma.team.findFirst();

    const draft = await prisma.draft.findUnique({
        where: { id: getYear() },
    });

    let draftStatus;

    if (draft) {
        draftStatus = draft.status;
    } else {
        draftStatus = DraftStatus.NOT_CREATED;
    }

    let teamsMade = false;

    if (teams) {
        teamsMade = true;
    }

    return (
        <html lang="en" data-theme="sigmachi">
            <body className={`min-h-screen flex flex-col ${poppins.variable}`}>
                <NavBar
                    userData={userData}
                    teamsMade={teamsMade}
                    draftStatus={draftStatus}
                />
                <main className="flex-1">{children}</main>
                <Footer />
            </body>
        </html>
    );
}

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/section/NavBar";
import { auth } from "../../auth";
import Footer from "@/components/section/Footer";
import { getUserSessionData } from "@/lib/getUserSessionData";
import { RealtimeProvider } from "@/components/providers/RealtimeProvider";
import "yet-another-react-lightbox/styles.css";

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
    return (
        <html lang="en" data-theme="sigmachi">
            <body className={`min-h-screen flex flex-col ${poppins.variable}`}>
                <NavBar userData={userData} />
                <main className="flex-1">
                    <RealtimeProvider>{children}</RealtimeProvider>
                </main>
                <Footer />
            </body>
        </html>
    );
}

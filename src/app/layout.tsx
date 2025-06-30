import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { auth } from "../../auth";

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'], // adjust as needed
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: "Derby Days",
  description: "Sigma Chi Epsilon Eta Derby Days landing page",
};

export default async function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  const session = await auth()
  return (
    <html lang="en" data-theme="sigmachi">
      <body className={poppins.variable}>
        <NavBar session={session} />
        <main>{children}</main>
      </body>
    </html>
  );
}

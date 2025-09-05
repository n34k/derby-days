import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [Google],
    callbacks: {
        async signIn({ user, profile }) {
            if (process.env.NODE_ENV === "development") {
                return true;
            }

            const email = user?.email ?? profile?.email;
            if (!email) return false;

            const existing = await prisma.user.findUnique({
                where: { email },
            });

            if (existing) return true;

            const allowed = await prisma.brotherEmails.findUnique({
                where: { email },
            });

            if (!allowed) {
                console.log(
                    "Email not on allowlist, blocked sign in for: ",
                    email
                );
                return false;
            }

            if (!allowed.accountMade) {
                await prisma.brotherEmails.update({
                    where: { email },
                    data: { accountMade: true },
                });
            }

            return true;
        },
    },
});

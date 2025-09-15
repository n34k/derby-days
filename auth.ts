// auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { GlobalRole } from "@/generated/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [Google],
    session: { strategy: "jwt" }, // ✅ use JWT so middleware can read without DB
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

            const draft = await prisma.draft.findUnique({
                where: { id: new Date().getFullYear().toString() },
                select: { status: true },
            });

            const canMakeAccount = !draft || draft.status === "NOT_CREATED";
            if (!canMakeAccount) {
                console.log(
                    "Draft already created, blocked sign in for: ",
                    email
                );
                return false;
            }

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

        async jwt({ token, user }) {
            // When user exists, this is a sign-in (or link) event.
            if (user) {
                // Ensure id is on token.sub (it should be already, but make explicit)
                if (user.id) token.sub = user.id;

                const roleFromDb = user.globalRole as GlobalRole | undefined;
                token.role = roleFromDb ?? token.role ?? "NONE";
            }

            // token.sub should be string by this point, keep it as-is
            return token;
        },

        async session({ session, token }) {
            if (!session?.user) return session;

            // token.sub is string by our augmentation; still guard at runtime
            session.user.id = typeof token.sub === "string" ? token.sub : "";

            // Put role on the session; default to "NONE" (or "USER")
            session.user.role =
                (token.role as GlobalRole | undefined) ?? "NONE";

            return session;
        },
    },
});

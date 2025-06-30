import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  callbacks: {
    async signIn({ account }) {
      // Grab invite token passed via OAuth 'state' param
      const inviteToken = account?.state;

      if (inviteToken !== "derby2025invite") {
        console.log("Blocked sign in — invalid or missing invite token");
        return false;  // Reject sign-in
      }

      return true;  // Allow sign-in
    },
  },
})
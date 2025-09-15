// types/next-auth.d.ts
import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";
import type { GlobalRole } from "@/generated/prisma"; // or define union: "ADMIN" | "USER" | "NONE"

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: GlobalRole | "NONE"; // match your app’s roles
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        globalRole?: GlobalRole | "NONE";
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        sub: string; // user id by convention
        role?: GlobalRole | "NONE";
    }
}

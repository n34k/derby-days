// middleware.ts (project root)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DraftStatus } from "./generated/prisma";

export async function middleware(req: NextRequest) {
    const { pathname, origin } = req.nextUrl;
    if (!pathname.startsWith("/draft")) return NextResponse.next();

    const year = new Date().getFullYear().toString();

    //Get global draft status
    const statusRes = await fetch(`${origin}/api/draft/${year}/status`, {
        cache: "no-store",
        headers: { "x-from-middleware": "1" },
    });

    if (!statusRes.ok) {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    const status = await statusRes.json();
    console.log("Draft status in middleware:", status);

    //If not ongoing, everyone can access /draft
    if (status !== DraftStatus.ONGOING) {
        return NextResponse.next();
    }

    //Draft is ongoing → check if current user is admin
    const roleRes = await fetch(`${origin}/api/user/role`, {
        cache: "no-store",
        //Forward cookies so the API can read the session
        headers: { cookie: req.headers.get("cookie") || "" },
    });

    if (!roleRes.ok) {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    const role = await roleRes.json();
    console.log("User role in middleware:", role);

    if (role === "ADMIN") {
        // Admins bypass redirect while ongoing
        return NextResponse.next();
    }

    // Non-admins → redirect while ongoing
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
}

export const config = { matcher: ["/draft/:path*"] };

import { auth } from "../../auth"; // adjust import path if needed
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getUserSessionData() {
    const session = await auth();
    if (!session) redirect("/");

    const cookie = await cookies();
    const cookieHeader = cookie.toString();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/user/${session.user?.id}`,
        { headers: { cookie: cookieHeader } }
    );

    if (!res.ok) {
        console.error("Failed to fetch user");
        return null;
    }

    const { user: userData } = await res.json();
    return userData;
}

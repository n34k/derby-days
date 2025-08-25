import { getUserSessionData } from "./getUserSessionData";

export async function isAdmin() {
    const sessionData = await getUserSessionData();
    if (sessionData?.globalRole === "ADMIN") {
        return true;
    }
    return false;
}

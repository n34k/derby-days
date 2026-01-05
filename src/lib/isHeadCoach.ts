import { getUserSessionData } from "./getUserSessionData";

export async function isHeadCoach() {
    const sessionData = await getUserSessionData();
    if (sessionData?.globalRole === "HEAD_COACH") {
        return true;
    }
    return false;
}

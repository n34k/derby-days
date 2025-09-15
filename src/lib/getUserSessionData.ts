// src/lib/getUserSessionData.ts
import { auth } from "../../auth";
import { prisma } from "../../prisma";

export async function getUserSessionData() {
    const session = await auth();
    if (!session) return null;
    const userId = session.user?.id;
    if (!userId) return null;

    return prisma.user.findUnique({ where: { id: userId } });
}

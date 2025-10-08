import { prisma } from "../../../../../../prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
    const { year } = await req.json();
    const teams = await prisma.team.findMany({ orderBy: { points: "desc" } });

    const finalStandings = [];
    for (const team of teams) {
        finalStandings.push(team.id);
    }

    await prisma.derbyStats.update({
        where: { id: year },
        data: { status: "COMPLETE", finalStandings },
    });

    revalidatePath("/admin");
    return Response.json({ success: true });
}

import CoachesCard from "@/components/CoachesCard";
import { prisma } from "../../../../prisma";
import PersonCard from "@/components/PersonCard";
import greekLetters from "@/lib/greekLetters";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const team = await prisma.team.findUnique({ where: { id: teamId } });

  if (!team) {
    return <div className="p-8 text-xl">Team not found</div>;
  }

  const derbyDarlingInfo =
    team.derbyDarlingName || team.derbyDarlingImageUrl
      ? {
          name: team.derbyDarlingName ?? null,
          image: team.derbyDarlingImageUrl ?? undefined,
        }
      : null;

  let headCoachInfo: { name: string | null; image?: string | null } | null =
    null;

  if (team.headCoachId) {
    const headCoach = await prisma.user.findUnique({
      where: { id: team.headCoachId },
    });
    if (headCoach) {
      headCoachInfo = {
        name: headCoach.name ?? null,
        image: headCoach.image ?? undefined,
      };
    }
  }

  const coaches = await prisma.user.findMany({
    where: { teamId: team.id, globalRole: "BROTHER" },
  });
  const coachesInfo = coaches.map((coach) => ({
    name: coach.name ?? null,
    image: coach.image ?? undefined,
  }));

  return (
    <main className="flex flex-col gap-5 items-center justify-center p-8">
      <h1 className="text-5xl font-bold">{greekLetters(team.id)}</h1>
      <div className="flex flex-col md:flex-row gap-7.5">
        <PersonCard role="Derby Darling" person={derbyDarlingInfo}></PersonCard>
        <CoachesCard coaches={coachesInfo} />
        <PersonCard role="Head Coach" person={headCoachInfo}></PersonCard>
      </div>
    </main>
  );
}

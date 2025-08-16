import { prisma } from "../../../../prisma";
import greekLetters from "@/lib/greekLetters";

export default async function TeamPage({ params }: {params: Promise<{ teamId: string }>}) {
  const { teamId } = await params; 
  const team = await prisma.team.findUnique({where: { id: teamId }});

  if (!team) {
    return <div className="p-8 text-xl">Team not found</div>;
  }

  return (
    <main className="flex min-h-[calc(100dvh-0px)] items-center justify-center p-8">
      <h1 className="text-5xl font-bold">{greekLetters(team.id)} — {team.name}</h1>
    </main>
  );
}

import type { Prisma, Team as PrismaTeam } from "@/generated/prisma";

export type CoachOption = { id: string; name: string };

export type TeamWithCoach = Prisma.TeamGetPayload<{
  include: { headCoach: { select: { id: true; name: true } } };
}>; 

export type EditedTeam = Partial<
  Pick<
    PrismaTeam,
    | "name"
    | "headCoachId"
    | "derbyDarlingName"
    | "derbyDarlingImageUrl"
    | "derbyDarlingPublicId"
    | "points"
    | "tshirtsSold"
    | "moneyRaised"
  >
>;
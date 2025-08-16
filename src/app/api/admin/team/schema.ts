import { z } from "zod";

export const AdminUpdateTeamSchema = z.object({
    name: z.string().optional(),
    tshirtsSold: z.number().optional(),
    moneyRaised: z.number().min(0).optional(),
    points: z.number().min(0).optional(),
    headCoachId: z.string().nullable().optional(),
    derbyDarlingName: z.string().nullable().optional(),
    derbyDarlingImageUrl: z.string().url().nullable().optional(),
    derbyDarlingPublicId: z.string().nullable().optional(),
    oldDerbyDarlingPublicId: z.string().nullable().optional()
})
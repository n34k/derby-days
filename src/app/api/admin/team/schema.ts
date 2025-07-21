import { z } from "zod";

export const AdminUpdateTeamSchema = z.object({
    name: z.string().optional(),
    tshirtsSold: z.number().optional(),
    moneyRaised: z.number().min(0).optional(),
    points: z.number().min(0).optional(),
    headCoachId: z.string().uuid().nullable().optional(),
    derbyDarlingId: z.string().uuid().nullable().optional(),
})
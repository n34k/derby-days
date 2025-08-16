import { z } from "zod";

export const AdminUpdateUserSchema = z.object({
  name: z.string().max(30).optional(),
  walkoutSong: z.string().max(50).optional(),
  moneyRaised: z.number().min(0).optional(),
  globalRole: z.enum(["ADMIN", "JUDGE", "HEAD_COACH", "BROTHER"]).optional(),
  teamId: z.string().uuid().optional()
});

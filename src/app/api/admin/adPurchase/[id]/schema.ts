import { z } from "zod";

export const AdUploadSchema = z.object({
    adId: z.string(),
    adUrl: z.string().url(),
    adPublicId: z.string(),
});

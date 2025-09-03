import { z } from "zod";

export const UpdateUserSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    image: z.string().url().optional(),
    walkoutSong: z.string().min(0).max(200).optional(),
    imagePublicId: z.string().nullable().optional(),
});

export const GetUserSchema = z.object({
    id: z.string().cuid(),
});

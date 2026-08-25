import { z } from "zod";

export const OutlineSchema = z.object({
  sections: z
    .array(
      z.object({
        heading: z.string(),
        keyPoints: z.array(z.string()).min(2).max(5),
      }),
    )
    .min(3)
    .max(5),
});

export const ReviewSchema = z.object({
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()).min(1),
});

export type Outline = z.infer<typeof OutlineSchema>;
export type Review = z.infer<typeof ReviewSchema>;
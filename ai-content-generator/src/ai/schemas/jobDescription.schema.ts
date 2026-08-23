import { z } from "zod";

export const JobDescriptionSchema = z.object({
  title: z.string(),
  summary: z.string(),
  responsibilities: z.array(z.string()).min(3).max(8),
  requirements: z.array(z.string()).min(3).max(8),
  niceToHave: z.array(z.string()).max(5),
});

export type JobDescription = z.infer<typeof JobDescriptionSchema>;

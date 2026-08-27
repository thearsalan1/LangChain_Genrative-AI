import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  GROQ_API_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  PORT: z.string().default("3000"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;

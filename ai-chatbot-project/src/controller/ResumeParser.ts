import { ChatGroq } from "@langchain/groq";
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { env } from "../config/env.js";
import { RunnableParallel } from "@langchain/core/runnables";

const resumeParseSchema = z.object({
  matchScore: z.string().min(0).max(100),
  matchSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  recommendations: z.array(z.string()),
});

const model = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0.3,
});

const structuredModel = model.withStructuredOutput(resumeParseSchema);

const resumeParseTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    "you are an expert at extracting matchScore, matchingSkills, missingSkills, and recommendations by comparing a resume against a job description.",
  ],
  ["human", "Resume:\n{resume}\n\nJob Description:\n{jobDescription}"],
]);

export async function getResumeParseData(
  resume: string,
  jobDescription: string,
) {
  const chain = resumeParseTemplate.pipe(structuredModel);
  const response = await chain.invoke({ resume, jobDescription });
  return response;
}

import {
  contentPrompt,
  improvePrompt,
  outlinePrompt,
  researchPrompt,
  reviewPrompt,
} from "./../prompts/careerBlog.prompt.js";
import { ChatGroq } from "@langchain/groq";
import { env } from "../../config/env.js";
import { OutlineSchema, ReviewSchema } from "../schemas/careerBlog.schema.js";

const creativeModel = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0.8,
});

const analyticalModel = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0.1,
});

const StructuredOutlineModel =
  analyticalModel.withStructuredOutput(OutlineSchema);
const StructuredReviwModel = analyticalModel.withStructuredOutput(ReviewSchema);

export const researchChain = researchPrompt.pipe(creativeModel);
export const outlineChain = outlinePrompt.pipe(StructuredOutlineModel);
export const contentChain = contentPrompt.pipe(creativeModel);
export const reviewChain = reviewPrompt.pipe(StructuredReviwModel);
export const improveChain = improvePrompt.pipe(creativeModel);

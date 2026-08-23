import { ChatGroq } from "@langchain/groq";
import { env } from "../../config/env.js";
import {
  extractionJDPrompt,
  streamingJDPrompt,
} from "../prompts/JobDiscription.propmt.js";
import { JobDescriptionSchema } from "../schemas/jobDescription.schema.js";

const streamingModel = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0.7,
});

const extractionModel = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0.1,
});

const structuredExtractedModel = extractionModel.withStructuredOutput(
  JobDescriptionSchema,
  {
    includeRaw: true,
  },
);

export const jdStreamingChain = streamingJDPrompt.pipe(streamingModel);

export const jdExtractionChain = extractionJDPrompt.pipe(
  structuredExtractedModel,
);

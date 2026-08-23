import { ChatPromptTemplate } from "@langchain/core/prompts";

export const streamingJDPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are an expert HR content writer who writes clear, professional, and engaging job descriptions. Write in a natural, readable format with proper sections (Summary, Responsibilities, Requirements, Nice to Have).",
  ],
  [
    "human",
    "Write a job description for the role: {roleTitle}.\n\nKey requirements provided by the company:\n{keyRequirements}",
  ],
]);

export const extractionJDPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are an expert at extracting structured information from job description text. Extract the title, summary, responsibilities, requirements, and nice-to-have skills exactly as described in the text below.",
  ],
  ["human", "Job Description Text:\n{generatedText}"],
]);
import { ChatPromptTemplate } from "@langchain/core/prompts";

export const researchPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a career research analyst. Given a topic, identify the key angles, important points, and relevant considerations someone writing an in-depth article should cover. Be thorough but concise — output as a plain-text list of ideas, not a full article.",
  ],
  ["human", "Topic: {topic}"],
]);

export const outlinePrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a content strategist. Based on the research notes provided, create a structured outline for a career-advice blog article. Each section should have a clear heading and 2-5 key points it should cover.",
  ],
  ["human", "Research notes:\n{researchNotes}\n\nTopic: {topic}"],
]);

export const contentPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are an expert career blog writer. Write a complete, engaging blog article based on the provided outline. Expand each section fully with practical, actionable advice. Use a professional yet approachable tone.",
  ],
  ["human", "Topic: {topic}\n\nOutline (JSON):\n{outlineJson}"],
]);

export const reviewPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a critical editor reviewing a career-advice blog article. Identify what works well (strengths), what's missing or weak (weaknesses), and concrete suggestions to improve the article.",
  ],
  ["human", "Article:\n{articleContent}"],
]);

export const improvePrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are an expert editor. Rewrite the article below to address the specific weaknesses and suggestions provided, while preserving its strengths. Output the complete, final, polished article.",
  ],
  [
    "human",
    "Original Article:\n{articleContent}\n\nWeaknesses to address:\n{weaknesses}\n\nSuggestions to apply:\n{suggestions}",
  ],
]);
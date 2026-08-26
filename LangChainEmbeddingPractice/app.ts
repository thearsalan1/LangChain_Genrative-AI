import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { env } from "./src/config/env";

const jobDescriptions = [
  "Junior Full stack developer have minimum experience of 1 year",
  "Want a fullstack developer good to have minimum 1 year of experience",
  "Backend developer Key skills include mern stack and java stack",
  "Fullstack developer with Generative ai skills",
  "Genrative ai Specialist and backend developer who can seemlessly work on ai applicaitons",
];

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: env.GEMINI_API,
  model: "gemini-embedding-001",
});

const vectors = await embeddings.embedDocuments(jobDescriptions);

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

const queryVector = await embeddings.embedQuery("software developer job");

const similarities = vectors.map((docVector, i) => ({
  text: jobDescriptions[i],
  score: cosineSimilarity(queryVector, docVector),
}));

similarities.sort((a, b) => b.score - a.score);

console.log("1 match: ", similarities[0]);
console.log("2 match: ", similarities[1]);

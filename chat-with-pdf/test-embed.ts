// test-embed.ts update karo
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { env } from "./src/config/env.js";

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: env.GEMINI_API,
  model: "gemini-embedding-001",
});

async function test() {
  console.log("Testing embedQuery...");
  const singleResult = await embeddings.embedQuery("Hello world");
  console.log("embedQuery length:", singleResult.length);

  console.log("Testing embedDocuments...");
  const batchResult = await embeddings.embedDocuments(["Hello world"]);
  console.log("embedDocuments result:", JSON.stringify(batchResult));
}

test().catch((err) => console.error("Error:", err));
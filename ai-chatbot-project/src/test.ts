// test.ts - temporary debug file
import Groq from "groq-sdk";
import { env } from "./config/env.js";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

async function test() {
  console.log("Sending request...");
  const response = await groq.chat.completions.create({
    messages: [{ role: "user", content: "Say hello in one word" }],
    model: "openai/gpt-oss-120b", // pehle isi model se try karo, jo stable hai
    stream: false, // ← streaming OFF, pehle basic call check karo
  });
  console.log("Response:", response.choices[0].message.content);
}

test().catch(console.error);
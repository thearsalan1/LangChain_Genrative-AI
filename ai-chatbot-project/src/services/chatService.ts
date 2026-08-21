import Groq from "groq-sdk";
import { env } from "../config/env.js";
import { type ChatMessage } from "./../types/types.js";

const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
});

const SYSTEM_PROMPT =
  "You are a great teacher. helps student to learn new concepts";

export async function* streamChatRespones(
  history: ChatMessage[],
  userMessage: string,
) {
  const message: ChatMessage[] = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    ...history,
    {
      role: "user",
      content: userMessage,
    },
  ];
  const stream = await groq.chat.completions.create({
    messages: message,
    model: "openai/gpt-oss-20b",
    temperature: 0.7,
    stream: true,
  });
  let fullResponse = "";

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    if (content) {
      fullResponse += content;
      yield content;
    }
  }
  return fullResponse;
}

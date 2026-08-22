import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import { env } from "../config/env.js";

const model = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0.7,
  maxTokens: 300,
});

const SYSTEM_PROMPT =
  "You are a great teacher. Helps studemts learn new concept";

export async function* streamChatResponse(
  history: BaseMessage[],
  userMessage: HumanMessage,
) {
  const messages: BaseMessage[] = [
    new SystemMessage(SYSTEM_PROMPT),
    ...history,
    new HumanMessage(userMessage),
  ];
  const stream = await model.stream(messages);

  let fullRespone = "";
  for await (const chunk of stream) {
    const content = chunk.content as string;
    if (content) {
      fullRespone += content;
      yield content;
    }
  }
  return fullRespone;
}

import "dotenv/config";
import express from "express";
import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const app = express();
app.use(express.json());

const model = new ChatOpenAI({
  apiKey: process.env.GROQ_API_KEY,
  configuration: { baseURL: "https://api.groq.com/openai/v1" },
  model: "openai/gpt-oss-20b",
  temperature: 0.7,
});

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant"],
  new MessagesPlaceholder("history"),
  ["user", "{input}"],
]);

const chain = prompt.pipe(model).pipe(new StringOutputParser());

const conversationHistory = {};

app.post("/chat", async (req, res) => {
  const { userId, userMessage } = req.body;

  if (!userId || !userMessage) {
    return res
      .status(400)
      .json({ error: "userId and userMessage are required" });
  }

  if (!conversationHistory[userId]) {
    conversationHistory[userId] = [];
  }
  try {
    const reply = await chain.invoke({
      history: conversationHistory[userId],
      input: userMessage,
    });
    conversationHistory[userId].push({ role: "user", content: userMessage });
    conversationHistory[userId].push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(3000, () => console.log("Server running"));

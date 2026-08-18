import "dotenv/config";
import express, { type Request, type Response } from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());

const openAPI = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const conversations: Record<string, ChatMessage[]> = {};

app.post("/chat", async (req: Request, res: Response) => {
  const { userId, userMessage } = req.body as {
    userId?: string;
    userMessage?: string;
  };

  if (!userMessage || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "userId and userMessage are required" });
  }

  if (!conversations[userId]) {
    conversations[userId] = [
      { role: "system", content: "You are a helpful assistant" },
    ];
  }
  conversations[userId].push({ role: "user", content: userMessage });

  try {
    const response = await openAPI.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: conversations[userId],
      temperature: 0.7,
      max_tokens: 300,
    });

    const aiReply =
      response.choices[0]?.message.content ??
      "Sorry, I couldn't generate a response.";
    conversations[userId].push({ role: "assistant", content: aiReply });

    res.json({ reply: aiReply });
  } catch (error: any) {
    if (error.status === 429) {
      return res
        .status(429)
        .json({ error: "Rate limit exceeded, please try again shortly" });
    }
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

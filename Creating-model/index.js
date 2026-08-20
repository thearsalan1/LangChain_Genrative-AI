import "dotenv/config";
import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API,
});

app.post("/chat", async (req, res) => {
  const { input } = req.body;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: input,
      config: {
        systemInstruction:
          "Your name is Jarvis and my personal llm.",
      },
    });
    res.status(200).json({
      success: true,
      message: response.text.toString(),
    });
  } catch (error) {
    console.error("Gemini Error:", error);

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message: "Limit exhausted.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong with Gemini.",
    });
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "server running" });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:3000`);
});

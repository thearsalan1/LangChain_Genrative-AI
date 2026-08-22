import type { Request, Response } from "express";
import { type ChatMessage } from "../types/types.js";
import { streamChatRespones } from "../services/chatService.js";

const sessionHistories = new Map<string, ChatMessage[]>();

export const getSessionHistory = (sessionId: string): ChatMessage[] => {
  if (!sessionHistories.has(sessionId)) {
    sessionHistories.set(sessionId, []);
  }
  return sessionHistories.get(sessionId)!;
};

export const chatStream = async (req: Request, res: Response) => {
  const { message, sessionId } = req.body;
  if (!message || typeof message !== "string") {
    return res
      .status(400)
      .json({ error: "Message is required and must be a string" });
  }
  const history = getSessionHistory(sessionId);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  try {
    let assistantResponse = "";
    for await (const chunk of streamChatRespones(history, message)) {
      assistantResponse += chunk;
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    }

    history.push({ role: "user", content: message });
    history.push({ role: "assistant", content: assistantResponse });
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Streaming error:", error);
    res.write(`data: ${JSON.stringify({ error: "Something went wrong" })}\n\n`);
    res.end();
  }
};

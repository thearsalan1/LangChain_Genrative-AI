import {
  AIMessage,
  HumanMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import type { Request, Response } from "express";
import { streamChatResponse } from "../services/chatServiceLangChain.js";

const allSessionHistories = new Map<string, BaseMessage[]>();

export const getSessionHistory = (sessionId: string): BaseMessage[] => {
  if (!allSessionHistories.has(sessionId)) {
    allSessionHistories.set(sessionId, []);
  }
  return allSessionHistories.get(sessionId)!;
};

export const createStreams = async (req: Request, res: Response) => {
  const { sessionId, message } = req.body;
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
    for await (const chunk of streamChatResponse(
      history,
      new HumanMessage(message),
    )) {
      assistantResponse += chunk;
      res.write(`data:${JSON.stringify({ text: chunk })}\n\n`);
    }
    history.push(new HumanMessage(message));
    history.push(new AIMessage(assistantResponse));
  } catch (error) {}
};

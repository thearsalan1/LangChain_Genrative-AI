import { type Request, type Response } from "express";
import { generateJobDescriptionStream } from "../services/jobDescriptionService.js";
import { logger } from "../utils/logger.js";

export const jobDescription = async (req: Request, res: Response) => {
  const { roleTitle, keyRequirements } = req.body;

  if (!roleTitle || roleTitle.trim() === "") {
    return res.status(400).json({ success: false, message: "roleTitle required" });
  }
  if (!keyRequirements || keyRequirements.trim() === "") {
    return res.status(400).json({ success: false, message: "key requirements required" });
  }

  logger.info("Job description generation started", { roleTitle });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    for await (const event of generateJobDescriptionStream(roleTitle, keyRequirements)) {
      if (event.type === "chunk") {
        res.write(`data: ${JSON.stringify({ type: "chunk", content: event.content })}\n\n`);
      } else if (event.type === "final") {
        res.write(`data: ${JSON.stringify({ type: "final", data: event.data })}\n\n`);
        logger.info("Job description generation completed", { roleTitle });
      }
    }
    res.end();
  } catch (error) {
    logger.error("Job description generation failed", { roleTitle, error: String(error) });
    res.write(`data: ${JSON.stringify({ type: "error", message: "Something went wrong" })}\n\n`);
    res.end();
  }
};
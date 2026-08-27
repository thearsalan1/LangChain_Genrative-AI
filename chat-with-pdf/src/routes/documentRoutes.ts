import { Router, type Request, type Response } from "express";
import { upload } from "../config/multer.js";
import { processDocument } from "../services/documentServices.js";
import { logger } from "../utils/logger.js";
import fs from "fs/promises";

const router = Router();

router.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
  const { userId } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ success: false, message: "PDF file is required" });
  }

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ success: false, message: "userId is required" });
  }

  try {
    const document = await processDocument(file.path, file.originalname, userId);

    await fs.unlink(file.path);

    return res.status(201).json({
      success: true,
      message: "Document processed successfully",
      documentId: document.id,
    });
  } catch (error) {
    logger.error("Document upload failed", { error: String(error) });
    return res.status(500).json({ success: false, message: "Document processing failed" });
  }
});

export default router;
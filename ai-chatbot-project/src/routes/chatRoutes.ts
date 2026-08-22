import { Router } from "express";
import { chatStream } from "../controller/controller.js";
import { createStreams } from "../controller/controllerLangchain.js";

const router = Router();

router.post("/chat-stream", chatStream);
router.post("/chat-lang", createStreams);

export default router;

import { Router } from "express";
import { chatStream } from "../controller/controller.js";

const router = Router();

router.post("/chat-stream", chatStream);

export default router;

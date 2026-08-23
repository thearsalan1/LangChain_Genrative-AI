import { Router } from "express";
import { jobDescription } from "../controllers/controllers.js";

const router = Router();

router.post("/job-description", jobDescription);

export default router;

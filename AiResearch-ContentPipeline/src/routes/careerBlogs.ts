import { Router, type Request, type Response } from "express";
import { genrateCareerBlog } from "../services/careerBlogSerice.js";
import { logger } from "../utils/logger.js";

const router = Router();

router.post("/career-blog", async (req: Request, res: Response) => {
  const { topic } = req.body;
  if (typeof topic !== "string" || topic.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "Topic required and must be a string" });
  }
  try {
    const data = await genrateCareerBlog(topic);
    logger.info("Career blog generation successful", {
      topic,
      articleLength: data.finalArticle.length,
      sectionsCount: data.outline.sections.length,
    });
    return res.status(201).json({
      success: true,
      message: "Blog creation successful",
      finalArticle: data.finalArticle,
      outline: data.outline,
      review: data.review,
    });
  } catch (error: any) {
    logger.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

export default router;

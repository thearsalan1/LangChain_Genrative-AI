import {
  contentChain,
  improveChain,
  outlineChain,
  researchChain,
  reviewChain,
} from "../ai/chains/careerBlog.chains.js";
import { logger } from "../utils/logger.js";

export async function genrateCareerBlog(topic: string) {
  try {
    logger.info("Career blog generation started", { topic });
    const researchResult = await researchChain.invoke({ topic });
    const researchNotes = researchResult.content as string;
    logger.info("Research complete", { topic });
    const outline = await outlineChain.invoke({ researchNotes, topic });
    logger.info("Outline complete", {
      topic,
      sectionsCount: outline.sections.length,
    });
    const contentResult = await contentChain.invoke({
      topic,
      outlineJson: JSON.stringify(outline),
    });
    const articleContent = contentResult.content as string;
    logger.info("Content generation complete", { topic });
    const review = await reviewChain.invoke({ articleContent });
    logger.info("Review complete", {
      topic,
      weaknessesCount: review.weaknesses.length,
    });
    const weaknessesText = review.weaknesses
      .map((w, i) => `${i + 1}. ${w}`)
      .join("\n");
    const suggestionsText = review.suggestions
      .map((s, i) => `${i + 1}. ${s}`)
      .join("\n");
    const improvedResult = await improveChain.invoke({
      articleContent,
      weaknesses: weaknessesText,
      suggestions: suggestionsText,
    });
    const finalArticle = improvedResult.content as string;

    logger.info("Career blog generation completed", { topic });

    return {
      outline,
      review,
      finalArticle,
    };
  } catch (error) {
    logger.error("Career blog generation failed", {
      topic,
      error: String(error),
    });
    throw new Error("Career blog generation failed. Please try again.");
  }
}

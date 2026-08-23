import { type JobDescription } from "./../ai/schemas/jobDescription.schema.js";
import {
  jdExtractionChain,
  jdStreamingChain,
} from "../ai/chains/jobDescription.chain.js";
import type { AIMessage } from "@langchain/core/messages";

export async function* generateJobDescriptionStream(
  roleTitle: string,
  keyRequirements: string,
) {
  const stream = await jdStreamingChain.stream({ roleTitle, keyRequirements });
  let fullText = "";
  for await (const chunk of stream) {
    const content = chunk.content as string;
    if (content) {
      fullText += content;
      yield { type: "chunk" as const, content };
    }
  }

  const extractionResponse = await jdExtractionChain.invoke({
    generatedText: fullText,
  });
  yield {
    type: "final" as const,
    data: extractionResponse.parsed,
    usage: (extractionResponse.raw as AIMessage).usage_metadata,
  };
}

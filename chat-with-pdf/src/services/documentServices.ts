import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { prisma } from "../config/db.js";

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: env.GEMINI_API,
  model: "text-embedding-001",
});

const splitter = new RecursiveCharacterTextSplitter({
  chunkOverlap: 200,
  chunkSize: 1000,
});
export async function processDocument(
  filePath: string,
  fileName: string,
  userId: string,
) {
  logger.info("Document processing started", { fileName, userId });

  const loader = new PDFLoader(filePath);
  const docs = await loader.load();

  const chunks = await splitter.splitDocuments(docs);
  logger.info("Document chunked", { fileName, chunkCount: chunks.length });

  const document = await prisma.document.create({
    data: { userId, fileName },
  });

  const chunkTexts = chunks.map((chunk) => chunk.pageContent);
  const vectors = await embeddings.embedDocuments(chunkTexts);
  console.log("Vectors count:", vectors.length);
  console.log("First vector length:", vectors[0]?.length);
  console.log("First vector sample:", vectors[0]?.slice(0, 5));
  for (let i = 0; i < chunks.length; i++) {
    await prisma.$executeRaw`
    INSERT INTO "Chunk" (id, "documentId", content, "pageNumber", embedding)
    VALUES (gen_random_uuid(), ${document.id}, ${chunks[i]!.pageContent}, ${chunks[i]!.metadata.loc?.pageNumber ?? null}, ${vectors[i]}::vector)
  `;
  }
  logger.info("Document processing completed", {
    fileName,
    documentId: document.id,
  });
  return document;
}

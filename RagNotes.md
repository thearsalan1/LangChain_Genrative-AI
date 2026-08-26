# Phase 5 --- RAG (Retrieval-Augmented Generation)

> **Goal:** Understand how to build grounded AI applications that answer
> questions using private or domain-specific data.

## Navigation

-   [Phase 5 Overview](#phase-5-overview)
-   [Lesson 5.1 --- RAG Fundamentals & Document
    Loading](#lesson-51--rag-fundamentals--document-loading)
-   [Lesson 5.2 --- Chunking](#lesson-52--chunking)
-   [Lesson 5.3 --- Retrieval
    Strategies](#lesson-53--retrieval-strategies)
-   [Lesson 5.4 --- Generation](#lesson-54--generation)
-   [Complete RAG Pipeline](#complete-rag-pipeline)
-   [Production RAG Checklist](#production-rag-checklist)
-   [Exercises](#exercises)
-   [Test Your Understanding](#test-your-understanding)
-   [Key Takeaways](#key-takeaways)

------------------------------------------------------------------------

# Phase 5 Overview

RAG stands for **Retrieval-Augmented Generation**.

It connects an LLM with information that is not reliably available in
the model's training knowledge, such as private company documents,
resumes, product documentation, policies, knowledge bases, PDFs, DOCX
files, and database content.

The core idea is:

``` text
Retrieve relevant information
        ↓
Augment the model input with that information
        ↓
Generate an answer using the retrieved context
```

RAG does not require retraining the LLM. Instead, relevant external
information is supplied at query time.

# Lesson 5.1 --- RAG Fundamentals & Document Loading

## 1. What Is RAG?

Suppose a user asks:

> What is the refund policy in our company's Terms of Service?

A general-purpose LLM may know common refund-policy patterns, but it
does not automatically know your private document.

RAG solves this by retrieving the relevant section from your data and
providing it to the LLM.

### The Three Words

**Retrieval** --- Find relevant information from your data.

**Augmented** --- Add that information to the model's input as context.

**Generation** --- Ask the LLM to generate the final response using that
context.

### Open-Book Analogy

Without RAG:

``` text
Question
   ↓
LLM's existing knowledge
   ↓
Answer
```

With RAG:

``` text
Question
   ↓
Search documents
   ↓
Retrieve relevant passages
   ↓
Give passages to the LLM
   ↓
Answer from provided context
```

------------------------------------------------------------------------

## 2. Core RAG Pipeline

RAG has two major stages.

### Indexing / Preparation Time

``` text
Document
   ↓
Load
   ↓
Raw text / Documents
   ↓
Chunk
   ↓
Embeddings
   ↓
Vector storage
```

### Query Time

``` text
User Query
   ↓
Query embedding
   ↓
Similarity search
   ↓
Relevant chunks
   ↓
Context construction
   ↓
LLM
   ↓
Grounded answer
```

### Important Distinction

Loading, chunking, embedding, and storing are generally **indexing-time
operations**.

Retrieval is a **query-time operation**.

------------------------------------------------------------------------

## 3. Document Loading

Different file formats require different parsing logic.

### PDF

``` typescript
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

const loader = new PDFLoader("resume.pdf");

const docs = await loader.load();

console.log(docs[0].pageContent);
console.log(docs[0].metadata);
```

### Common Sources

  Source     Typical Loader / Approach
  ---------- --------------------------------------------
  PDF        `PDFLoader`
  DOCX       `DocxLoader`
  TXT        `TextLoader`
  Markdown   `TextLoader` or structure-aware processing
  CSV        `CSVLoader`
  Web page   `CheerioWebBaseLoader`
  Database   Direct database query or custom loader

LangChain loaders generally normalize external content into `Document`
objects.

------------------------------------------------------------------------

## 4. The Document Object

A document generally contains:

``` typescript
{
  pageContent: "Experience: 3 years of React development...",
  metadata: {
    source: "resume.pdf",
    page: 1
  }
}
```

`pageContent` contains the text.

`metadata` contains source information and application-specific
information.

------------------------------------------------------------------------

## 5. Metadata

Metadata is critical for:

-   Filtering
-   Authorization boundaries
-   Source attribution
-   Citations
-   Document versioning
-   Debugging
-   Multi-tenant isolation

Example:

``` typescript
{
  pageContent: "Experience: 3 years of React development...",
  metadata: {
    source: "resume_arsalan.pdf",
    page: 1,
    userId: "user_123"
  }
}
```

### Security Example

If HireHub stores 1,000 users' resumes, retrieval must be restricted to
documents the current user is authorized to access.

``` text
User query
   ↓
Ownership / tenant filter
   ↓
Similarity search
   ↓
Relevant chunks
```

Without this boundary, one user's query could retrieve another user's
private data.

------------------------------------------------------------------------

## 6. Multiple Document Types

A production application may select a loader according to the uploaded
file type:

``` typescript
function getLoader(filePath: string, fileType: string) {
  switch (fileType) {
    case "pdf":
      return new PDFLoader(filePath);

    case "docx":
      return new DocxLoader(filePath);

    case "txt":
      return new TextLoader(filePath);

    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}
```

The architecture is:

``` text
Different source formats
        ↓
Different loading logic
        ↓
Common Document representation
        ↓
Same downstream pipeline
```

------------------------------------------------------------------------

## 7. Database Text Does Not Need a File Loader

If content is already stored as text in a database, parse it directly
instead of pretending it is a file.

``` typescript
const result = await db.query(
  "SELECT description FROM job_descriptions WHERE id = $1",
  [jobId]
);

const text = result.rows[0].description;
```

When a LangChain `Document` is useful:

``` typescript
import { Document } from "@langchain/core/documents";

const document = new Document({
  pageContent: text,
  metadata: {
    source: "job_descriptions",
    jobId
  }
});
```

Database retrieval is conceptually a form of data loading, but it does
not require file parsing.

------------------------------------------------------------------------

## 8. Real Application Usage

For HireHub:

``` text
User uploads resume.pdf
        ↓
PDFLoader
        ↓
Extracted Document
        ↓
Chunking
        ↓
Embeddings
        ↓
Vector database
```

Later:

``` text
User asks a question
        ↓
Retrieve relevant chunks
        ↓
LLM
        ↓
Answer
```

------------------------------------------------------------------------

## 9. Common Mistakes

### Ignoring metadata

Without source and ownership information, filtering and attribution
become difficult.

### Using the wrong loader

A PDF loader should not be expected to parse every document format.

### Treating loading as a one-time operation

Updated documents can make existing indexed data stale.

``` text
New document version
        ↓
Re-process
        ↓
Re-chunk
        ↓
Re-embed
        ↓
Update vector storage
```

### Trusting uploads blindly

Production applications should validate:

-   File type
-   File size
-   Parseability
-   Security/malware considerations

------------------------------------------------------------------------

## 10. Production Considerations

-   Large files may require background processing.
-   Corrupted files should fail gracefully.
-   Uploaded files should be validated.
-   Document ownership should be enforced.
-   Document versions should be tracked.

# Lesson 5.2 --- Chunking

## 1. Why Chunking Is Needed

Suppose a company policy is 50 pages long and the user asks:

> What is the sick leave policy?

Sending all 50 pages to the LLM is inefficient.

Problems include:

-   Context-window pressure
-   Higher token usage
-   Higher cost
-   Irrelevant information
-   Lower focus
-   Poorer retrieval precision

Chunking divides the document into smaller pieces.

``` text
50-page document
       ↓
Chunking
       ↓
Chunk 1
Chunk 2
Chunk 3
...
Chunk N
```

Each chunk can then be embedded and retrieved independently.

------------------------------------------------------------------------

## 2. Chunk Size

A common approach is:

``` typescript
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200
});

const chunks = await splitter.splitDocuments(docs);
```

### Trade-Off

Very small chunks:

``` text
+ Precise
- Fragmented context
- More chunks
- More indexing overhead
```

Very large chunks:

``` text
+ More context
- More irrelevant information
- Higher token cost
- Less precise retrieval
```

There is no universal perfect chunk size. It depends on the document
type, query patterns, embedding model, context budget, and retrieval
strategy.

------------------------------------------------------------------------

## 3. Chunk Overlap

Overlap reduces information loss at chunk boundaries.

Without overlap:

``` text
Chunk 1:
"Employees are eligible for sick leave after completing"

Chunk 2:
"3 months of employment."
```

With overlap:

``` text
Chunk 1:
"Employees are eligible for sick leave after completing 3 months of employment."

Chunk 2:
"after completing 3 months of employment. This applies to..."
```

### Core Purpose

> Chunk overlap reduces boundary-related information loss.

It is **not** used to discover the order of chunks. Their order is
already known through their storage/indexing metadata.

------------------------------------------------------------------------

## 4. Recursive Splitting

`RecursiveCharacterTextSplitter` tries to preserve natural boundaries.

Conceptually:

``` text
Paragraph
   ↓
Sentence
   ↓
Word
   ↓
Character
```

If a piece remains too large, it moves toward smaller separators.

This is why it is called recursive.

------------------------------------------------------------------------

## 5. Token Splitting

``` typescript
import { TokenTextSplitter } from "langchain/text_splitter";

const splitter = new TokenTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50
});
```

The key difference is the unit being measured:

``` text
RecursiveCharacterTextSplitter
        ↓
Characters

TokenTextSplitter
        ↓
Tokens
```

Use token-based splitting when precise token budgeting is important.

------------------------------------------------------------------------

## 6. Markdown / Structure-Aware Splitting

Structured documents contain useful boundaries.

For example:

``` markdown
# Company Policy

## Sick Leave

...

## Vacation

...
```

A structure-aware strategy attempts to preserve logical sections where
practical.

The principle is:

> Preserve meaningful document structure when it improves retrieval
> quality.

------------------------------------------------------------------------

## 7. Semantic Chunking

Semantic chunking is an advanced technique.

Instead of splitting after a fixed number of characters, it attempts to
detect changes in meaning.

Conceptually:

``` text
Sentence embeddings
        ↓
Compare semantic similarity
        ↓
Large semantic change
        ↓
New chunk boundary
```

This can create more meaningful chunks, but it also adds complexity and
computation.

------------------------------------------------------------------------

## 8. Why Bad Chunking Produces Bad Answers

Suppose the document says:

``` text
Damaged products receive a full refund within 30 days.
Used products receive a 50% refund.
```

Poor chunking may separate related conditions in a way that removes
important context from retrieval.

Therefore:

``` text
Bad chunking
    ↓
Poor retrieval
    ↓
Incomplete context
    ↓
Poor answer
```

Chunking is not just preprocessing. It directly influences RAG quality.

------------------------------------------------------------------------

## 9. Resume Example

For resumes, arbitrary character boundaries can split a work-experience
entry.

Prefer chunks that preserve meaningful units where practical:

``` text
Work Experience
   ├── Company A
   ├── Company B
   └── Company C
```

The goal is to keep semantically related information together.

------------------------------------------------------------------------

## 10. Common Mistakes

-   Zero overlap without considering boundary loss
-   Extremely small chunks
-   Extremely large chunks
-   Ignoring document structure
-   Choosing chunk size without evaluating retrieval quality

------------------------------------------------------------------------

## 11. Production Considerations

### Evaluate Chunk Size

Test different values against real queries.

### Balance Quality and Cost

``` text
Smaller chunks
    ↓
More precise but potentially fragmented

Larger chunks
    ↓
More context but potentially noisy
```

### Re-Chunk Updated Documents

When content changes significantly, its chunks and embeddings may need
to be regenerated.

# Lesson 5.3 --- Retrieval Strategies

Retrieval finds the information most useful for the current query.

------------------------------------------------------------------------

## 1. Similarity Search and Top-K

Basic vector retrieval:

``` text
User query
   ↓
Query embedding
   ↓
Vector similarity search
   ↓
Top-K chunks
```

Conceptually:

``` sql
SELECT *,
       1 - (embedding <=> $1) AS score
FROM chunks
ORDER BY embedding <=> $1
LIMIT 5;
```

Here `K = 5`.

Too small:

``` text
K = 1
```

may miss useful context.

Too large:

``` text
K = 50
```

may add irrelevant context and increase cost.

------------------------------------------------------------------------

## 2. Metadata Filtering

For a multi-user system:

``` sql
SELECT *,
       1 - (embedding <=> $1) AS score
FROM chunks
WHERE user_id = $2
ORDER BY embedding <=> $1
LIMIT 5;
```

The retrieval boundary becomes:

``` text
User
 ↓
Authorization / ownership filter
 ↓
Similarity search
 ↓
Relevant chunks
```

This should be treated as a security boundary, not merely an
optimization.

------------------------------------------------------------------------

## 3. MMR --- Maximal Marginal Relevance

### Problem

Top results can contain nearly identical information.

``` text
Chunk 1 → same topic
Chunk 2 → same topic
Chunk 3 → same topic
Chunk 4 → same topic
Chunk 5 → same topic
```

MMR balances:

``` text
Relevance to query
        +
Diversity from already-selected chunks
```

Conceptually:

``` typescript
const retriever = vectorStore.asRetriever({
  searchType: "mmr",
  searchKwargs: {
    fetchK: 20,
    k: 5,
    lambda: 0.5
  }
});
```

A higher `lambda` emphasizes relevance; a lower value emphasizes
diversity.

MMR is useful when diverse information is valuable. It is not necessary
for every query.

------------------------------------------------------------------------

## 4. Multi-Query Retrieval

### Problem

Users and documents may use different wording.

``` text
User:
"sick leave policy"

Document:
"medical leave rules"
```

### Solution

Generate multiple search variations:

``` text
Original:
"sick leave policy"

        ↓

"medical leave rules"
"time off for illness"
"employee health absence policy"
```

Retrieve for each variation:

``` text
Query 1 → Retrieval
Query 2 → Retrieval
Query 3 → Retrieval
             ↓
       Merge results
             ↓
       Remove duplicates
```

This improves recall when relevant information is expressed differently.

------------------------------------------------------------------------

## 5. Query Rewriting

Some conversational queries depend on previous context.

``` text
Earlier:
"Tell me about the sick leave policy."

Later:
"What happens after that?"
```

Rewrite the second query into a standalone search query:

``` text
"What steps follow the sick leave request process?"
```

### Query Rewriting vs Multi-Query

Query rewriting:

``` text
One ambiguous query
       ↓
One clearer query
```

Multi-query:

``` text
One query
       ↓
Multiple alternative queries
       ↓
Multiple retrievals
       ↓
Merged results
```

------------------------------------------------------------------------

## 6. Hybrid Retrieval

Semantic search is meaning-based, but exact identifiers can be
difficult.

Examples:

``` text
IT-2024-A7
SKU-12345
EMP-009812
```

These may not have useful semantic meaning.

Hybrid retrieval combines:

``` text
Keyword / lexical search
        +
Vector / semantic search
        ↓
Combined candidates
        ↓
Optional reranking
```

Use it when exact matching matters, especially for:

-   IDs
-   Product codes
-   Policy codes
-   Technical identifiers
-   Exact names

------------------------------------------------------------------------

## 7. Reranking

Initial vector retrieval is fast but approximate.

A common architecture is:

``` text
Vector search
    ↓
Top 20 candidates
    ↓
Reranker
    ↓
Top 5 final chunks
```

### Why Two Stages?

A reranker is more expensive than basic vector search.

Running it over every document would be slow.

Instead:

``` text
Fast retrieval
    ↓
Narrow candidate set
    ↓
Accurate reranking
```

This balances speed and accuracy.

------------------------------------------------------------------------

## 8. Context Compression

Retrieved chunks may contain both relevant and irrelevant text.

Compression attempts to retain only query-relevant information.

### Chunking

``` text
Document
   ↓
Chunks
```

Usually an indexing-time operation.

### Compression

``` text
Retrieved chunks
   ↓
Query-specific compression
```

A query-time operation.

Analogy:

``` text
Chunking
= Divide a book into chapters.

Compression
= Highlight only the paragraphs relevant to the current question.
```

------------------------------------------------------------------------

## 9. Retrieval Strategy Progression

Start simple:

``` text
Vector similarity
        +
Metadata filtering
```

Then add complexity only when evaluation identifies a problem:

``` text
MMR
Multi-query
Query rewriting
Hybrid search
Reranking
Context compression
```

------------------------------------------------------------------------

## 10. Common Mistakes

-   Using only top-K forever without evaluation
-   Using MMR everywhere
-   Reranking the entire corpus
-   Using semantic search alone for exact identifiers
-   Adding every advanced technique without measuring its benefit

------------------------------------------------------------------------

## 11. Production Considerations

Each additional retrieval technique can increase:

-   Latency
-   Cost
-   Complexity
-   Failure points

A good production process is:

``` text
Simple retrieval
      ↓
Evaluate
      ↓
Identify weakness
      ↓
Add targeted improvement
      ↓
Evaluate again
```

# Lesson 5.4 --- Generation

Retrieval gives us relevant information. Generation turns that
information into the final answer.

The goal is to make the response:

-   Grounded
-   Relevant
-   Clear
-   Verifiable
-   Resistant to unsupported claims

------------------------------------------------------------------------

## 1. Context Injection

``` typescript
import { ChatPromptTemplate } from "@langchain/core/prompts";

const ragPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a helpful HR assistant.

Answer the user's question using only the provided context.

If the answer is not present in the context, say:
"I don't have information about that in the provided documents."

Do not use outside knowledge.`
  ],
  [
    "human",
    "Context:
{context}

Question: {question}"
  ]
]);

const retrievedChunks = [
  "Employees receive 12 sick-leave days per year after 3 months of employment.",
  "Sick-leave requests must be submitted through the HR portal at least 1 day in advance."
];

const context = retrievedChunks.join("

---

");
```

The retrieved information becomes the evidence available to the model.

------------------------------------------------------------------------

## 2. Citations

Store source information with retrieved chunks:

``` typescript
const retrievedChunks = [
  {
    content: "Employees receive 12 sick-leave days per year.",
    source: "hr_policy.pdf",
    page: 3
  },
  {
    content: "Requests must be submitted through the HR portal.",
    source: "hr_policy.pdf",
    page: 4
  }
];
```

Build source-aware context:

``` typescript
const context = retrievedChunks
  .map(
    (chunk, index) =>
      `[${index + 1}] Source: ${chunk.source}, Page: ${chunk.page}
${chunk.content}`
  )
  .join("

");
```

Prompt the model to cite source numbers:

``` text
When using information from the context,
cite the corresponding source number such as [1] or [2].
```

Result:

``` text
Employees receive 12 sick-leave days per year [1].
Requests must be submitted through the HR portal [2].
```

Citations make the answer easier to verify.

------------------------------------------------------------------------

## 3. Grounded Answers

A core instruction is:

``` text
Use ONLY the provided context.
```

Without grounding instructions, a model may try to fill missing
information using general knowledge.

For example, if the document only states:

``` text
Employees receive 12 sick-leave days.
```

the model should not invent additional policy rules.

Important:

> Prompt instructions reduce hallucination risk, but they are not an
> absolute guarantee.

Grounding also depends on retrieval quality, context quality, model
behavior, and evaluation.

------------------------------------------------------------------------

## 4. Hallucination Reduction

Use multiple layers.

### Explicit Grounding

``` text
Use only the supplied context.
```

### Abstention

``` text
If the answer is not in the context,
say that the information is unavailable.
```

### Citations

Require factual claims to reference retrieved sources.

### Model Configuration

For factual generation, lower temperature can be appropriate.

For example:

``` typescript
temperature: 0.1
```

The exact value should be evaluated for the selected model.

### Retrieval Quality

A model cannot use information that retrieval failed to find.

``` text
Bad retrieval
    ↓
Bad context
    ↓
Bad answer
```

------------------------------------------------------------------------

## 5. No-Retrieval Handling

Do not automatically send weak retrieval results to the LLM.

For example:

``` typescript
const RELEVANCE_THRESHOLD = 0.7;

const relevantChunks = retrievedChunks.filter(
  (chunk) => chunk.score >= RELEVANCE_THRESHOLD
);

if (relevantChunks.length === 0) {
  return "I don't have relevant information to answer this question.";
}
```

The exact threshold depends on the retrieval method and score semantics
and should be evaluated.

### Benefits

-   Lower hallucination risk
-   Fewer unnecessary model calls
-   Lower cost
-   Better user trust

------------------------------------------------------------------------

# Complete RAG Pipeline

``` text
                 DOCUMENT INGESTION
                        │
                        ▼
                 Document Loader
                        │
                        ▼
                     Chunks
                        │
                        ▼
                   Embeddings
                        │
                        ▼
                  Vector Database
                        │
                        │
                        ▼
                    USER QUERY
                        │
                        ▼
                Query Processing
                        │
                        ▼
               Retrieval Strategy
                        │
          ┌─────────────┼─────────────┐
          │             │             │
       Metadata        MMR        Hybrid Search
       Filtering                  / Multi-query
          │             │             │
          └─────────────┼─────────────┘
                        ▼
                    Candidates
                        │
                        ▼
                    Reranking
                        │
                        ▼
               Context Compression
                        │
                        ▼
                 Relevance Check
                        │
                 ┌──────┴──────┐
                 │             │
              Relevant      Not relevant
                 │             │
                 ▼             ▼
          Context Injection   Abstain
                 │
                 ▼
                 LLM
                 │
                 ▼
       Grounded Answer + Citations
```

Not every production system needs every stage.

Start with:

``` text
Load
 ↓
Chunk
 ↓
Embed
 ↓
Store
 ↓
Retrieve
 ↓
Prompt
 ↓
Generate
```

Then add advanced techniques based on measured problems.

------------------------------------------------------------------------

# Production RAG Checklist

## Ingestion

-   [ ] Validate uploaded files
-   [ ] Enforce file-size limits
-   [ ] Extract text reliably
-   [ ] Preserve metadata
-   [ ] Track document ownership
-   [ ] Track document versions
-   [ ] Re-process updated documents

## Chunking

-   [ ] Choose chunk size based on document type
-   [ ] Test overlap
-   [ ] Preserve logical boundaries
-   [ ] Evaluate retrieval quality

## Retrieval

-   [ ] Start with basic similarity search
-   [ ] Apply authorization/tenant filters
-   [ ] Tune top-K
-   [ ] Consider MMR when diversity is useful
-   [ ] Consider multi-query for wording mismatch
-   [ ] Use hybrid retrieval for exact identifiers
-   [ ] Use reranking when necessary
-   [ ] Consider context compression when chunks are noisy

## Generation

-   [ ] Inject retrieved context clearly
-   [ ] Keep the model grounded
-   [ ] Handle missing information explicitly
-   [ ] Add citations
-   [ ] Use appropriate model configuration
-   [ ] Stream responses where useful

## Evaluation

Measure:

``` text
Retrieval quality
Answer relevance
Faithfulness / grounding
Latency
Cost
```

------------------------------------------------------------------------

# Exercises

## Exercise 1 --- Document Loading

HireHub supports:

``` text
Resume → PDF
Company policy → DOCX
Job description → Database text
```

Expected approach:

``` text
PDF
 ↓
PDFLoader

DOCX
 ↓
DocxLoader

Database text
 ↓
Direct database query
 ↓
Document object when useful
```

------------------------------------------------------------------------

## Exercise 2 --- Chunking

A resume contains three complete work-experience entries.

Prefer:

``` text
Chunks that preserve complete logical work-experience sections where practical
```

over arbitrary tiny chunks that repeatedly split one entry.

The reason is retrieval coherence.

------------------------------------------------------------------------

## Exercise 3 --- Exact Identifier

A user searches:

``` text
IT-2024-A7
```

Do not rely entirely on semantic search.

Consider:

``` text
Keyword search
+
Vector search
+
Optional reranking
```

because exact identifiers benefit from lexical matching.

------------------------------------------------------------------------

## Exercise 4 --- Multi-Query

Original:

``` text
remote work policy
```

Possible variations:

``` text
work-from-home policy
remote working rules
working from anywhere policy
```

These variations can improve recall when documents use different
wording.

------------------------------------------------------------------------

# Test Your Understanding

1.  What is the difference between indexing time and query time in RAG?
2.  Why is metadata such as `userId` important in a multi-user RAG
    application?
3.  What is the exact purpose of `chunkOverlap`?
4.  What is the difference between character-based and token-based
    splitting?
5.  When is MMR useful?
6.  How does multi-query retrieval improve recall?
7.  Why can hybrid search be better for IDs and product codes?
8.  Why is reranking normally performed after initial retrieval?
9.  How is context compression different from chunking?
10. What should a RAG system do when no retrieved chunk is sufficiently
    relevant?

------------------------------------------------------------------------

# Key Takeaways

``` text
RAG = Retrieval + Augmentation + Generation
```

Core pipeline:

``` text
Documents
   ↓
Load
   ↓
Chunk
   ↓
Embed
   ↓
Store
   ↓
Retrieve
   ↓
Build Context
   ↓
Generate
```

Most important production principles:

1.  Keep indexing and query-time processing separate.
2.  Preserve metadata and enforce user/tenant boundaries.
3.  Treat chunking as a retrieval-quality decision.
4.  Start with simple retrieval before adding advanced strategies.
5.  Use hybrid retrieval when exact identifiers matter.
6.  Rerank a narrowed candidate set rather than the entire corpus.
7.  Keep generation grounded in retrieved context.
8.  Handle weak or missing retrieval explicitly.
9.  Provide citations when users need source verification.
10. Evaluate retrieval and generation quality instead of assuming the
    pipeline is correct.

------------------------------------------------------------------------

# Phase 5 → Project 3 Progression

``` text
Document Upload
      ↓
Document Loading
      ↓
Chunking
      ↓
Embeddings
      ↓
Vector Storage
      ↓
Query
      ↓
Retrieval
      ↓
Relevance Filtering
      ↓
Context Injection
      ↓
Grounded Generation
      ↓
Citations
      ↓
Streaming Response
```

This is the foundation for building a production-oriented RAG
application with LangChain.js.

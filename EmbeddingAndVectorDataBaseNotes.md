# RAG Learning Notes

## Navigation

- [Phase 3 — Embeddings](#phase-3--embeddings)
  - [Lesson 3.1 — What Are Embeddings?](#lesson-31--what-are-embeddings)
  - [Semantic Similarity](#semantic-similarity)
  - [Cosine Similarity](#cosine-similarity)
  - [Similarity Search](#similarity-search)
  - [Query vs Document Embeddings](#query-vs-document-embeddings)
  - [HireHub Application](#hirehub-application)
  - [Exercises and Answers](#exercises-and-answers)
  - [Test Your Understanding](#test-your-understanding)
- [Lesson 3.2 — LangChain Embeddings in Practice](#lesson-32--langchain-embeddings-in-practice)
  - [Provider Choice](#provider-choice)
  - [Embedding Methods](#embedding-methods)
  - [Manual Similarity Search](#manual-similarity-search)
  - [Production Vector Search](#production-vector-search)
  - [Exercise and Answers](#exercise-and-answers)
  - [Experiment Results](#experiment-results)
  - [Production Insight](#production-insight)
- [Final Phase 3 Mental Model](#final-phase-3-mental-model)

---

# Phase 3 — Embeddings

Embeddings are one of the core foundations of semantic search and RAG.

The overall idea is:

```text
Text
  ↓
Embedding Model
  ↓
Vector
  ↓
Similarity Search
  ↓
Relevant Documents
  ↓
RAG
```

---

# Lesson 3.1 — What Are Embeddings?

## 1. Simple Explanation

An LLM used for generation normally follows this pattern:

```text
Prompt
  ↓
LLM
  ↓
Generated Text
```

Embeddings solve a different problem:

> How can we represent the meaning of text as numbers so that two pieces of text can be compared semantically?

Consider HireHub with 10,000 job listings.

A user searches:

```text
"remote backend role with good work-life balance"
```

Traditional keyword search might look for exact words such as `remote` and `backend`.

But a job could say:

```text
"Work from anywhere. Backend engineer. Flexible working environment."
```

The words are different, but the meaning is similar.

Embeddings allow us to represent both pieces of text as vectors so that their semantic relationship can be measured.

```text
Text
  ↓
Embedding Model
  ↓
Vector
```

Conceptually:

```text
"remote backend role"
        ↓
[0.23, -0.45, 0.67, ...]

"work from anywhere, backend"
        ↓
[0.21, -0.43, 0.69, ...]
```

Similar meanings tend to produce vectors that are close according to an appropriate similarity metric.

---

## 2. Real-World Analogy

Imagine a library where books are placed on an invisible map according to their content.

```text
Fantasy
  ● ● ●

Science
          ● ● ●

Business
                    ● ●
```

If you want a book similar to a particular fantasy novel, you can look around the same region of the map even if another book has a completely different title.

Embeddings work similarly, except the map is a high-dimensional mathematical space rather than a 2D map.

---

# Technical Breakdown

## A. Text → Embedding Model → Vector

Conceptually:

```typescript
const embedding =
  await embeddingModel.embed(
    "Remote backend developer role",
  );

console.log(embedding);
```

The result is an array of numbers:

```text
[
  0.0123,
  -0.0456,
  0.0789,
  ...
]
```

Each number is one dimension of the learned representation.

Do not assume that one dimension directly means something simple such as "technicality". The semantic information is distributed across the vector.

---

## B. Fixed Vector Dimensions

An embedding model produces vectors with a fixed number of dimensions.

Examples can include:

```text
384 dimensions
768 dimensions
1536 dimensions
```

The exact size depends on the model.

The important property is:

```text
Short text
   ↓
Fixed-size vector

Long text
   ↓
Same-size vector
```

For a particular model, all vectors exist in the same dimensional semantic space.

This is necessary for standard vector operations such as dot products and cosine similarity.

---

# Semantic Similarity

**Semantic similarity** means similarity based on meaning rather than exact wording.

For example:

```text
"I love programming in TypeScript."

"Writing TypeScript code is something I enjoy."
```

The words are different, but the meaning is very similar.

An embedding model attempts to encode that relationship into the vector representation.

```text
Sentence A → Vector A
Sentence B → Vector B

Vector A and Vector B
        ↓
high semantic similarity
```

This is the foundation of semantic search.

---

# Cosine Similarity

Cosine similarity is a common metric for comparing embedding vectors.

It measures the angle between two vectors rather than simply comparing their raw lengths.

Conceptually:

```text
Similar direction
      ↗
     ↗
    ↗
```

means high similarity.

The usual range is:

```text
-1 to 1
```

| Score | General meaning |
|---:|---|
| `1` | Same direction / maximally similar |
| `0` | Orthogonal directions |
| `-1` | Opposite directions |

For semantic search, higher similarity generally means stronger semantic alignment, but exact score thresholds are model- and application-dependent.

### Conceptual implementation

```typescript
function cosineSimilarity(
  vecA: number[],
  vecB: number[],
): number {
  const dotProduct = vecA.reduce(
    (sum, value, index) =>
      sum + value * vecB[index],
    0,
  );

  const magnitudeA = Math.sqrt(
    vecA.reduce(
      (sum, value) => sum + value * value,
      0,
    ),
  );

  const magnitudeB = Math.sqrt(
    vecB.reduce(
      (sum, value) => sum + value * value,
      0,
    ),
  );

  return dotProduct / (magnitudeA * magnitudeB);
}
```

In production, vector databases and libraries perform this type of calculation efficiently.

---

# Distance

Some systems use a distance metric instead of similarity.

The interpretation is:

```text
Small distance → more similar
Large distance → less similar
```

Common metrics include:

- Cosine-based distance
- Euclidean distance
- Other vector-space metrics

The correct metric depends on the embedding model and retrieval system.

---

# Similarity Search

Suppose HireHub already has embeddings for 1,000 job descriptions.

A user searches:

```text
"remote backend role"
```

The process is:

```text
1. Embed the query
        ↓
2. Compare query vector with stored vectors
        ↓
3. Calculate similarity
        ↓
4. Rank results
        ↓
5. Return top K
```

Example:

```text
Query
 ↓
Query Vector
 ↓
Job A → 0.91
Job B → 0.84
Job C → 0.42
Job D → 0.78
 ↓
Sort descending
 ↓
A, B, D
```

This is semantic search.

Semantic search is one of the main retrieval mechanisms used in RAG.

---

# Query vs Document Embeddings

There are two important categories.

## Query Embedding

The user's query is generated dynamically:

```text
"remote backend developer"
```

Therefore it is embedded at runtime.

## Document Embedding

Documents are usually embedded during ingestion:

```text
Job 1 → Vector
Job 2 → Vector
Job 3 → Vector
...
```

The vectors are then stored and reused.

The production architecture is:

```text
DOCUMENT INGESTION

Documents
   ↓
Embedding Model
   ↓
Document Vectors
   ↓
Vector Database


USER QUERY

Query
   ↓
Embedding Model
   ↓
Query Vector
   ↓
Vector Search
   ↓
Relevant Documents
```

This prevents the system from unnecessarily embedding every document on every search.

---

# HireHub Application

HireHub can use embeddings to improve job matching.

Instead of asking an LLM to compare a resume with thousands of jobs one by one:

```text
Resume
  ↓
Resume Embedding
  ↓
Compare with stored Job Embeddings
  ↓
Rank
  ↓
Top Matching Jobs
```

This is much more scalable than performing a separate expensive LLM comparison for every job.

A common production architecture can later combine:

```text
Semantic Search
+
Keyword Search
+
Structured Filters
```

rather than relying on embeddings alone.

---

# Common Mistakes

## 1. Thinking Embeddings Are Small LLMs

They have different purposes.

```text
Embedding Model
→ numerical semantic representation

Generative LLM
→ text generation / transformation
```

## 2. Comparing Different Embedding Models

Do not normally compare:

```text
Document → Model A
Query    → Model B
```

Each model learns its own semantic space.

Even if two models produce the same number of dimensions, their coordinates do not necessarily represent the same concepts.

## 3. Re-Embedding Documents on Every Search

Documents should generally be embedded once during ingestion and reused until their content changes.

---

# Production Considerations

### Embedding Cost

Embedding calls may have a cost. At large scale, embedding thousands or millions of documents becomes an important budget consideration.

### Stale Embeddings

If a document changes, its embedding may need to be regenerated.

```text
Updated Document
      ↓
New Embedding
      ↓
Replace Old Vector
```

### Dimensions and Storage

Larger vectors can require more storage and computation. More dimensions do not automatically mean better retrieval.

---

# Exercises and Answers

## Exercise

Given:

```text
1. Senior React Developer, 5 years experience, remote work available

2. Experienced Frontend Engineer, React expertise required, work-from-home option

3. Backend Java Developer, on-site position, database management skills needed
```

Query:

```text
"remote React job"
```

### Answer

Jobs 1 and 2 should have the highest similarity because both represent:

```text
React
+
Frontend
+
Remote / Work From Home
```

Job 3 is less relevant because it represents:

```text
Backend
+
Java
+
On-site
```

The reasoning is semantic, not merely based on exact keyword overlap.

---

# Test Your Understanding

## Q1. How are embeddings different from a generative LLM?

### Answer

Embeddings convert text into numerical vectors so that semantic relationships can be represented and compared.

A generative LLM predicts tokens to produce or transform text.

```text
Embeddings:
Text → Vector

Generative LLM:
Input → Token prediction → Text
```

---

## Q2. What is the range of cosine similarity?

### Answer

The mathematical range is:

```text
-1 to 1
```

Generally:

```text
1  → same direction
0  → orthogonal
-1 → opposite direction
```

---

## Q3. Why must embeddings have fixed dimensions?

### Answer

Standard vector operations require corresponding coordinates.

For example:

```text
Vector A → 768 dimensions
Vector B → 768 dimensions
```

allows coordinate-by-coordinate operations.

If one vector has 768 dimensions and the other has 300, standard dot-product comparison is not defined.

Fixed dimensionality also ensures that all texts from the same embedding model occupy the same semantic space.

---

## Q4. Why are document embeddings usually precomputed?

### Answer

Documents usually exist before the search request.

If we embedded all documents on every search:

```text
Query
 ↓
Embed Query
 ↓
Re-embed 100,000 Documents
 ↓
Search
```

we would introduce unnecessary latency and API cost.

Instead:

```text
Ingestion
 ↓
Embed Documents
 ↓
Store Vectors

Search
 ↓
Embed Query
 ↓
Search Stored Vectors
```

---

## Q5. Can vectors from two different embedding models be compared directly?

### Answer

No, not reliably.

Each embedding model learns its own semantic space.

For example, Google and OpenAI may both produce numerical vectors, but the coordinates belong to different learned representations.

Therefore, if the application changes embedding models, stored documents generally need to be re-embedded with the new model.

---

# Lesson 3.2 — LangChain Embeddings in Practice

LangChain provides a common interface for working with different embedding providers.

Examples include:

```text
OpenAIEmbeddings
GoogleGenerativeAIEmbeddings
```

For this exercise, Google embeddings are used.

---

# Provider Choice

Install the Google integration:

```bash
npm install @langchain/google-genai
```

Store the API key in environment variables rather than source code.

Example:

```env
GEMINI_API=your_api_key
```

Use a validated environment configuration module in the application.

---

# Embedding Model Setup

```typescript
import {
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";

const embeddings =
  new GoogleGenerativeAIEmbeddings({
    apiKey: env.GEMINI_API,
    model: "text-embedding-004",
  });
```

Provider model names can change over time, so verify the currently supported embedding model when starting a new project.

---

# `embedQuery()`

For a single search query:

```typescript
const vector =
  await embeddings.embedQuery(
    "Remote backend developer role",
  );

console.log(vector.length);
console.log(vector.slice(0, 5));
```

The flow is:

```text
String
 ↓
embedQuery()
 ↓
One Vector
```

---

# `embedDocuments()`

For multiple documents:

```typescript
const jobDescriptions = [
  "Senior React Developer, remote, 5 years experience",
  "Backend Java Developer, on-site, database skills",
  "Frontend Engineer, React expertise, work from home",
];

const vectors =
  await embeddings.embedDocuments(
    jobDescriptions,
  );

console.log(vectors.length);
console.log(vectors[0].length);
```

The flow is:

```text
String[]
 ↓
embedDocuments()
 ↓
Vector[]
```

For three documents:

```text
3 documents
 ↓
3 vectors
```

---

# `embedQuery()` vs `embedDocuments()`

| Method | Input | Output | Typical purpose |
|---|---|---|---|
| `embedQuery()` | One string | One vector | Runtime query |
| `embedDocuments()` | Array of strings | Array of vectors | Document ingestion |

Some embedding models also implement query and document embedding with different internal behavior. The exact semantics are provider/model dependent.

---

# Manual Similarity Search

Before using a vector database, manual similarity calculation is useful for learning.

```typescript
function cosineSimilarity(
  vecA: number[],
  vecB: number[],
): number {
  if (vecA.length !== vecB.length) {
    throw new Error(
      "Vectors must have the same dimensions",
    );
  }

  const dotProduct = vecA.reduce(
    (sum, value, index) =>
      sum + value * vecB[index],
    0,
  );

  const magnitudeA = Math.sqrt(
    vecA.reduce(
      (sum, value) => sum + value * value,
      0,
    ),
  );

  const magnitudeB = Math.sqrt(
    vecB.reduce(
      (sum, value) => sum + value * value,
      0,
    ),
  );

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error(
      "Cosine similarity is undefined for a zero vector",
    );
  }

  return dotProduct / (magnitudeA * magnitudeB);
}
```

Then:

```typescript
const queryVector =
  await embeddings.embedQuery(
    "remote React job",
  );

const similarities =
  vectors.map((docVector, index) => ({
    text: jobDescriptions[index],
    score: cosineSimilarity(
      queryVector,
      docVector,
    ),
  }));

similarities.sort(
  (a, b) => b.score - a.score,
);

console.log(similarities);
```

The algorithm is:

```text
Query
 ↓
Query Vector
 ↓
Compare against each document vector
 ↓
Similarity Scores
 ↓
Sort descending
 ↓
Top Results
```

---

# Why Manual Search Does Not Scale

For:

```text
3 documents
```

a loop is perfectly acceptable for learning.

For:

```text
10,000 documents
```

a naive search performs roughly:

```text
O(n)
```

comparisons per query.

For millions of documents, this becomes expensive and slow.

This is why vector databases exist.

---

# Production Vector Search

A vector database stores:

```text
Document
+
Embedding
+
Metadata
```

and provides optimized similarity search.

The production progression is:

```text
Manual Vector Comparison
        ↓
Vector Database
        ↓
Indexed Similarity Search
```

Vector databases commonly use approximate nearest-neighbor techniques such as HNSW to avoid a naive full scan.

The next phase will cover this in detail with pgvector.

---

# Common Mistakes

## Mistake 1 — Mixing Up Methods

```text
embedQuery()
→ one query

embedDocuments()
→ multiple documents
```

## Mistake 2 — Re-Embedding Every Search

Do this:

```text
Ingestion → embed → store
Search    → embed query → search stored vectors
```

not:

```text
Search → re-embed every document
```

## Mistake 3 — Printing the Whole Vector

Vectors can contain hundreds of values.

Prefer:

```typescript
console.log(vector.length);
console.log(vector.slice(0, 5));
```

for sanity checks.

---

# Production Considerations

## Model Consistency

Use the same compatible embedding model for vectors that need to be compared.

If the model changes:

```text
Old model
 ↓
Old document vectors
```

cannot simply be mixed with:

```text
New model
 ↓
New query vectors
```

Re-embedding may be required.

## Batch Embedding

Use:

```typescript
embedDocuments()
```

when processing many documents rather than repeatedly calling `embedQuery()` in a loop.

## Caching

Store embeddings and reuse them when the underlying document has not changed.

Useful metadata includes:

```text
documentId
embedding
embeddingModel
updatedAt
```

---

# Exercise and Answers

## Exercise

Build a standalone HireHub script that:

1. Creates five job descriptions.
2. Embeds them with `embedDocuments()`.
3. Embeds a user query with `embedQuery()`.
4. Calculates cosine similarity.
5. Sorts results.
6. Prints the top two jobs.

Expected architecture:

```text
5 Job Descriptions
        ↓
embedDocuments()
        ↓
5 Document Vectors

User Query
        ↓
embedQuery()
        ↓
1 Query Vector

Query Vector
        ↓
Cosine Similarity
        ↓
Sort
        ↓
Top 2
```

---

# Test Your Understanding

## Q1. Why are `embedQuery()` and `embedDocuments()` separate methods?

### Answer

They represent different operations.

```typescript
embedQuery(text)
```

takes one string and returns one vector.

```typescript
embedDocuments(texts)
```

takes an array and returns an array of vectors.

`embedDocuments()` is also appropriate for batch document ingestion.

Some models may additionally use different query/document processing internally, but this is provider/model dependent.

---

## Q2. Why is a manual `vectors.map(...)` search impractical for 10,000 documents?

### Answer

The query must be compared against every stored vector, resulting in a linear:

```text
O(n)
```

search.

As the dataset grows, each query requires more comparisons.

A vector database uses specialized indexes and approximate nearest-neighbor algorithms to make retrieval much more efficient.

---

## Q3. What happens if you change the embedding model?

### Answer

Old vectors belong to the old model's semantic space.

New query vectors belong to the new model's semantic space.

They should not be directly compared.

Therefore, changing the embedding model generally requires re-embedding stored documents and rebuilding the vector index.

---

## Q4. What happens if two vectors have different dimensions in the naive implementation?

### Answer

Without validation, an expression such as:

```typescript
vecA[i] * vecB[i]
```

can eventually multiply a number by `undefined`.

That produces:

```text
NaN
```

The function may silently return `NaN` instead of throwing an error.

A safer implementation checks dimensions first:

```typescript
if (vecA.length !== vecB.length) {
  throw new Error(
    "Vectors must have the same dimensions",
  );
}
```

This prevents silent invalid similarity results.

---

## Q5. Why is embedding a query on every keystroke a production concern?

### Answer

A user may produce many requests while typing:

```text
s
so
sof
soft
softw
software
...
```

Generating an embedding for every keystroke can cause:

- Unnecessary API calls
- Higher cost
- Rate-limit pressure
- More backend load
- Poorer UX

Production solutions include:

```text
Debouncing
+
Minimum query length
+
Request cancellation
+
Caching
```

---

# Experiment Results

## Experiment 1 — `"Fullstack jobs"`

The observed results were approximately:

```text
1. Fullstack developer with Generative AI skills
   Score ≈ 0.763

2. Fullstack developer with at least one year of experience
   Score ≈ 0.730
```

This result is reasonable because both documents explicitly contain the concept `Fullstack`.

However, the stronger demonstration of semantic search is when a query uses different wording from the relevant document.

---

## Experiment 2 — `"software developer job"`

The observed results were approximately:

```text
1. Backend developer with MERN and Java stack
   Score ≈ 0.646

2. Junior Full Stack Developer with at least one year of experience
   Score ≈ 0.643
```

The scores were much closer than in Experiment 1.

### Why?

The query is generic:

```text
"software developer job"
```

It does not specify:

```text
React
Backend
Java
MERN
AI
Full Stack
```

Several documents can therefore be semantically related to the query.

This demonstrates:

```text
Specific Query
    ↓
Clearer retrieval signal
    ↓
Better differentiation

Generic Query
    ↓
Broad retrieval signal
    ↓
Closer similarity scores
```

---

# Production Insight

Query quality affects retrieval quality.

If users frequently search for:

```text
"developer job"
"software job"
"good job"
```

the semantic search system has little information with which to distinguish results.

A production UI can guide users with:

```text
Filters
Search suggestions
Skill selection
Role selection
Experience filters
Location / work-mode filters
```

For HireHub, a strong production search can combine:

```text
Keyword Search
+
Semantic Search
+
Structured Filters
```

This hybrid approach is often more useful than relying on embeddings alone.

---

# Final Phase 3 Mental Model

The complete embedding workflow is:

```text
                    DOCUMENT INGESTION
                           │
                           ▼
                       Documents
                           │
                           ▼
                    Embedding Model
                           │
                           ▼
                     Document Vectors
                           │
                           ▼
                    Vector Database
                           │
                           │
                           │
USER QUERY                │
    │                     │
    ▼                     │
Embedding Model           │
    │                     │
    ▼                     │
 Query Vector ────────────┘
          │
          ▼
   Similarity Search
          │
          ▼
   Top-K Documents
          │
          ▼
         RAG
```

The responsibilities are different:

```text
Embeddings
→ represent text as vectors

Vector Database
→ store and retrieve vectors efficiently

RAG
→ retrieve relevant information and provide it
  to an LLM so it can generate a grounded answer
```

Therefore:

```text
Phase 3 — Embeddings
        ↓
Semantic representation
        ↓
Phase 4 — Vector Databases
        ↓
Persistent and scalable retrieval
        ↓
Phase 5 — RAG
        ↓
Retrieval + Generation
```

---

# Phase 3 Key Engineering Lessons

1. Embeddings are numerical semantic representations, not generated answers.
2. Generative LLMs and embedding models solve different problems.
3. Semantic similarity is based on learned representations rather than exact keyword overlap.
4. Standard vector comparison requires compatible dimensions and the same semantic space.
5. Documents should normally be embedded during ingestion.
6. Queries are embedded at runtime.
7. Manual linear search is excellent for learning but does not scale.
8. Vector databases provide specialized retrieval for large collections.
9. Changing the embedding model can require re-embedding the entire corpus.
10. Query specificity affects retrieval quality.
11. Production search can combine semantic search, keyword search, and structured filters.
12. Embeddings are a foundation of RAG, but embeddings alone are not RAG.

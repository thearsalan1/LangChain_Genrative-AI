# GenAI Learning Notes — Completed Topics 62–64

> Refined revision notes for the topics completed so far. Topics 65–72 are intentionally not included yet.

## Contents

- [Topic 62 — AI, ML, Deep Learning, GenAI, and LLMs](#topic-62--ai-ml-deep-learning-genai-and-llms)
- [Topic 63 — OpenAI API](#topic-63--openai-api)
- [Topic 64 — Prompt Engineering](#topic-64--prompt-engineering)
- [Quick Interview Revision](#quick-interview-revision)
- [Important Corrections](#important-corrections)

---

# Topic 62 — AI, ML, Deep Learning, GenAI, and LLMs

## 62.1 What is AI?

**Artificial Intelligence (AI)** is the broad field of computer science that focuses on creating systems capable of performing tasks that normally require human intelligence.

Examples include:

- Understanding language.
- Recognizing images and speech.
- Solving problems.
- Making predictions.
- Planning actions.
- Generating content.

AI is the largest concept in this topic.

## 62.2 What is Machine Learning?

**Machine Learning (ML)** is a subset of AI in which systems learn patterns from data instead of relying only on explicitly written rules.

### Traditional programming

```text
Rules + Data → Output
```

Example:

```javascript
if (userInput === "hello") {
  reply = "Hi there!";
}
```

### Machine learning

```text
Data + Expected Outputs → Learned Model
New Data + Learned Model → Prediction
```

Instead of writing every rule manually, we provide examples and allow the model to learn patterns.

### Examples of ML

- Predicting house prices.
- Detecting spam emails.
- Recommending products.
- Detecting fraudulent transactions.
- Classifying images.

## 62.3 What is Deep Learning?

**Deep Learning** is a branch of machine learning that uses neural networks with many layers to learn complex patterns.

Deep learning is especially effective for:

- Images.
- Speech.
- Natural language.
- Video.
- Large-scale pattern recognition.

## 62.4 What is Generative AI?

**Generative AI (GenAI)** is AI that creates new content based on patterns learned from existing data.

It can generate:

- Text.
- Code.
- Images.
- Audio.
- Music.
- Video.

### Discriminative versus generative AI

| Type | Main purpose | Example |
|---|---|---|
| Discriminative AI | Classifies or predicts existing data | Spam or not spam |
| Generative AI | Creates new content | Write a reply to an email |

### Simplified hierarchy

```text
AI
└── Machine Learning
    └── Deep Learning
        └── Generative AI
            └── Large Language Models
```

This is a useful learning hierarchy, although real-world AI systems may combine different techniques.

## 62.5 What is a language model?

A **language model** is a model that learns patterns in language and estimates what token or sequence of tokens is likely to come next.

For example:

```text
The sun rises in the ___
```

The model may assign a high probability to `east`.

## 62.6 What is an LLM?

**LLM** means **Large Language Model**. It is a large machine-learning model trained on extensive text and code data to understand and generate language.

LLMs can perform tasks such as:

- Answering questions.
- Summarizing documents.
- Translating text.
- Generating code.
- Extracting information.
- Classifying text.
- Drafting emails.
- Explaining technical topics.

Examples of model families include GPT, Claude, Gemini, Llama, and Mistral.

## 62.7 How does an LLM work?

A simplified generation process is:

1. You provide an input called a prompt.
2. The model divides the input into tokens.
3. Tokens are converted into numerical representations.
4. A neural network processes the sequence and its context.
5. The model calculates probabilities for the next token.
6. A decoding strategy selects a token.
7. The selected token is added to the sequence.
8. The process repeats until the response is complete.

```text
Prompt → Tokens → Model processing → Next-token probabilities → Generated response
```

### Important clarification

Saying that an LLM “predicts the next token” explains the core generation mechanism, but it does not mean the system is always simple or incapable of useful reasoning. Modern applications may also add retrieval, tools, planning, code execution, or multiple model calls around the language model.

An LLM does not have human consciousness or human experiences. It performs learned computation and can produce useful reasoning-like outputs, but those outputs can still be incorrect.

## 62.8 What is a token?

A **token** is a small unit of text processed by a language model. A token may be:

- A complete word.
- Part of a word.
- Punctuation.
- A number.
- A symbol.

For example, a word may be represented as one token or several subword tokens. Therefore, one token is not always equal to one word.

Token counts affect:

- Context-window usage.
- API cost.
- Response length.
- Latency.

## 62.9 What is a context window?

The **context window** is the maximum amount of information a model can process for one request.

It may include:

- System instructions.
- User messages.
- Previous assistant messages.
- Retrieved documents.
- Tool results.
- The new generated response.

A context window is not permanent memory. If the application does not store and resend previous information, the model generally cannot use it in a later request.

## 62.10 Limitations of LLMs

### Hallucination

An LLM may produce a confident but incorrect or unsupported answer.

### Outdated knowledge

A model may not know recent information unless it is connected to search, a database, or another current-data tool.

### Mathematical and logical errors

LLMs can make mistakes in exact calculations or complex logic. Use a calculator, program, database, or verification step when precision matters.

### Context limitations

Very long conversations or documents may exceed the context window or reduce the model’s ability to focus on relevant information.

### Nondeterminism

The same prompt may produce different answers depending on model settings, provider behavior, and sampling.

### Security and privacy risks

Sensitive information may be exposed if it is sent to an external provider without proper controls. User input can also contain prompt-injection attempts.

## 62.11 Foundation models and applications

A **foundation model** is a broadly trained model that can support many tasks.

An **AI application** is a product built around one or more models. It may add:

- A user interface.
- Prompts.
- Conversation storage.
- Retrieval.
- Tools.
- Authentication.
- Business rules.
- Safety controls.

The distinction can be confusing because companies sometimes use the same brand name for both a model family and a chat product.

## 62.12 User perspective versus builder perspective

### Application developer perspective

Most developers use existing models through APIs or local runtimes. Their work includes:

- API integration.
- Prompt engineering.
- Structured outputs.
- Embeddings and RAG.
- Tool calling.
- Agents.
- Evaluation.
- Cost and security controls.

### Model-builder perspective

Model builders work on:

- Data collection and cleaning.
- Tokenization.
- Transformer architecture.
- Pretraining.
- Optimization.
- Fine-tuning.
- Alignment and preference training.
- Evaluation.
- Infrastructure and deployment.

For an application or backend developer, the user/integrator perspective is the appropriate starting point.

---

# Topic 63 — OpenAI API

## 63.1 What is an API?

An **API (Application Programming Interface)** is a defined way for two software systems to communicate.

In an AI API integration:

```text
Your application → HTTP request → Provider server → Model inference → HTTP response → Your application
```

## 63.2 What problem does the OpenAI API solve?

The API allows your application to use hosted models without managing the model infrastructure yourself.

You generally do not need to:

- Download large model weights.
- Purchase specialized GPUs.
- Manage inference servers.
- Scale model infrastructure manually.

However, you must manage API keys, costs, quotas, latency, privacy, failures, and provider dependency.

## 63.3 Basic setup

Install the official SDK:

```bash
npm install openai dotenv
```

Create a `.env` file:

```env
OPENAI_API_KEY=your_api_key_here
```

Add it to `.gitignore`:

```gitignore
.env
node_modules
```

Never hardcode an API key or expose it in frontend/browser code.

## 63.4 Basic client setup

```typescript
import "dotenv/config";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

### Explanation

- `dotenv/config` loads local environment variables.
- `OpenAI` is imported from the official SDK.
- `new OpenAI(...)` creates an authenticated client.
- `process.env.OPENAI_API_KEY` reads the key from the server environment.
- The client is reused for future API calls.

## 63.5 Chat Completions API

```typescript
const response = await openai.chat.completions.create({
  model: "YOUR_OPENAI_MODEL",
  messages: [
    {
      role: "user",
      content: "What is the capital of France?",
    },
  ],
});

const answer = response.choices[0]?.message.content ?? "No response generated.";
console.log(answer);
```

### Explanation

- `chat.completions.create(...)` sends a chat-generation request.
- `model` identifies the model to use.
- `messages` contains the conversation input.
- `role: "user"` identifies the message as the user’s request.
- `response.choices` contains possible generated outputs.
- `choices[0]` selects the first output.
- `message.content` contains the generated text.
- The fallback prevents a crash if no content is returned.

Use the current OpenAI documentation to select a currently available model and API style. Model identifiers and API features change over time.

## 63.6 Message roles

```typescript
const messages = [
  {
    role: "system" as const,
    content: "You are a friendly coding mentor.",
  },
  {
    role: "user" as const,
    content: "What is async/await?",
  },
];
```

| Role | Purpose |
|---|---|
| `system` | Defines high-level behavior, rules, tone, and constraints. |
| `user` | Contains the user’s input or task. |
| `assistant` | Represents a previous model response included in the conversation history. |

Role support and exact priority behavior may vary by API and provider.

## 63.7 System instruction and parameters

```typescript
const response = await openai.chat.completions.create({
  model: "YOUR_OPENAI_MODEL",
  messages: [
    {
      role: "system",
      content: "You are a professional coding mentor. Explain simply and briefly.",
    },
    {
      role: "user",
      content: "What is async/await?",
    },
  ],
  temperature: 0.2,
  max_tokens: 200,
});
```

- `temperature` influences output variation. Lower values are often useful for consistent answers.
- `max_tokens` limits the generated output in APIs that support this parameter.
- These settings do not guarantee factual accuracy.

## 63.8 Express chat endpoint

```typescript
import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
  const { userMessage } = req.body as { userMessage?: string };

  if (!userMessage || typeof userMessage !== "string") {
    return res.status(400).json({ error: "userMessage is required" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "YOUR_OPENAI_MODEL",
      messages: [
        {
          role: "system",
          content: "You are a helpful customer-support agent.",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.2,
      max_tokens: 300,
    });

    const reply = response.choices[0]?.message.content;

    if (!reply) {
      return res.status(502).json({ error: "The AI returned no reply" });
    }

    return res.json({ reply });
  } catch (error: any) {
    console.error("OpenAI request failed", {
      status: error?.status,
      requestId: error?.request_id,
    });

    if (error?.status === 429) {
      return res.status(429).json({
        error: "The service is busy. Please try again shortly.",
      });
    }

    return res.status(502).json({ error: "AI request failed" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
```

### Endpoint explanation

1. `express()` creates the Express application.
2. `express.json()` parses incoming JSON.
3. `app.post("/chat", ...)` creates a POST endpoint.
4. The request body is read from `req.body`.
5. The input is checked before calling the provider.
6. The system message defines the assistant’s behavior.
7. The user message contains the actual request.
8. `await` waits for the provider response.
9. The generated reply is extracted and returned as JSON.
10. Errors are handled without exposing provider internals.

## 63.9 Conversation history

A model generally does not remember earlier requests automatically. Your application can store history and send relevant messages again.

```typescript
type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const conversations: Record<string, ChatMessage[]> = {};

app.post("/chat-with-memory", async (req, res) => {
  const { userId, userMessage } = req.body as {
    userId?: string;
    userMessage?: string;
  };

  if (!userId || !userMessage) {
    return res.status(400).json({
      error: "userId and userMessage are required",
    });
  }

  if (!conversations[userId]) {
    conversations[userId] = [
      { role: "system", content: "You are a helpful assistant." },
    ];
  }

  conversations[userId].push({ role: "user", content: userMessage });

  try {
    const response = await openai.chat.completions.create({
      model: "YOUR_OPENAI_MODEL",
      messages: conversations[userId],
      temperature: 0.2,
      max_tokens: 300,
    });

    const reply = response.choices[0]?.message.content;

    if (!reply) {
      return res.status(502).json({ error: "Empty model response" });
    }

    conversations[userId].push({ role: "assistant", content: reply });

    return res.json({ reply });
  } catch (error) {
    console.error(error);
    return res.status(502).json({ error: "AI request failed" });
  }
});
```

### How the memory example works

For a new user:

```typescript
conversations["user123"] = [
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "Hello!" },
  { role: "assistant", content: "Hi! How can I help?" },
];
```

On the next request, the application sends the relevant history again. The model appears to remember, but the application is actually resending context.

### Why this example is not production-ready

- Data disappears when the server restarts.
- It does not work correctly across multiple server instances.
- Memory grows forever.
- An arbitrary `userId` can cause data-access problems without authentication.
- Long histories increase token usage and latency.

Use a database, authenticated user identity, retention rules, summarization, and token-aware history trimming in production.

## 63.10 Embeddings

An **embedding** converts content into a numerical vector that represents semantic features of the content.

```typescript
const embeddingResponse = await openai.embeddings.create({
  model: "YOUR_EMBEDDING_MODEL",
  input: "A document about refund policy",
});

const vector = embeddingResponse.data[0]?.embedding;

if (!vector) {
  throw new Error("Embedding was not returned");
}

console.log(vector.length);
```

### Explanation

- `embeddings.create(...)` requests an embedding.
- `model` selects the embedding model.
- `input` is the text to convert.
- `data[0].embedding` is the vector.
- The vector can be stored in a vector database for semantic search.

Embeddings do not generate a normal conversational answer. They represent content numerically.

### Embedding use case

```text
Document: “Customers may return unused items within 30 days.”
Question: “How long do I have to send something back?”
```

Keyword search may miss the relationship between “return” and “send something back.” Embedding search can identify their semantic similarity.

## 63.11 API key security

Use environment variables or a secret manager:

```typescript
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is missing");
}
```

Never:

- Commit `.env` files.
- Place provider keys in frontend JavaScript.
- Send keys to users.
- Print keys in logs.
- Put keys directly into source code.

## 63.12 Rate limits and errors

A `429` response often indicates rate limiting or quota exhaustion. A production application should:

- Respect provider rate-limit information.
- Retry temporary failures with exponential backoff and jitter.
- Avoid infinite retries.
- Queue or throttle requests.
- Return a safe user-facing message.
- Monitor usage and billing.

Not every error should be retried. Invalid requests, authentication errors, and permission failures usually require correction rather than repetition.

---

# Topic 64 — Prompt Engineering

## 64.1 What is prompt engineering?

**Prompt engineering** is the practice of designing instructions, context, examples, and output requirements so that an AI model produces more useful, consistent, and task-appropriate results.

Prompt engineering is not magic and is not a substitute for application logic. A good production system combines prompts with validation, retrieval, tools, authorization, and evaluation.

## 64.2 The problem with vague prompts

Suppose you build a customer-support bot and send only:

```text
Where is my order?
```

The model may produce a long generic explanation about tracking orders. It does not know:

- What role it should play.
- How long the answer should be.
- Whether order data is available.
- What it must not invent.
- Which format the frontend expects.

The API call may be technically correct while the application output is still poor.

## 64.3 A useful prompt structure

```text
Role
Task
Context
Constraints
Output format
Examples
Verification or fallback behavior
```

### Example

```typescript
const messages = [
  {
    role: "system",
    content: `You are a professional e-commerce support agent.

Task: Help the customer understand their order status.

Rules:
- Answer in no more than three sentences.
- Be polite and concise.
- Use only the order information provided by the application.
- Never invent a tracking number or delivery date.
- If order information is missing, ask for the order ID.

Output: Return a plain-text reply for the customer.`,
  },
  {
    role: "user",
    content: "Where is my order?",
  },
];
```

## 64.4 Core prompt-engineering techniques

### 1. Clear instructions

Bad:

```text
Tell me about dogs.
```

Better:

```text
List three dog breeds suitable for small apartments.
For each breed, provide one benefit and one concern.
Use bullet points and keep the response under 100 words.
```

### 2. Role definition

```text
You are a professional customer-support agent for an online store.
Use a polite, concise, and practical tone.
```

A role can guide style and behavior, but it does not give the model real authority or access to company systems.

### 3. Format specification

```text
Return exactly this format:

Summary: <one sentence>
Details:
- <point one>
- <point two>
```

Format instructions are useful, but validate machine-readable responses in application code.

### 4. Few-shot prompting

Few-shot prompting provides examples of desired input-output behavior.

```typescript
const messages = [
  {
    role: "system",
    content: "Return only Positive, Negative, or Neutral.",
  },
  { role: "user", content: "This product is amazing!" },
  { role: "assistant", content: "Positive" },
  { role: "user", content: "Worst purchase ever." },
  { role: "assistant", content: "Negative" },
  { role: "user", content: "It is okay and works." },
];
```

### 5. Constraints

Specify:

- Maximum length.
- Tone.
- Allowed topics.
- Required fields.
- Forbidden claims.
- Fallback behavior.

### 6. Context injection

If the model must answer from application data, clearly mark the data as context:

```text
Use only the following order record. If the answer is not present, say that the information is unavailable.

<order_context>
Status: Shipped
Carrier: Example Express
Estimated date: 20 August
</order_context>
```

The model’s response must still be validated and should not be treated as an authorization decision.

### 7. Decomposition and verification

For complex tasks, split the work into stages:

```text
1. Extract the relevant facts.
2. Check whether required information is missing.
3. Produce the final answer in the requested format.
```

For mathematical or critical tasks, use a calculator, code, database, or separate verification step rather than trusting generated reasoning alone.

## 64.5 Zero-shot and few-shot prompting

| Method | Meaning | Example |
|---|---|---|
| Zero-shot | Give an instruction without examples. | “Classify this review as positive or negative.” |
| Few-shot | Give examples before the real input. | Show three reviews and their labels first. |
| Fine-tuning | Train or adapt model behavior using a dataset. | Train for a specialized repeated format. |

## 64.6 System prompts

A system prompt usually defines stable behavior, tone, constraints, and boundaries.

```typescript
{
  role: "system",
  content: "You are a concise coding mentor. Explain concepts using one example."
}
```

Important limitations:

- A system prompt is not a security boundary.
- It does not create real permissions.
- It does not guarantee obedience.
- It should not replace server-side validation or authorization.

## 64.7 JSON and structured output

A prompt can request JSON:

```text
Return only valid JSON:
{
  "score": 1,
  "strengths": [],
  "weaknesses": [],
  "recommendation": "Interview"
}
```

However, “return JSON” alone is not enough for production. Prefer provider-native structured output where supported and validate the result with a schema.

```typescript
import { z } from "zod";

const resultSchema = z.object({
  score: z.number().min(1).max(10),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendation: z.enum(["Hire", "Reject", "Interview"]),
});

const result = resultSchema.parse(JSON.parse(modelText));
```

JSON syntax does not guarantee factual correctness. It only helps with structure.

## 64.8 Temperature and prompt engineering

- Lower temperature is often suitable for classification, extraction, support, and structured output.
- Higher temperature is often suitable for brainstorming, creative writing, and alternative ideas.
- Temperature cannot fix a missing instruction, missing context, bad retrieval, or incorrect business logic.

Use evaluation tests to choose settings rather than relying on assumptions.

## 64.9 Improving a bad response

When output is poor, debug in this order:

1. Is the task clearly defined?
2. Is the correct context included?
3. Is the user input separated from instructions?
4. Is the desired format explicit?
5. Are examples needed?
6. Are length and tone constrained?
7. Does the model need retrieval or a tool?
8. Is the output validated?
9. Is the model appropriate for the task?
10. Did a provider or model change affect behavior?

## 64.10 Production prompt checklist

Before shipping a prompt, verify that it:

- States the task clearly.
- Defines the audience and tone.
- Specifies required and forbidden behavior.
- Defines what to do when information is missing.
- Separates trusted instructions from untrusted data.
- Specifies the output format.
- Includes examples when the format is difficult.
- Avoids requesting private hidden reasoning.
- Has test cases for normal, edge, and adversarial inputs.

---

# Quick Interview Revision

## What is AI, ML, and LLM?

AI is the broad goal of creating intelligent systems. ML is a data-driven approach within AI. An LLM is a large ML model specialized in language understanding and generation.

## What is a token?

A token is a unit of text processing such as a word, subword, punctuation mark, or symbol.

## What is a context window?

It is the maximum amount of input and output context a model can process in one request. It is not permanent memory.

## Do LLMs think?

LLMs do not have human consciousness or experiences. They perform learned computation and can produce reasoning-like outputs, but those outputs are not guaranteed to be correct.

## What are the main LLM limitations?

Hallucination, outdated knowledge, context limits, nondeterminism, mathematical errors, privacy risks, and prompt-injection risks.

## What do the chat roles mean?

`system` defines behavior, `user` provides the request, and `assistant` represents previous model output included as conversation history.

## What is temperature?

Temperature influences output variation. Lower values often produce more consistent output; higher values often produce more varied output.

## What are embeddings?

Embeddings are numerical vectors that represent semantic features of content. They are useful for similarity search and RAG.

## Why use `.env` for API keys?

It keeps secrets out of source code and reduces the chance of accidentally publishing them. In production, use a proper secret manager where appropriate.

## How do you handle a 429 error?

Use controlled retries with exponential backoff and jitter, respect quotas and rate limits, throttle traffic, and return a safe temporary-error message.

## What is prompt engineering?

It is the design of instructions, context, examples, constraints, and output formats to obtain more useful and consistent model behavior.

## Is JSON mode enough?

No. It can help produce valid JSON, but the application must validate the schema and business meaning.

---

# Important Corrections

1. **ChatGPT, Gemini, and Claude can refer to either products or model families.** Always clarify whether you mean the application or the underlying model.
2. **LLMs do more than simple word matching.** Next-token prediction describes the core training and generation objective, but applications may add reasoning, retrieval, tools, planning, and code execution.
3. **Temperature does not mean creativity in a human sense.** It changes sampling behavior and does not guarantee quality.
4. **`max_tokens` and related parameters vary by provider and API version.** Check current documentation before deploying code.
5. **JSON mode does not guarantee correct facts.** Validate every structured response.
6. **Conversation history is application-managed context, not automatic model memory.**
7. **Chain-of-thought should not be treated as a requirement to reveal private internal reasoning.** Ask for concise explanations and verifiable results instead.
8. **Prompt engineering cannot replace security.** Authorization, validation, and business rules must be implemented in normal application code.
9. **Embeddings are not answers.** They are vectors used for similarity and retrieval.
10. **OpenAI-compatible APIs are not always fully compatible.** Model names, limits, tools, errors, and structured-output features can differ.

---

# Current Scope

Completed and refined in this document:

- Topic 62 — What is AI/ML? LLMs explained simply.
- Topic 63 — OpenAI API: chat completions and embeddings.
- Topic 64 — Prompt engineering for developers.

Not included yet:

- Topic 65 — LangChain / LlamaIndex basics.
- Topic 66 — Vector databases.
- Topic 67 — RAG.
- Topic 68 — AI agents.
- Topic 69 — Streaming responses.
- Topic 70 — Function calling / tool use.
- Topic 71 — AI-powered features.
- Topic 72 — Cost optimization, rate limits, and fallbacks.

# Phase 1 — LangChain.js Fundamentals

> **Goal:** Learn LangChain.js from the fundamentals to production-oriented usage.

In Phase 0, we built a chatbot using the raw Groq SDK.

In Phase 1, we will use the same concepts through **LangChain.js's unified abstractions**.

---

# Table of Contents

* [Lesson 1.1 — What Is LangChain?](#lesson-11--what-is-langchain)

  * [1. Simple Explanation](#1-simple-explanation)
  * [2. Real-World Analogy](#2-real-world-analogy)
  * [3. Why LangChain Exists](#3-why-langchain-exists)
  * [4. When Not to Use LangChain](#4-when-not-to-use-langchain)
  * [5. Direct SDK vs LangChain](#5-direct-sdk-vs-langchain)
  * [6. LangChain Building Blocks](#6-langchain-building-blocks)
  * [7. Common Mistakes](#7-common-mistakes)
  * [8. Production Notes](#8-production-notes)

* [Lesson 1.2 — Models](#lesson-12--models)

  * [1. Simple Explanation](#1-simple-explanation-1)
  * [2. Installation](#2-installation)
  * [3. Basic Initialization](#3-basic-initialization)
  * [4. Non-Streaming: invoke()](#4-non-streaming-invoke)
  * [5. Streaming: stream()](#5-streaming-stream)
  * [6. Switching Providers](#6-switching-providers)
  * [7. Model Fallbacks](#7-model-fallbacks)
  * [8. Common Mistakes](#8-common-mistakes-1)

* [Lesson 1.3 — Messages Deep Dive](#lesson-13--messages-deep-dive)

  * [1. What Are Messages?](#1-what-are-messages)
  * [2. Message Types](#2-message-types)
  * [3. Response Metadata](#3-response-metadata)
  * [4. Serialize Messages](#4-serialize-messages-for-a-database)
  * [5. Deserialize Messages](#5-deserialize-messages)
  * [6. ToolMessage Preview](#6-toolmessage-preview)
  * [7. Production Notes](#7-production-notes-1)

* [Lesson 1.4 — Prompt Templates](#lesson-14--prompt-templates)

  * [1. Why Prompt Templates?](#1-why-prompt-templates)
  * [2. PromptTemplate](#2-prompttemplate)
  * [3. ChatPromptTemplate](#3-chatprompttemplate)
  * [4. MessagesPlaceholder](#4-messagesplaceholder)
  * [5. Few-Shot Templates](#5-few-shot-templates)
  * [6. Production Prompt Structure](#6-production-prompt-structure)
  * [7. Common Mistakes](#7-common-mistakes-2)

* [Complete Chatbot Using LangChain](#complete-chatbot-using-langchain)

  * [Project Structure](#updated-folder-structure)
  * [Prompt](#srcaipromptschatbotprompts)
  * [Session Store](#srcstoresessionstorelangchaints)
  * [Chat Service](#srcserviceschatservicelangchaints)
  * [Controller](#srccontrollerchatcontrollerlangchaints)
  * [Routes](#srcrouteschatroutests)
  * [Application](#srcappts)
  * [Server](#srcserverts)
  * [Final Request Flow](#final-request-flow)
  * [Project 0 vs LangChain](#key-project-0-vs-langchain-change)

* [Lesson 1.5 — Output Parsers](#lesson-15--output-parsers)

  * [1. Simple Explanation](#1-simple-explanation-2)
  * [2. Real-World Analogy](#2-real-world-analogy-1)
  * [3. Technical Breakdown](#3-technical-breakdown)
  * [4. Real Application Usage](#4-real-application-usage)
  * [5. Common Mistakes](#5-common-mistakes-2)
  * [6. Production Considerations](#6-production-considerations)
  * [Exercise](#small-exercise)
  * [Test Your Understanding](#test-your-understanding-5-questions)
  * [My Attempt and Code Review](#my-attempt-and-code-review)

* [Lesson 1.6 — Runnables / LCEL](#lesson-16--runnables--lcel)

  * [1. Simple Explanation](#1-simple-explanation-3)
  * [2. Real-World Analogy](#2-real-world-analogy-2)
  * [3. Technical Breakdown](#3-technical-breakdown-1)
  * [4. Real Application Usage](#4-real-application-usage-1)
  * [5. Common Mistakes](#5-common-mistakes-3)
  * [6. Production Considerations](#6-production-considerations-1)
  * [Exercise](#small-exercise-1)
  * [Test Your Understanding](#test-your-understanding-5-questions-1)
  * [My Current Implementation](#my-current-implementation)

---

# Lesson 1.1 — What Is LangChain?

## 1. Simple Explanation

In Project 0, we manually handled several things:

* Initialized the Groq client.
* Created arrays containing system instructions, conversation history, and user messages.
* Wrote the streaming loop ourselves.
* Extracted text from provider-specific Groq chunks:

```typescript
chunk.choices?.delta?.content ?? "";
```

The problem becomes more obvious when we want to switch providers.

For example, if we move from:

```text
Groq
```

to:

```text
OpenAI
Gemini
Anthropic
Local Models
```

the raw SDK approach may require changes to imports, configuration, request formats, and response handling.

### LangChain.js

**LangChain.js is an abstraction layer that provides common interfaces for working with different LLM providers and AI application components.**

For example:

```typescript
await model.invoke("Hello");

await model.stream("Hello");
```

The calling pattern is largely consistent even when the underlying provider changes.

This does **not** mean that every provider behaves identically. Provider capabilities, model quality, pricing, tool support, and response behavior can still differ.

---

## 2. Real-World Analogy

Think of LangChain like **Prisma**.

Prisma abstracts differences between databases:

```text
PostgreSQL → MySQL → SQLite
```

Similarly, LangChain abstracts many differences between LLM providers:

```text
Groq → OpenAI → Anthropic → Gemini
```

However, LangChain is much more than a provider abstraction.

It also provides reusable building blocks for:

* Prompts
* Messages
* Models
* Runnables
* Chains
* Output parsing
* Tools
* Agents
* Retrievers
* RAG
* Multi-step AI workflows

---

## 3. Why LangChain Exists

LangChain provides abstractions for:

### Provider Abstraction

A common programming pattern across different model providers.

### Messages

Built-in message types such as:

```typescript
SystemMessage
HumanMessage
AIMessage
ToolMessage
```

### Prompt Templates

Reusable prompts containing dynamic variables.

### Streaming

A common:

```typescript
.stream()
```

interface.

### Structured Output

Better patterns for obtaining validated structured data from models.

### Runnables / LCEL

A way to connect AI components into pipelines.

### Tools and Agents

Building function-calling and multi-step workflows.

### RAG

Integrations for:

* Document loaders
* Vector stores
* Retrievers
* Retrieval pipelines

---

## 4. When Not to Use LangChain

LangChain is **not mandatory for every AI project**.

A raw provider SDK can be better when:

* You only need one simple LLM call.
* You need a provider-specific feature that LangChain does not expose properly.
* You want minimal dependencies.
* You are building an extremely latency-sensitive serverless function.
* You want debugging to stay as direct as possible.

A simple rule:

```text
Simple one-call chatbot
        ↓
Raw SDK can be enough

RAG + tools + prompts + multi-step workflow
        ↓
LangChain becomes much more useful
```

---

## 5. Direct SDK vs LangChain

| Aspect           | Direct SDK                                | LangChain.js                            |
| ---------------- | ----------------------------------------- | --------------------------------------- |
| Provider change  | Provider-specific code changes            | Usually import/class/config changes     |
| Simple API call  | Lightweight                               | Additional abstraction                  |
| Streaming        | Provider response format handled manually | Common `.stream()` pattern              |
| Messages         | Manually manage arrays/types              | Built-in message classes                |
| Prompt templates | Manual template literals                  | `PromptTemplate` / `ChatPromptTemplate` |
| RAG              | Manually build integrations               | Reusable abstractions                   |
| Tools            | Manually implement workflows              | Tool abstractions                       |
| Agents           | Manually implement                        | Agent abstractions                      |
| Debugging        | More direct                               | Additional abstraction layer            |

> **Important:** LangChain makes provider switching easier, but it does **not** guarantee identical model quality, pricing, tool behavior, latency, or provider-specific capabilities.

---

## 6. LangChain Building Blocks

A simplified picture of the LangChain ecosystem:

```text
Chat Models
    ↓
ChatGroq / ChatOpenAI / ChatAnthropic

Messages
    ↓
SystemMessage / HumanMessage / AIMessage / ToolMessage

Prompt Templates
    ↓
Dynamic and reusable prompts

Runnables / LCEL
    ↓
Connect components into pipelines

Output Parsers
    ↓
Convert model output into useful structured data

Retrievers
    ↓
Retrieve relevant information

Tools / Agents
    ↓
Perform actions and execute multi-step workflows
```

---

## 7. Common Mistakes

Avoid these mistakes:

* Using LangChain for every simple task.
* Treating LangChain as magic without understanding raw LLM concepts.
* Copying old tutorials without checking the installed LangChain version.
* Assuming provider switching is completely risk-free.
* Avoiding raw SDKs unnecessarily.
* Assuming every LangChain provider integration supports exactly the same features.

---

## 8. Production Notes

For production applications:

* Pin your LangChain versions.
* Centralize model and provider configuration.
* Keep prompts organized instead of scattering them throughout controllers.
* Test model output quality before implementing provider fallbacks.
* Keep a raw SDK escape hatch when a provider-specific feature is important.
* Evaluate dependency size and cold-start impact in serverless environments.
* Add proper error handling around model calls.

---

# Lesson 1.2 — Models

## 1. Simple Explanation

In Project 0, we used the Groq-specific client:

```typescript
const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
});
```

With LangChain, we use a chat-model class:

```typescript
const model = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0.7,
});
```

The important idea is that the application interacts with a **model abstraction** instead of directly handling the provider's low-level API.

Common methods include:

```typescript
await model.invoke(...);

await model.stream(...);
```

---

## 2. Installation

Install LangChain Core and the Groq integration:

```bash
npm install @langchain/core @langchain/groq
```

If OpenAI is needed later:

```bash
npm install @langchain/openai
```

| Package             | Purpose                                             |
| ------------------- | --------------------------------------------------- |
| `@langchain/core`   | Messages, prompts, runnables, and core abstractions |
| `@langchain/groq`   | Groq integration                                    |
| `@langchain/openai` | OpenAI integration                                  |

---

## 3. Basic Initialization

```typescript
import { ChatGroq } from "@langchain/groq";
import { env } from "../config/env.js";

export const model = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0.7,
  maxTokens: 300,
});
```

### Important parameters

* `apiKey` — authenticates with the provider.
* `model` — selects the model.
* `temperature` — controls randomness.
* `maxTokens` — limits generated output.

---

## 4. Non-Streaming: `.invoke()`

Use `.invoke()` when you want the complete response.

```typescript
const response = await model.invoke(
  "Explain JavaScript closures in 2 lines."
);

console.log(response.content);
```

The important point:

```typescript
response
```

is an `AIMessage`, not simply a string.

Therefore:

```typescript
console.log(response.content);
```

is used to access the generated content.

---

## 5. Streaming: `.stream()`

Use `.stream()` when you want the response incrementally.

```typescript
const stream = await model.stream(
  "Explain JavaScript closures in 2 lines."
);

for await (const chunk of stream) {
  const content = String(chunk.content);

  if (content) {
    process.stdout.write(content);
  }
}
```

### Raw Groq SDK

Previously, we had to access provider-specific data:

```typescript
chunk.choices?.delta?.content ?? "";
```

### LangChain

We can use:

```typescript
chunk.content;
```

LangChain normalizes provider response formats into its message/chunk abstractions.

---

## 6. Switching Providers

For example, with OpenAI:

```typescript
import { ChatOpenAI } from "@langchain/openai";
import { env } from "../config/env.js";

const model = new ChatOpenAI({
  apiKey: env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0.7,
});
```

The calling pattern remains similar:

```typescript
await model.invoke("Hello");

await model.stream("Hello");
```

This is one of the main benefits of using an abstraction layer.

---

## 7. Model Fallbacks

A production application can have a primary and backup model.

```typescript
const primaryModel = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
});

const backupModel = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "llama-3.1-8b-instant",
});

const modelWithFallback =
  primaryModel.withFallbacks([backupModel]);

const response = await modelWithFallback.invoke(
  "Explain closures simply."
);
```

The fallback helps when the primary model call fails.

However, fallback does **not** fix:

* Bad prompts.
* Incorrect application logic.
* Poor model quality.
* Unsafe tool behavior.
* Incorrect business logic.

Fallback is primarily a **reliability mechanism**, not a quality guarantee.

---

## 8. Common Mistakes

Avoid:

* Treating `response` as a string instead of using `response.content`.
* Assuming every stream chunk contains text.
* Forgetting to install `@langchain/core`.
* Using model fallbacks without testing quality differences.
* Assuming every provider supports every LangChain feature identically.

---

# Lesson 1.3 — Messages Deep Dive

## 1. What Are Messages?

LangChain messages are more than simple text containers.

A message can contain:

* `content` — actual message content.
* `id` — message identifier.
* `usage_metadata` — token usage information.
* `response_metadata` — provider-specific information.
* `tool_calls` — tool calls requested by the model.

---

## 2. Message Types

Import the common message classes:

```typescript
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  ToolMessage,
} from "@langchain/core/messages";
```

| Message         | Purpose                                   |
| --------------- | ----------------------------------------- |
| `SystemMessage` | Developer instructions and behavior rules |
| `HumanMessage`  | User input                                |
| `AIMessage`     | Model response                            |
| `ToolMessage`   | Result returned from a tool               |

Example:

```typescript
const messages = [
  new SystemMessage("You are a helpful teacher."),
  new HumanMessage("Explain closures."),
  new AIMessage(
    "A closure remembers variables from its outer scope."
  ),
];
```

Conceptually:

```text
SystemMessage
      ↓
Instructions

HumanMessage
      ↓
User input

AIMessage
      ↓
Model response

ToolMessage
      ↓
Tool execution result
```

---

## 3. Response Metadata

Example:

```typescript
const response = await model.invoke(
  "Explain closures."
);

console.log(response.content);
console.log(response.id);
console.log(response.usage_metadata);
console.log(response.response_metadata);
```

Remember:

```typescript
response.content
```

contains the content of **one response message**, not the entire conversation.

Token usage may look like:

```typescript
{
  input_tokens: 45,
  output_tokens: 120,
  total_tokens: 165
}
```

Token metadata is useful for:

* Cost tracking.
* Monitoring.
* Usage analytics.
* Debugging.

---

## 4. Serialize Messages for a Database

Do not use LangChain class instances directly as your database storage format.

Instead, convert them into plain objects.

```typescript
import type { BaseMessage } from "@langchain/core/messages";

export function serializeMessage(
  message: BaseMessage
) {
  return {
    role: message._getType(),
    content: message.content,
  };
}
```

Then:

```typescript
const serializedHistory = history.map(
  serializeMessage
);
```

Example stored data:

```json
[
  {
    "role": "human",
    "content": "Explain closures"
  },
  {
    "role": "ai",
    "content": "A closure remembers variables..."
  }
]
```

> **Important:** LangChain internally uses `"human"` for the human message role, not `"user"`.

This matters when deserializing the messages later.

---

## 5. Deserialize Messages

```typescript
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  type BaseMessage,
} from "@langchain/core/messages";

type StoredMessage = {
  role: string;
  content: string;
};

export function deserializeMessage(
  message: StoredMessage
): BaseMessage {
  switch (message.role) {
    case "system":
      return new SystemMessage(message.content);

    case "human":
      return new HumanMessage(message.content);

    case "ai":
      return new AIMessage(message.content);

    default:
      throw new Error(
        `Unknown message role: ${message.role}`
      );
  }
}
```

If the database contains:

```json
{
  "role": "user",
  "content": "Hello"
}
```

but your deserializer expects `"human"`, you can get:

```text
Unknown message role: user
```

Therefore, your serialization and deserialization formats must remain consistent.

---

## 6. ToolMessage Preview

A tool result can be represented using `ToolMessage`:

```typescript
import { ToolMessage } from "@langchain/core/messages";

const toolResult = new ToolMessage({
  content: JSON.stringify({
    temperature: 32,
    condition: "Sunny",
  }),
  tool_call_id: "call_123",
});
```

The:

```typescript
tool_call_id
```

connects the tool result with the exact tool call that produced it.

This becomes especially important when the model requests multiple tools.

---

## 7. Production Notes

For production applications:

* Log `usage_metadata` for cost tracking.
* Store a `sessionId` or `conversationId` with persisted messages.
* Validate stored roles during deserialization.
* Set message-size limits.
* Keep the system message first.
* Use a shared helper for consistently constructing messages.

Example:

```typescript
import {
  HumanMessage,
  SystemMessage,
  type BaseMessage,
} from "@langchain/core/messages";

export function buildMessages(
  systemPrompt: string,
  history: BaseMessage[],
  userMessage: string
): BaseMessage[] {
  return [
    new SystemMessage(systemPrompt),
    ...history,
    new HumanMessage(userMessage),
  ];
}
```

---

# Lesson 1.4 — Prompt Templates

## 1. Why Prompt Templates?

A hardcoded prompt is simple:

```typescript
const prompt =
  "You are a great teacher.";
```

A dynamic prompt can be written using JavaScript template literals:

```typescript
const prompt = `
Analyze this resume for ${jobRole}.

Candidate: ${candidateName}.
`;
```

This works, but as applications grow, prompts become difficult to:

* Reuse.
* Maintain.
* Test.
* Organize.
* Modify.

LangChain provides prompt templates so that variables can be defined once and supplied later.

---

## 2. `PromptTemplate`

```typescript
import { PromptTemplate } from "@langchain/core/prompts";

const resumeTemplate = PromptTemplate.fromTemplate(
  `Analyze this resume for a {jobRole} position.

Candidate: {candidateName}

Resume:
{resumeText}`
);

const prompt = await resumeTemplate.format({
  jobRole: "Full Stack Developer",
  candidateName: "Arsalan",
  resumeText:
    "3 years of experience with React, Node.js, and MongoDB.",
});

console.log(prompt);
```

The placeholders:

```text
{jobRole}
{candidateName}
{resumeText}
```

are filled when `.format()` is called.

If a required variable is missing, formatting fails instead of silently inserting `undefined`.

---

## 3. `ChatPromptTemplate`

For chat applications, use `ChatPromptTemplate`.

```typescript
import { ChatPromptTemplate } from "@langchain/core/prompts";

const resumeChatTemplate =
  ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are an HR analyst reviewing resumes for {jobRole} roles.",
    ],
    [
      "human",
      "Analyze this resume:\n{resumeText}",
    ],
  ]);

const messages =
  await resumeChatTemplate.formatMessages({
    jobRole: "Backend Developer",
    resumeText:
      "5 years of Node.js and PostgreSQL experience.",
  });

const response = await model.invoke(messages);
```

`formatMessages()` returns formatted LangChain message objects.

This is useful because chat models work naturally with structured messages.

---

## 4. `MessagesPlaceholder`

When building chat applications, we often need to insert previous conversation history.

`MessagesPlaceholder` is designed for this.

```typescript
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

const chatPrompt =
  ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are a helpful teacher. Explain concepts simply.",
    ],

    new MessagesPlaceholder("history"),

    [
      "human",
      "{userMessage}",
    ],
  ]);
```

Then:

```typescript
const messages =
  await chatPrompt.formatMessages({
    history,
    userMessage: "Explain JavaScript closures.",
  });
```

The final order becomes:

```text
System message
      ↓
Previous conversation history
      ↓
New user message
```

This replaces manually writing:

```typescript
[
  new SystemMessage(SYSTEM_PROMPT),
  ...history,
  new HumanMessage(userMessage),
];
```

---

## 5. Few-Shot Templates

Few-shot prompting means giving the model examples of the desired behavior.

Example:

```typescript
const sentimentPrompt =
  ChatPromptTemplate.fromMessages([
    [
      "system",
      "Classify sentiment as Positive, Negative, or Neutral.",
    ],

    [
      "human",
      "Product was great and delivery was fast.",
    ],

    [
      "ai",
      "Positive",
    ],

    [
      "human",
      "Product broke immediately. Terrible experience.",
    ],

    [
      "ai",
      "Negative",
    ],

    [
      "human",
      "{review}",
    ],
  ]);
```

The model receives examples before seeing the actual input.

Conceptually:

```text
Example 1
Input → Output

Example 2
Input → Output

Actual Input
   ↓
Expected behavior
```

This is useful when the required behavior is easier to demonstrate than to describe.

---

## 6. Production Prompt Structure

Do not scatter large prompts across controllers and services.

A better structure is:

```text
src/
└── ai/
    └── prompts/
        ├── chatbot.prompt.ts
        ├── resumeAnalysis.prompt.ts
        └── sentiment.prompt.ts
```

Example:

```typescript
// src/ai/prompts/chatbot.prompt.ts

import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

export const chatbotPrompt =
  ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are a helpful teacher. Explain concepts clearly.",
    ],

    new MessagesPlaceholder("history"),

    [
      "human",
      "{userMessage}",
    ],
  ]);
```

This makes prompts:

* Reusable.
* Testable.
* Easier to modify.
* Easier to review.
* Separate from application/business logic.

---

## 7. Common Mistakes

### Variable mismatch

Template:

```text
{jobRole}
```

Wrong:

```typescript
.format({
  role: "Developer"
});
```

Correct:

```typescript
.format({
  jobRole: "Developer"
});
```

Other common mistakes:

* Using `MessagesPlaceholder("history")` but passing the wrong variable name.
* Hardcoding prompts throughout controllers/services.
* Treating user input as trusted instructions.
* Ignoring prompt injection risks.
* Mixing application data and system instructions unnecessarily.

---

# Complete Chatbot Using LangChain

Now we combine the concepts learned so far into a complete LangChain chatbot.

## Updated Folder Structure

```text
src/
├── app.ts
├── server.ts
├── config/
│   └── env.ts
├── controller/
│   └── chatControllerLangChain.ts
├── routes/
│   └── chatRoutes.ts
├── services/
│   └── chatServiceLangChain.ts
├── store/
│   └── sessionStoreLangChain.ts
└── ai/
    └── prompts/
        └── chatbot.prompt.ts
```

---

## `src/ai/prompts/chatbot.prompt.ts`

```typescript
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

export const chatbotPrompt =
  ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a helpful and patient teacher.

Explain concepts using simple language.

Use examples when helpful.

If the question is unclear, ask for clarification.`,
    ],

    new MessagesPlaceholder("history"),

    [
      "human",
      "{userMessage}",
    ],
  ]);
```

The prompt consists of:

```text
System instructions
        ↓
Conversation history
        ↓
Current user message
```

---

## `src/store/sessionStoreLangChain.ts`

```typescript
import type { BaseMessage } from "@langchain/core/messages";

const sessionHistories = new Map<
  string,
  BaseMessage[]
>();

const MAX_HISTORY_MESSAGES = 20;

export function getSessionHistory(
  sessionId: string
): BaseMessage[] {
  const existingHistory =
    sessionHistories.get(sessionId);

  if (existingHistory) {
    return existingHistory;
  }

  const newHistory: BaseMessage[] = [];

  sessionHistories.set(
    sessionId,
    newHistory
  );

  return newHistory;
}

export function saveSessionMessages(
  sessionId: string,
  messages: BaseMessage[]
): void {
  const history =
    getSessionHistory(sessionId);

  history.push(...messages);

  if (
    history.length >
    MAX_HISTORY_MESSAGES
  ) {
    history.splice(
      0,
      history.length -
        MAX_HISTORY_MESSAGES
    );
  }
}
```

### What this store does

The `Map` stores conversation history by session ID:

```text
sessionId
    ↓
BaseMessage[]
```

For example:

```text
session-123
    ↓
[
  HumanMessage,
  AIMessage,
  HumanMessage,
  AIMessage
]
```

The maximum history is limited to 20 messages.

> This is suitable for learning and local development. For a production system, persistent storage such as PostgreSQL, MongoDB, Redis, or a dedicated LangChain/LangGraph persistence mechanism would normally be considered.

---

## `src/services/chatServiceLangChain.ts`

```typescript
import type { BaseMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";

import { env } from "../config/env.js";
import { chatbotPrompt } from "../ai/prompts/chatbot.prompt.js";

const model = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0.7,
  maxTokens: 300,
});

export async function* streamChatResponse(
  history: BaseMessage[],
  userMessage: string
): AsyncGenerator<string, void, void> {

  const messages =
    await chatbotPrompt.formatMessages({
      history,
      userMessage,
    });

  const stream =
    await model.stream(messages);

  for await (const chunk of stream) {
    const content =
      String(chunk.content);

    if (content) {
      yield content;
    }
  }
}
```

### Important

`userMessage` is already a string.

Do **not** create another:

```typescript
new HumanMessage(userMessage)
```

inside the service just to send it to the prompt template.

The prompt template is already responsible for converting the value into the appropriate message structure.

---

## `src/controller/chatControllerLangChain.ts`

```typescript
import {
  AIMessage,
  HumanMessage,
} from "@langchain/core/messages";

import type {
  Request,
  Response,
} from "express";

import {
  streamChatResponse,
} from "../services/chatServiceLangChain.js";

import {
  getSessionHistory,
  saveSessionMessages,
} from "../store/sessionStoreLangChain.js";

function sendSseEvent(
  res: Response,
  data: unknown
): void {
  res.write(
    `data: ${JSON.stringify(data)}\n\n`
  );
}

export async function createStreams(
  req: Request,
  res: Response
): Promise<void> {

  const {
    sessionId,
    message,
  } = req.body;

  if (
    typeof message !== "string" ||
    message.trim().length === 0
  ) {
    res.status(400).json({
      error:
        "Message is required and must be a non-empty string",
    });

    return;
  }

  if (
    typeof sessionId !== "string" ||
    sessionId.trim().length === 0
  ) {
    res.status(400).json({
      error:
        "sessionId is required and must be a non-empty string",
    });

    return;
  }

  const history =
    getSessionHistory(sessionId);

  res.setHeader(
    "Content-Type",
    "text/event-stream"
  );

  res.setHeader(
    "Cache-Control",
    "no-cache"
  );

  res.setHeader(
    "Connection",
    "keep-alive"
  );

  let assistantResponse = "";

  try {
    for await (
      const chunk of streamChatResponse(
        history,
        message.trim()
      )
    ) {
      assistantResponse += chunk;

      sendSseEvent(res, {
        text: chunk,
      });
    }

    saveSessionMessages(
      sessionId,
      [
        new HumanMessage(
          message.trim()
        ),

        new AIMessage(
          assistantResponse
        ),
      ]
    );

    sendSseEvent(res, {
      done: true,
    });

    res.end();

  } catch (error) {

    console.error(
      "LangChain streaming error:",
      error
    );

    sendSseEvent(res, {
      error:
        "Something went wrong while generating the response",
    });

    res.end();
  }
}
```

---

## `src/routes/chatRoutes.ts`

```typescript
import { Router } from "express";

import {
  createStreams,
} from "../controller/chatControllerLangChain.js";

const router = Router();

router.post(
  "/chat-lang",
  createStreams
);

export default router;
```

---

## `src/app.ts`

```typescript
import express from "express";

import chatRoutes from "./routes/chatRoutes.js";

const app = express();

app.use(express.json());

app.use(
  "/api",
  chatRoutes
);

export default app;
```

---

## `src/server.ts`

```typescript
import app from "./app.js";
import { env } from "./config/env.js";

app.listen(
  env.PORT,
  () => {
    console.log(
      `Server running on http://localhost:${env.PORT}`
    );
  }
);
```

---

# Final Request Flow

The complete request travels through the application like this:

```text
POST /api/chat-lang
        ↓
chatRoutes.ts
        ↓
chatControllerLangChain.ts
        ↓
Get BaseMessage[] history for session
        ↓
ChatPromptTemplate
        ↓
System + History + User Message
        ↓
ChatGroq.stream(messages)
        ↓
SSE chunks sent to frontend
        ↓
HumanMessage + AIMessage saved in history
```

---

# Key Project 0 vs LangChain Change

## Project 0 — Raw Groq SDK

```text
Manual message array
        ↓
Manual Groq chunk extraction
        ↓
Custom ChatMessage type
        ↓
Provider-specific implementation
```

## LangChain

```text
ChatPromptTemplate
        ↓
SystemMessage / HumanMessage / AIMessage
        ↓
chunk.content
        ↓
ChatGroq unified model interface
```

The main benefit is not that LangChain makes the underlying model more intelligent.

The benefit is that it provides **reusable abstractions for building larger AI systems**.

---

# Lesson 1.5 — Output Parsers

## 1. Simple Explanation

In Lesson 0.4, we manually handled structured output:

```text
Prompt asks for JSON
        ↓
Model returns response
        ↓
JSON.parse()
        ↓
Zod safeParse()
        ↓
Retry if validation fails
```

This works, but the same boilerplate has to be implemented repeatedly.

LangChain provides structured-output abstractions that reduce this work.

One of the most important approaches is:

```typescript
withStructuredOutput()
```

This allows us to provide a schema and ask the model integration to return structured data.

---

## 2. Real-World Analogy

Think of the manual approach as building your own quality checker:

```text
JSON.parse()
      +
Zod safeParse()
      +
Retry logic
```

You build this checker yourself every time.

LangChain's structured output functionality provides a reusable abstraction around this workflow.

You define the expected schema, and LangChain handles much of the structured-output plumbing.

---

# 3. Technical Breakdown

## A. `withStructuredOutput()` — Modern Approach

This is the clean approach for supported model integrations.

```typescript
import { z } from "zod";
import { ChatGroq } from "@langchain/groq";

const ResumeAnalysisSchema = z.object({
  atsScore: z.number().min(0).max(100),

  missingSkills: z.array(
    z.string()
  ),

  suggestions: z.array(
    z.string()
  ).min(1).max(5),
});

const model = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
});

const structuredModel =
  model.withStructuredOutput(
    ResumeAnalysisSchema
  );

const result =
  await structuredModel.invoke(
    "Analyze this resume: 3 years React, Node.js experience..."
  );

console.log(result.atsScore);

console.log(result.missingSkills);
```

### What happens here?

### Step 1 — Define the schema

```typescript
const ResumeAnalysisSchema = z.object({
  atsScore: z.number().min(0).max(100),
  missingSkills: z.array(z.string()),
  suggestions: z.array(z.string()).min(1).max(5),
});
```

This defines the structure we expect.

### Step 2 — Bind the schema

```typescript
const structuredModel =
  model.withStructuredOutput(
    ResumeAnalysisSchema
  );
```

Now the model is configured to produce structured output according to that schema.

### Step 3 — Invoke the model

```typescript
const result =
  await structuredModel.invoke(...);
```

The returned result is already structured according to the configured integration.

You don't manually need to do:

```typescript
JSON.parse(...)
```

for the normal structured-output path.

TypeScript can also infer the resulting shape from the schema.

For example:

```typescript
result.atsScore
```

is understood as a number.

---

## Hard Guarantee vs Soft Guarantee

This distinction is important.

When the provider supports constrained decoding or equivalent native structured-output capabilities, the integration may be able to enforce the structure during generation.

That is stronger than simply generating arbitrary text and validating it afterward.

Conceptually:

### Manual approach

```text
Generate anything
      ↓
Parse
      ↓
Validate
      ↓
Reject if invalid
```

### Constrained structured output

```text
Generate according to allowed structure
      ↓
Structured result
```

However:

> **Do not interpret this as "the model can never fail."**

Network failures, rate limits, provider errors, unsupported schemas, configuration problems, and other failures can still occur.

Provider support also varies.

---

# B. `StructuredOutputParser` — Older / Manual Approach

You may encounter the older pattern in tutorials and existing codebases.

```typescript
import { StructuredOutputParser } from "langchain/output_parsers";

const parser =
  StructuredOutputParser.fromZodSchema(
    ResumeAnalysisSchema
  );

const formatInstructions =
  parser.getFormatInstructions();

const prompt = `
Analyze this resume.

${formatInstructions}

Resume: ...
`;

const response =
  await model.invoke(prompt);

const parsed =
  await parser.parse(
    response.content as string
  );
```

Here, the parser generates format instructions that are inserted into the prompt.

Then you manually parse the model response.

### Difference

```text
StructuredOutputParser
        ↓
Prompt instructions
        ↓
Model
        ↓
Manual parser.parse()
```

Whereas:

```text
withStructuredOutput()
        ↓
Model configured with schema
        ↓
Structured result
```

### Production Rule

For new code, prefer:

```typescript
withStructuredOutput()
```

when the model integration supports it appropriately.

Understand `StructuredOutputParser` because:

* You will encounter it in older tutorials.
* Existing projects may use it.
* It can provide more direct control over format instructions.
* Some provider/integration edge cases may require alternative approaches.

It is **not** a special solution for complex schemas.

---

# C. Validation Failure — What Happens?

Even with structured output, production code should have error handling.

```typescript
try {
  const result =
    await structuredModel.invoke(
      userPrompt
    );

  // If execution reaches here,
  // the structured-output operation succeeded.
} catch (error) {

  console.error(
    "Structured output failed:",
    error
  );

  // Fallback logic
  // or user-friendly error response
}
```

Important:

```text
Structured output
≠
The request can never fail
```

You can still encounter:

* Network errors.
* Rate limits.
* Provider errors.
* Invalid configuration.
* Unsupported capabilities.
* Unexpected edge cases.

Therefore, `try/catch` remains important.

---

# D. Structured Output + Streaming

Structured output and streaming can be a difficult combination.

Suppose the final output should be:

```json
{
  "atsScore": 87,
  "missingSkills": [
    "Docker"
  ]
}
```

If we stream it token by token, the frontend may temporarily receive:

```text
{
```

then:

```text
{"atsScore":
```

then:

```text
{"atsScore": 8
```

then:

```text
{"atsScore": 87,
```

These intermediate states are incomplete JSON.

The frontend cannot reliably treat every partial chunk as a complete object.

Therefore, for normal structured-output use cases:

```typescript
structuredModel.invoke(...)
```

is usually simpler than:

```typescript
structuredModel.stream(...)
```

unless you specifically need advanced progressive structured-output handling.

---

# 4. Real Application Usage

This is directly useful for the **HireHub resume analysis/matching feature**.

Previously, the resume parser manually performed:

```text
Model
 ↓
JSON.parse()
 ↓
Zod validation
 ↓
Retry
```

Now we can use:

```typescript
withStructuredOutput()
```

to simplify the implementation.

For example, a job-matching schema can contain:

```typescript
const JobMatchSchema = z.object({
  matchScore: z.number().min(0).max(100),
  matchingSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  recommendations: z.array(z.string()),
});
```

---

# 5. Common Mistakes

Avoid:

* Using streaming when you need a complete structured object without handling partial output.
* Assuming structured output means the request can never fail.
* Removing `try/catch` because a schema is present.
* Using the old `StructuredOutputParser` pattern unnecessarily when `withStructuredOutput()` is supported.
* Creating extremely complicated schemas that make model behavior less reliable.
* Assuming every provider offers exactly the same structured-output guarantees.

---

# 6. Production Considerations

## Provider Support

Different providers can have different levels of structured-output support.

Some may support native/constrained structured generation while others may rely on prompt-based techniques or other mechanisms.

Always understand the behavior of the provider you are using.

## Schema Complexity

Very complex schemas can reduce reliability.

For example:

```text
Simple schema
    ↓
Usually easier for the model

Highly nested schema
+ many fields
+ strict enums
+ complicated constraints
    ↓
Potentially harder to satisfy reliably
```

Keep schemas as simple as the application requirements allow.

## Graceful Degradation

If structured output repeatedly fails:

```text
Do not crash the application
        ↓
Handle the error
        ↓
Log it
        ↓
Return a safe user-facing response
        ↓
Optionally use a fallback
```

For example:

```text
"Resume analysis is temporarily unavailable.
Please try again later."
```

---

# Small Exercise

Build a **Job Matching** feature for HireHub using `withStructuredOutput()`.

Your schema should contain:

```text
matchScore
matchingSkills
missingSkills
recommendation
```

Requirements:

1. Bind the model with `withStructuredOutput()`.
2. Use one `.invoke()` call.
3. Provide the resume and job description.
4. Decide whether `.invoke()` or `.stream()` is more appropriate.
5. Explain your decision using the structured-output + streaming trade-off.

---

# Test Your Understanding — 5 Questions

### Question 1

What additional capability can `withStructuredOutput()` provide compared with manually doing:

```text
JSON.parse()
+
Zod safeParse()
```

?

### Question 2

Why can structured output and streaming be problematic together?

Think about an incomplete JSON object being received token by token.

### Question 3

Why should you still use `try/catch` with structured output?

What does structured-output support guarantee, and what does it **not** guarantee?

### Question 4

What problems can occur when a Zod schema becomes extremely complex?

### Question 5

Why is it still useful to understand `StructuredOutputParser` even if you prefer `withStructuredOutput()` for new code?

---

# My Attempt and Code Review

I attempted to build the resume/job matching feature.

My initial code was:

```typescript
import { z } from "zod";
import { chatGroq } from "@langchain/groq";

const ResumeParseSchema = z.object({
  matchScore: z.string().min(1).max(100),
  matchingSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  recommendation: z.arrat(z.string())
});

const model = new chatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 7,
});

const structuredModel =
  model.withStructuredOutput(
    ResumeParseSchema
  );

const resumeParseTemplate =
  ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are an expert in taking out matchscore,
      matching skills, missingSkills and
      recommendations from the resume ${resume}
      and jobDescription ${jobDescription}`
    ]
  ]);

export async function* ResumeParseData(
  resume,
  jobDescription
) {
  const message =
    await resumeParseTemplate.formatMessages({
      resume,
      jobDescription
    });

  const response =
    await structuredModel.invoke(message);
}
```

There were several bugs.

---

## Bug 1 — Incorrect Import Name

I wrote:

```typescript
import { chatGroq } from "@langchain/groq";
```

The correct class name is:

```typescript
import { ChatGroq } from "@langchain/groq";
```

JavaScript/TypeScript is case-sensitive.

Class names conventionally use PascalCase.

---

## Bug 2 — Missing `env` Import

I used:

```typescript
apiKey: env.GROQ_API_KEY
```

without importing `env`.

The required import is:

```typescript
import { env } from "../config/env.js";
```

---

## Bug 3 — Invalid Temperature

I wrote:

```typescript
temperature: 7
```

This is outside the usual supported range for temperature-based model APIs.

A value such as:

```typescript
temperature: 0.3
```

is much more appropriate for a structured extraction task.

For structured data extraction, lower temperature can generally make the output more deterministic.

---

## Bug 4 — Incorrect Zod Type

I wrote:

```typescript
matchScore: z.string().min(1).max(100)
```

This does **not** mean:

```text
number between 1 and 100
```

It means:

```text
string whose length is between 1 and 100 characters
```

For a score, we need a number:

```typescript
matchScore:
  z.number().min(0).max(100)
```

---

## Bug 5 — Typo in `z.array()`

I wrote:

```typescript
z.arrat(z.string())
```

The correct method is:

```typescript
z.array(z.string())
```

---

## Bug 6 — Incorrect `ChatPromptTemplate` Variables

I wrote:

```typescript
["system", `
  You are an expert...
  resume ${resume}
  jobDescription ${jobDescription}
`]
```

There are two problems.

### Problem 1 — Wrong placeholder syntax

JavaScript template literals use:

```typescript
${variable}
```

LangChain prompt templates use:

```text
{variable}
```

Therefore:

```text
{resume}
{jobDescription}
```

should be used.

### Problem 2 — Variables are not available at template creation time

The template is defined outside the function, but:

```typescript
resume
jobDescription
```

are function parameters.

Therefore, they are not available when the template is created.

The better implementation is:

```typescript
const resumeParseTemplate =
  ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are an expert at extracting matchScore, matchingSkills, missingSkills, and recommendations by comparing a resume against a job description."
    ],

    [
      "human",
      "Resume:\n{resume}\n\nJob Description:\n{jobDescription}"
    ],
  ]);
```

The system message contains the instruction.

The human message contains the actual data.

---

## Bug 7 — Missing Return

The function generated the result:

```typescript
const response =
  await structuredModel.invoke(message);
```

but never returned it.

The caller therefore cannot access the result.

It should return:

```typescript
return response;
```

---

## Bug 8 — Incorrect Use of `async function*`

I used:

```typescript
export async function* ResumeParseData(...)
```

An `async function*` is an async generator and is normally used when values are yielded over time.

But structured output is being obtained using:

```typescript
.invoke()
```

which is non-streaming.

Therefore, a normal async function is more appropriate:

```typescript
export async function getResumeParseData(
  resume: string,
  jobDescription: string
) {
  const messages =
    await resumeParseTemplate.formatMessages({
      resume,
      jobDescription,
    });

  const response =
    await structuredModel.invoke(messages);

  return response;
}
```

---

# Corrected Complete Version

```typescript
import { z } from "zod";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { env } from "../config/env.js";

const ResumeParseSchema = z.object({
  matchScore: z.number().min(0).max(100),

  matchingSkills:
    z.array(z.string()),

  missingSkills:
    z.array(z.string()),

  recommendation:
    z.array(z.string()),
});

const model = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0.3,
});

const structuredModel =
  model.withStructuredOutput(
    ResumeParseSchema
  );

const resumeParseTemplate =
  ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are an expert at extracting matchScore, matchingSkills, missingSkills, and recommendations by comparing a resume against a job description.",
    ],

    [
      "human",
      "Resume:\n{resume}\n\nJob Description:\n{jobDescription}",
    ],
  ]);

export async function getResumeParseData(
  resume: string,
  jobDescription: string
) {
  const messages =
    await resumeParseTemplate.formatMessages({
      resume,
      jobDescription,
    });

  const response =
    await structuredModel.invoke(
      messages
    );

  return response;
}
```

---

# Review of My Answers

## Question 1 — Structured Output Guarantee

My original answer was:

> "`withStructuredOutput()` guarantees that the model will never provide an incorrect response."

This is **too strong and incorrect**.

The better explanation is:

When the provider supports constrained structured generation, `withStructuredOutput()` can provide stronger structural guarantees during generation.

The important difference is:

```text
Manual approach
    ↓
Generate output
    ↓
Validate afterward
    ↓
Detection
```

versus:

```text
Supported structured generation
    ↓
Constrain generation to the expected structure
    ↓
Prevention of many structural errors
```

But this does **not** mean:

```text
"The request can never fail."
```

Network errors, rate limits, provider errors, unsupported configurations, and other failures are still possible.

---

## Question 2 — Structured Output + Streaming

My answer was correct.

Streaming a JSON object can produce incomplete intermediate states.

For example:

```text
{
```

then:

```text
{"matchScore":
```

then:

```text
{"matchScore": 85,
```

The frontend cannot safely parse every partial chunk as a complete JSON object.

Therefore, `.invoke()` is usually simpler for structured-output extraction.

---

## Question 3 — Why Try/Catch?

My answer was correct.

Structured-output support does not mean that the entire model request can never fail.

Therefore:

```typescript
try {
  const result =
    await structuredModel.invoke(...);
} catch (error) {
  // Handle failure
}
```

is still necessary.

---

## Question 4 — Complex Schema

My answer was correct.

A very complex schema can make reliable generation more difficult.

For example:

```text
Many nested objects
+
Many fields
+
Strict enums
+
Complex constraints
```

can make the output harder for the model to satisfy consistently.

Therefore, keep schemas as simple as possible while still meeting application requirements.

---

## Question 5 — Why Learn `StructuredOutputParser`?

My original reasoning was incorrect.

I initially thought:

> If the schema is too difficult, use `StructuredOutputParser`.

That is **not correct**.

Both approaches can face limitations with complex schemas.

The actual reasons to understand `StructuredOutputParser` are:

1. Older tutorials use it.
2. Existing codebases may use it.
3. It gives more direct control over format instructions.
4. It can be useful in provider/integration edge cases where the modern structured-output mechanism is unavailable.

It is **not simply a backup mechanism for complex schemas**.

---

# Lesson 1.6 — Runnables / LCEL

## 1. Simple Explanation

Until now, we repeatedly used a pattern like:

```typescript
const messages =
  await template.formatMessages({
    ...
  });

const response =
  await model.invoke(messages);
```

These are multiple steps:

```text
Template
   ↓
Model
```

In production, a workflow can become much larger:

```text
Input
 ↓
Prompt
 ↓
Model
 ↓
Parser
 ↓
Validation
 ↓
Database
```

Writing all of these connections manually can become verbose.

### LCEL

**LCEL stands for LangChain Expression Language.**

It provides a composable way to connect LangChain components into pipelines.

The core idea is similar to the Unix pipe operator:

```text
command1 | command2 | command3
```

In LangChain:

```typescript
prompt.pipe(model).pipe(parser)
```

---

# 2. Real-World Analogy

Think about an Express middleware chain:

```typescript
app.post(
  "/exam",
  authMiddleware,
  validateMiddleware,
  rateLimitMiddleware,
  examController
);
```

Each middleware performs a specific task and passes the request to the next stage.

Conceptually:

```text
Request
  ↓
Authentication
  ↓
Validation
  ↓
Rate Limit
  ↓
Controller
```

LCEL follows a similar pipeline idea:

```text
Input
  ↓
Prompt
  ↓
Model
  ↓
Parser
  ↓
Output
```

---

# 3. Technical Breakdown

## A. Runnable — The Common Interface

LangChain components such as:

* `ChatPromptTemplate`
* Chat models
* Output parsers

implement the Runnable interface.

This gives them common methods.

### `.invoke()`

```typescript
await runnable.invoke(input);
```

Process one input and return one result.

### `.stream()`

```typescript
await runnable.stream(input);
```

Process the input and return streaming output.

### `.batch()`

```typescript
await runnable.batch([
  input1,
  input2,
  input3,
]);
```

Process multiple inputs.

### `.pipe()`

```typescript
runnable.pipe(nextRunnable);
```

Connect one Runnable to another.

This common interface is one of the main reasons LCEL works so well.

---

# B. RunnableSequence

The old approach:

```typescript
const messages =
  await template.formatMessages({
    resume,
    jobDescription,
  });

const response =
  await structuredModel.invoke(
    messages
  );
```

The LCEL approach:

```typescript
const chain =
  resumeParseTemplate.pipe(
    structuredModel
  );

const response =
  await chain.invoke({
    resume,
    jobDescription,
  });
```

What happens?

```text
chain.invoke(...)
       ↓
resumeParseTemplate
       ↓
BaseMessage[]
       ↓
structuredModel
       ↓
structured response
```

`.pipe()` creates a new Runnable that connects the output of one component to the input of the next.

This removes manual intermediate wiring.

---

## Multiple Steps

You can build longer pipelines:

```typescript
const chain =
  promptTemplate
    .pipe(model)
    .pipe(outputParser);
```

Then:

```typescript
const result =
  await chain.invoke({
    userInput: "...",
  });
```

Conceptually:

```text
userInput
   ↓
Prompt Template
   ↓
Model
   ↓
Output Parser
   ↓
Final Result
```

---

# C. RunnableParallel

Sometimes you have independent tasks that do not depend on one another.

For example, from a resume you might want:

```text
1. Extract candidate skills
2. Generate an experience summary
```

These tasks can potentially run at the same time.

```typescript
import {
  RunnableParallel,
} from "@langchain/core/runnables";

const parallelChain =
  RunnableParallel.from({
    skills:
      skillsExtractionChain,

    summary:
      summaryGenerationChain,
  });

const result =
  await parallelChain.invoke({
    resumeText: "...",
  });
```

The result could look like:

```typescript
{
  skills: [...],
  summary: "..."
}
```

### Why is this useful?

Sequential execution:

```text
Chain 1
  ↓
Chain 2

Total time ≈ time1 + time2
```

Parallel execution:

```text
Chain 1 ──┐
          ├──→ Result
Chain 2 ──┘

Total time ≈ max(time1, time2)
```

When the tasks are independent, parallel execution can significantly reduce latency.

---

# D. RunnableLambda

Sometimes you have a normal JavaScript/TypeScript function that you want to place inside an LCEL pipeline.

For example:

```typescript
import {
  RunnableLambda,
} from "@langchain/core/runnables";

const uppercaseTransform =
  RunnableLambda.from(
    (input: string) =>
      input.toUpperCase()
  );
```

Now it can be used in a chain:

```typescript
const chain =
  promptTemplate
    .pipe(model)
    .pipe(uppercaseTransform);
```

`RunnableLambda` wraps custom logic so it can participate in the Runnable pipeline.

---

# E. RunnablePassthrough

Sometimes you want to process an input while also keeping the original input.

For example:

```typescript
import {
  RunnableParallel,
  RunnablePassthrough,
} from "@langchain/core/runnables";

const chain =
  RunnableParallel.from({
    original:
      new RunnablePassthrough(),

    analysis:
      analysisChain,
  });
```

Then:

```typescript
const result =
  await chain.invoke({
    resumeText: "...",
  });
```

Conceptually:

```text
                 ┌──→ original input
Input ───────────┤
                 └──→ analysis chain
```

Result:

```typescript
{
  original: {
    resumeText: "..."
  },

  analysis: {
    ...
  }
}
```

`RunnablePassthrough` simply passes the input forward without modifying it.

---

# F. Streaming Through a Chain

Another useful feature is that streaming can work through the chain.

```typescript
const chain =
  promptTemplate.pipe(model);

const stream =
  await chain.stream({
    userInput: "...",
  });

for await (const chunk of stream) {
  console.log(chunk.content);
}
```

You do not have to manually stream the model separately from the prompt.

LCEL handles the pipeline.

This is especially useful for chat applications:

```text
User input
    ↓
Prompt
    ↓
LLM
    ↓
Stream
    ↓
Frontend
```

---

# G. Why LCEL Exists

LCEL provides several benefits.

### Less Boilerplate

You don't have to manually pass the result of every step into the next step.

### Consistency

The same methods are available across Runnable components:

```text
.invoke()
.stream()
.batch()
```

### Composability

A chain is itself a Runnable.

Therefore:

```text
Chain A
   ↓
Chain B
   ↓
Chain C
```

can be composed into larger workflows.

### Parallel Execution

`RunnableParallel` makes concurrent execution easier.

---

# 4. Real Application Usage

Our previous `getResumeParseData()` implementation was:

```typescript
export async function getResumeParseData(
  resume: string,
  jobDescription: string
) {
  const messages =
    await resumeParseTemplate.formatMessages({
      resume,
      jobDescription,
    });

  const response =
    await structuredModel.invoke(
      messages
    );

  return response;
}
```

Using LCEL:

```typescript
const resumeParseChain =
  resumeParseTemplate.pipe(
    structuredModel
  );

export async function getResumeParseData(
  resume: string,
  jobDescription: string
) {
  return await resumeParseChain.invoke({
    resume,
    jobDescription,
  });
}
```

This is cleaner because the prompt-to-model relationship is defined once.

The service only needs to provide the input.

---

# 5. Common Mistakes

## Mistake 1 — Wrong `.pipe()` Order

The order matters.

Correct:

```typescript
promptTemplate
  .pipe(model)
  .pipe(outputParser);
```

The prompt produces the model input.

The model produces the parser input.

Incorrect ordering can cause incompatible input/output types or unexpected behavior.

---

## Mistake 2 — Not Using Parallel Execution

If two tasks are completely independent:

```text
Task A
Task B
```

and you execute them sequentially, you may waste latency.

Consider:

```typescript
RunnableParallel
```

when the tasks do not depend on each other.

---

## Mistake 3 — Making Every Tiny Task a Chain

If you only have:

```typescript
await model.invoke("Hello");
```

there is usually no reason to create a complicated chain.

Do not introduce abstraction simply because LCEL exists.

Use it when it improves composition, readability, reuse, or workflow management.

---

## Mistake 4 — Forgetting Error Handling

If one step fails:

```text
Prompt
  ↓
Model ❌
  ↓
Parser
```

the complete chain can fail.

Production applications should handle failures appropriately.

---

# 6. Production Considerations

## Debugging

As chains become larger, it can become difficult to determine which step failed.

For example:

```text
Prompt
 ↓
Retriever
 ↓
Model
 ↓
Parser
 ↓
Tool
 ↓
Database
```

If something fails, identifying the exact step can become difficult.

Tracing tools such as **LangSmith** can help with this later in the course.

---

## Parallel vs Sequential

Parallel execution is not always correct.

Use parallel execution when:

```text
Task B does NOT depend on Task A
```

For example:

```text
Extract skills ──────┐
                     ├──→ Final result
Generate summary ────┘
```

But if:

```text
Task A
  ↓
Task B requires Task A's output
```

then they must remain sequential.

---

## Reusability

For production projects, chains can be organized separately.

For example:

```text
src/
└── ai/
    └── chains/
        ├── resumeParse.chain.ts
        ├── jobMatch.chain.ts
        └── chatbot.chain.ts
```

Named and exported chains can then be reused across different services and routes.

---

# Small Exercise

## Exercise 1

Take:

```typescript
resumeParseTemplate
```

and:

```typescript
structuredModel
```

and combine them using `.pipe()`.

Then create:

```typescript
getResumeParseData()
```

using the chain.

---

## Exercise 2

Imagine HireHub needs two independent resume operations:

```text
A. Extract candidate name + email

B. Perform detailed skill analysis
```

Create the conceptual structure using:

```typescript
RunnableParallel
```

You can write pseudocode instead of complete implementation.

---

# Test Your Understanding — 5 Questions

### Question 1

What is the main benefit of the Runnable interface?

How would combining LangChain components be more difficult without a common interface?

### Question 2

Why does the order matter in:

```typescript
.pipe()
```

?

Give an example where using the wrong order causes an incompatible input/output flow.

### Question 3

When should you use:

```typescript
RunnableParallel
```

and when should you **not** use it?

Think about dependencies between tasks.

### Question 4

If:

```typescript
prompt.pipe(model)
```

supports `.stream()`, what practical benefit does this provide for a chatbot?

### Question 5

Suppose a chain contains three steps:

```text
Step 1
  ↓
Step 2
  ↓
Step 3
```

If Step 2 fails, what happens to Step 3?

How should this be handled in a production application?

---

# My Current Implementation

Here is the current resume matching implementation using LCEL.

```typescript
import { ChatGroq } from "@langchain/groq";
import { z } from "zod";

import {
  ChatPromptTemplate,
} from "@langchain/core/prompts";

import { env } from "../config/env.js";

import {
  RunnableParallel,
} from "@langchain/core/runnables";

const resumeParseSchema = z.object({
  matchScore:
    z.number().min(0).max(100),

  matchSkills:
    z.array(z.string()),

  missingSkills:
    z.array(z.string()),

  recommendations:
    z.array(z.string()),
});

const model = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0.3,
});

const structuredModel =
  model.withStructuredOutput(
    resumeParseSchema
  );

const resumeParseTemplate =
  ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are an expert at extracting matchScore, matchingSkills, missingSkills, and recommendations by comparing a resume against a job description.",
    ],

    [
      "human",
      "Resume:\n{resume}\n\nJob Description:\n{jobDescription}",
    ],
  ]);

export async function getResumeParseData(
  resume: string,
  jobDescription: string
) {
  const chain =
    resumeParseTemplate.pipe(
      structuredModel
    );

  const response =
    await chain.invoke({
      resume,
      jobDescription,
    });

  return response;
}
```

> **Note:** `RunnableParallel` is imported above because it will be useful when implementing multiple independent resume-analysis chains. It is not required for the single resume-matching chain shown here.

---

# Current Learning Summary

At this point, the major concepts covered in Phase 1 are:

```text
LangChain.js
    ↓
Models
    ↓
Messages
    ↓
Prompt Templates
    ↓
ChatPromptTemplate
    ↓
MessagesPlaceholder
    ↓
Structured Output
    ↓
withStructuredOutput()
    ↓
Output Parsers
    ↓
Runnables
    ↓
LCEL
    ↓
RunnableSequence
    ↓
RunnableParallel
    ↓
RunnableLambda
    ↓
RunnablePassthrough
```

The progression is important:

```text
Raw LLM SDK
     ↓
LangChain Model
     ↓
Messages
     ↓
Reusable Prompts
     ↓
Structured Output
     ↓
Composable Runnables
     ↓
Production AI Pipelines
```

This gives the foundation required for the next LangChain topics such as more advanced chains, retrieval, RAG, tools, agents, memory, and production observability.

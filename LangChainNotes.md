# Phase 1 — LangChain.js Fundamentals

> Phase 0 mein humne raw Groq SDK ke saath chatbot banaya tha.  
> Phase 1 mein hum same concepts ko LangChain.js ke unified abstractions ke through use karenge.

---

## Lesson 1.1 — What Is LangChain?

### 1. Simple Explanation (Hinglish)

Project 0 mein tumne manually ye kaam kiya tha:

- Groq client initialize kiya.
- System, history, aur user message ka array banaya.
- Streaming loop likha.
- Groq ke provider-specific chunks se text nikala:

```typescript
chunk.choices?.delta?.content ?? "";
```

Agar kal Groq se OpenAI, Gemini, Anthropic, ya kisi local model par switch karna ho, raw SDK approach mein imports, configuration, aur response handling change ho sakti hai.

**LangChain.js** ek abstraction layer hai jo different LLM providers ke liye common interface deta hai.

Example:

```typescript
await model.invoke("Hello");
await model.stream("Hello");
```

Ye pattern Groq, OpenAI, Anthropic, aur other supported providers ke saath mostly same rehta hai.

---

### 2. Real-World Analogy

LangChain ko Prisma jaisa samjho.

Prisma database ke differences ko abstract karta hai:

```text
PostgreSQL → MySQL → SQLite
```

LangChain LLM provider differences ko abstract karta hai:

```text
Groq → OpenAI → Anthropic → Gemini
```

LangChain sirf provider abstraction nahi hai. Ye prompts, messages, tools, chains, retrievers, RAG, aur agents ke liye bhi reusable building blocks deta hai.

---

### 3. Why LangChain Exists

LangChain helps with:

- **Provider abstraction** — common API pattern across providers.
- **Messages** — `SystemMessage`, `HumanMessage`, `AIMessage`.
- **Prompt templates** — reusable prompts with dynamic variables.
- **Streaming** — common `.stream()` interface.
- **Structured output** — easier parsing and validation patterns.
- **Runnables / LCEL** — components ko chain karna.
- **Tools and agents** — function calling workflows.
- **RAG integrations** — loaders, vector stores, retrievers.

---

### 4. When Not to Use LangChain

LangChain har project ke liye mandatory nahi hai.

Raw SDK better ho sakta hai when:

- Sirf ek simple LLM call chahiye.
- Provider ka unique feature use karna hai jo LangChain expose nahi karta.
- Lightweight dependency chahiye.
- Extremely low-latency or minimal serverless function bana rahe ho.
- Debugging ko maximum direct rakhna hai.

```text
Simple one-call chatbot → Raw SDK can be enough

RAG + tools + prompts + multi-step workflow → LangChain is useful
```

---

### 5. Direct SDK vs LangChain

| Aspect | Direct SDK | LangChain.js |
|---|---|---|
| Provider change | Provider-specific code changes | Usually import/class/config changes |
| Simple API call | Lightweight | Extra abstraction |
| Streaming | Provider response shape manually handle karna | Common `.stream()` pattern |
| Messages | Khud types/array manage karna | Built-in message classes |
| Prompt templates | Manual template literals | `PromptTemplate` and `ChatPromptTemplate` |
| RAG / tools / agents | Manually build karna | Reusable abstractions |
| Debugging | Direct provider errors | Extra abstraction layer |

> Important: LangChain provider switching ko easier banata hai, but it does **not** guarantee identical model quality, pricing, tool behavior, or provider-specific capabilities.

---

### 6. LangChain Building Blocks

```text
Chat Models      → ChatGroq, ChatOpenAI, ChatAnthropic
Messages         → SystemMessage, HumanMessage, AIMessage, ToolMessage
Prompt Templates → Dynamic and reusable prompts
Runnables / LCEL → Components ko connect karna
Output Parsers   → Structured responses parse karna
Retrievers       → Relevant documents retrieve karna
Tools / Agents   → Actions and multi-step workflows
```

---

### 7. Common Mistakes

- Har simple task ke liye LangChain force karna.
- LangChain ko magic samajhna without understanding raw LLM concepts.
- Old tutorials copy karna without checking installed version.
- Provider switching ko completely risk-free samajhna.
- Raw SDK use karne se unnecessarily avoid karna.

---

### 8. Production Notes

- LangChain version pin karo.
- Prompt, model, and provider configuration centralize karo.
- Provider fallback use karne se pehle output-quality testing karo.
- Critical provider-specific features ke liye raw SDK escape hatch rakhna useful ho sakta hai.
- Serverless apps mein dependency size aur cold start evaluate karo.

---

## Lesson 1.2 — Models

### 1. Simple Explanation (Hinglish)

Project 0 mein Groq-specific client use hua tha:

```typescript
const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
});
```

LangChain mein provider ke liye chat-model class use hoti hai:

```typescript
const model = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0.7,
});
```

Model ko call karne ka common pattern:

```typescript
await model.invoke(...);
await model.stream(...);
```

---

### 2. Installation

```bash
npm install @langchain/core @langchain/groq
```

Optional, if OpenAI is needed later:

```bash
npm install @langchain/openai
```

| Package | Purpose |
|---|---|
| `@langchain/core` | Messages, prompts, runnables, core abstractions |
| `@langchain/groq` | Groq integration |
| `@langchain/openai` | OpenAI integration |

---

### 3. Basic Initialization

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

---

### 4. Non-Streaming: `.invoke()`

```typescript
const response = await model.invoke(
  "Explain JavaScript closures in 2 lines."
);

console.log(response.content);
```

`response` is an `AIMessage`, not a plain string.

```typescript
console.log(response.content);
```

Use `.content` to access the generated text.

---

### 5. Streaming: `.stream()`

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

Raw Groq SDK:

```typescript
chunk.choices?.delta?.content ?? "";
```

LangChain:

```typescript
chunk.content;
```

LangChain normalizes provider response formats into message chunks.

---

### 6. Switching Provider

Example with OpenAI:

```typescript
import { ChatOpenAI } from "@langchain/openai";
import { env } from "../config/env.js";

const model = new ChatOpenAI({
  apiKey: env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0.7,
});
```

The calling pattern stays similar:

```typescript
await model.invoke("Hello");
await model.stream("Hello");
```

---

### 7. Model Fallbacks

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

Fallback helps if the primary model call fails.

It does **not** fix:

- Bad prompts.
- Wrong application logic.
- Low-quality model output.
- Unsafe tool behavior.

---

### 8. Common Mistakes

- Treating `response` as a string instead of using `response.content`.
- Assuming every stream chunk contains text.
- Forgetting `@langchain/core`.
- Using fallback without testing quality differences.
- Assuming all providers support every feature identically.

---

## Lesson 1.3 — Messages Deep Dive

### 1. Simple Explanation (Hinglish)

LangChain messages are not just text containers.

A message can include:

- `content` — actual text.
- `id` — message identifier.
- `usage_metadata` — input/output token usage.
- `response_metadata` — provider-specific details.
- `tool_calls` — tool-call requests from the model.

---

### 2. Message Types

```typescript
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  ToolMessage,
} from "@langchain/core/messages";
```

| Message | Use |
|---|---|
| `SystemMessage` | Developer instructions and rules |
| `HumanMessage` | User input |
| `AIMessage` | Model response |
| `ToolMessage` | Tool execution result |

Example:

```typescript
const messages = [
  new SystemMessage("You are a helpful teacher."),
  new HumanMessage("Explain closures."),
  new AIMessage("A closure remembers variables from its outer scope."),
];
```

---

### 3. Response Metadata

```typescript
const response = await model.invoke(
  "Explain closures."
);

console.log(response.content);
console.log(response.id);
console.log(response.usage_metadata);
console.log(response.response_metadata);
```

`content` contains the text of **one response message**, not the whole conversation.

Token usage can look like:

```typescript
{
  input_tokens: 45,
  output_tokens: 120,
  total_tokens: 165
}
```

Use token metadata for cost tracking and monitoring.

---

### 4. Serialize Messages for Database

Do not store LangChain class instances directly as your database format.

Use a plain object:

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

```typescript
const serializedHistory = history.map(
  serializeMessage
);
```

Example saved data:

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

> LangChain uses `"human"` internally, not `"user"`.

---

### 5. Deserialize Messages

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

If you save `"user"` but your deserializer expects `"human"`, this runtime error occurs:

```text
Unknown message role: user
```

---

### 6. ToolMessage Preview

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

`tool_call_id` connects a tool result to its exact tool call.

This becomes critical when the model requests multiple tools at once.

---

### 7. Production Notes

- Log `usage_metadata` for cost tracking.
- Store `sessionId` or `conversationId` with every persisted message.
- Validate stored roles during deserialization.
- Set message-size limits.
- Keep the system message first.
- Use one shared helper to build messages consistently.

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

## Lesson 1.4 — Prompt Templates

### 1. Simple Explanation (Hinglish)

Hardcoded prompt:

```typescript
const prompt =
  "You are a great teacher.";
```

Dynamic raw template literal:

```typescript
const prompt = `
Analyze this resume for ${jobRole}.
Candidate: ${candidateName}.
`;
```

This works for small cases, but production prompts become difficult to reuse and manage.

LangChain prompt templates let you define placeholders once and fill values later.

---

### 2. `PromptTemplate`

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

If a required variable is missing, formatting fails instead of silently inserting `undefined`.

---

### 3. `ChatPromptTemplate`

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

---

### 4. `MessagesPlaceholder`

Use `MessagesPlaceholder` to insert chat history dynamically.

```typescript
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

const chatPrompt = ChatPromptTemplate.fromMessages([
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

```typescript
const messages = await chatPrompt.formatMessages({
  history,
  userMessage: "Explain JavaScript closures.",
});
```

It creates this order:

```text
System message
↓
Previous history
↓
New user message
```

This replaces manual code like:

```typescript
[
  new SystemMessage(SYSTEM_PROMPT),
  ...history,
  new HumanMessage(userMessage),
];
```

---

### 5. Few-Shot Template Example

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

---

### 6. Production Prompt Structure

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

---

### 7. Common Mistakes

- Template variable mismatch.

```typescript
// Template:
"{jobRole}"

// Wrong:
.format({ role: "Developer" })

// Correct:
.format({ jobRole: "Developer" })
```

- `MessagesPlaceholder("history")` use karke `formatMessages({ messages: [...] })` pass karna.
- Prompts ko controller/service files mein everywhere hardcode karna.
- User input ko trusted instruction samajhna.
- Prompt injection protection ignore karna.

---

# Complete Chatbot Using LangChain

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

  sessionHistories.set(sessionId, newHistory);

  return newHistory;
}

export function saveSessionMessages(
  sessionId: string,
  messages: BaseMessage[]
): void {
  const history = getSessionHistory(sessionId);

  history.push(...messages);

  if (history.length > MAX_HISTORY_MESSAGES) {
    history.splice(
      0,
      history.length - MAX_HISTORY_MESSAGES
    );
  }
}
```

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

  const stream = await model.stream(messages);

  for await (const chunk of stream) {
    const content = String(chunk.content);

    if (content) {
      yield content;
    }
  }
}
```

> Important correction: `userMessage` is already a string. Do **not** create `new HumanMessage(userMessage)` twice.

---

## `src/controller/chatControllerLangChain.ts`

```typescript
import {
  AIMessage,
  HumanMessage,
} from "@langchain/core/messages";
import type { Request, Response } from "express";
import { streamChatResponse } from "../services/chatServiceLangChain.js";
import {
  getSessionHistory,
  saveSessionMessages,
} from "../store/sessionStoreLangChain.js";

function sendSseEvent(
  res: Response,
  data: unknown
): void {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export async function createStreams(
  req: Request,
  res: Response
): Promise<void> {
  const { sessionId, message } = req.body;

  if (
    typeof message !== "string" ||
    message.trim().length === 0
  ) {
    res.status(400).json({
      error: "Message is required and must be a non-empty string",
    });

    return;
  }

  if (
    typeof sessionId !== "string" ||
    sessionId.trim().length === 0
  ) {
    res.status(400).json({
      error: "sessionId is required and must be a non-empty string",
    });

    return;
  }

  const history = getSessionHistory(sessionId);

  res.setHeader(
    "Content-Type",
    "text/event-stream"
  );
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

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

    saveSessionMessages(sessionId, [
      new HumanMessage(message.trim()),
      new AIMessage(assistantResponse),
    ]);

    sendSseEvent(res, {
      done: true,
    });

    res.end();
  } catch (error) {
    console.error("LangChain streaming error:", error);

    sendSseEvent(res, {
      error: "Something went wrong while generating the response",
    });

    res.end();
  }
}
```

---

## `src/routes/chatRoutes.ts`

```typescript
import { Router } from "express";
import { createStreams } from "../controller/chatControllerLangChain.js";

const router = Router();

router.post("/chat-lang", createStreams);

export default router;
```

---

## `src/app.ts`

```typescript
import express from "express";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

app.use(express.json());

app.use("/api", chatRoutes);

export default app;
```

---

## `src/server.ts`

```typescript
import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.PORT, () => {
  console.log(
    `Server running on http://localhost:${env.PORT}`
  );
});
```

---

## Final Request Flow

```text
POST /api/chat-lang
        ↓
chatRoutes.ts
        ↓
chatControllerLangChain.ts
        ↓
Get BaseMessage[] history for session
        ↓
ChatPromptTemplate formats:
system + history + user message
        ↓
ChatGroq.stream(messages)
        ↓
SSE chunks sent to frontend
        ↓
HumanMessage + AIMessage saved in history
```

## Key Project 0 vs LangChain Change

```text
Project 0:
Manual message array
Manual Groq chunk extraction
Custom ChatMessage type

LangChain:
ChatPromptTemplate
SystemMessage / HumanMessage / AIMessage
chunk.content
ChatGroq unified model interface
```
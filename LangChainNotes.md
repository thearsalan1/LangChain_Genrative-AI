LangChain.js Learning Notes --- Phase 1 & Phase 2
> **Goal:** Learn LangChain.js from fundamentals to production-oriented
> AI application development.
Navigation
Phase 1 --- LangChain.js
Fundamentals
Lesson 1.1 --- What Is
LangChain?
Lesson 1.2 --- Models
Lesson 1.3 --- Messages Deep
Dive
Lesson 1.4 --- Prompt Templates
Complete Chatbot Using
LangChain
Lesson 1.5 --- Output Parsers
Lesson 1.6 --- Runnables / LCEL
Project 1 --- AI Job Description
Generator
Architecture
Installation
Environment Configuration
Prompt Layer
Schema Layer
Chain Layer
Service Layer
Controller Layer
Route Layer
Logger
Express Application
Server Entry Point
Complete Request Flow
Why This Is a Sequential
Workflow
Why SSE Is Used
What This Project Teaches
Production Notes
Phase 2 --- Chains & Workflows
Lesson 2.1 --- Sequential, Parallel, Conditional
Workflows
Chain vs Agent
Phase 2 Learning Summary
---
Phase 1 --- LangChain.js Fundamentals
> **Goal:** Learn LangChain.js from the fundamentals to
> production-oriented usage.
In Phase 0, we built a chatbot using the raw Groq SDK.
In Phase 1, we will use the same concepts through LangChain.js's
unified abstractions.
---
Lesson 1.1 --- What Is LangChain?
1. Simple Explanation
In Project 0, we manually handled several things:
Initialized the Groq client.
Created arrays containing system instructions, conversation history,
and user messages.
Wrote the streaming loop ourselves.
Extracted text from provider-specific Groq chunks:
``` typescript
chunk.choices?.delta?.content ?? "";
```
The problem becomes more obvious when we want to switch providers.
For example, if we move from:
``` text
Groq
```
to:
``` text
OpenAI
Gemini
Anthropic
Local Models
```
the raw SDK approach may require changes to imports, configuration,
request formats, and response handling.
LangChain.js
LangChain.js is an abstraction layer that provides common interfaces
for working with different LLM providers and AI application
components.
For example:
``` typescript
await model.invoke("Hello");

await model.stream("Hello");
```
The calling pattern is largely consistent even when the underlying
provider changes.
This does not mean that every provider behaves identically. Provider
capabilities, model quality, pricing, tool support, and response
behavior can still differ.
---
2. Real-World Analogy
Think of LangChain like Prisma.
Prisma abstracts differences between databases:
``` text
PostgreSQL → MySQL → SQLite
```
Similarly, LangChain abstracts many differences between LLM providers:
``` text
Groq → OpenAI → Anthropic → Gemini
```
However, LangChain is much more than a provider abstraction.
It also provides reusable building blocks for:
Prompts
Messages
Models
Runnables
Chains
Output parsing
Tools
Agents
Retrievers
RAG
Multi-step AI workflows
---
3. Why LangChain Exists
LangChain provides abstractions for:
Provider Abstraction
A common programming pattern across different model providers.
Messages
Built-in message types such as:
``` typescript
SystemMessage
HumanMessage
AIMessage
ToolMessage
```
Prompt Templates
Reusable prompts containing dynamic variables.
Streaming
A common:
``` typescript
.stream()
```
interface.
Structured Output
Better patterns for obtaining validated structured data from models.
Runnables / LCEL
A way to connect AI components into pipelines.
Tools and Agents
Building function-calling and multi-step workflows.
RAG
Integrations for:
Document loaders
Vector stores
Retrievers
Retrieval pipelines
---
4. When Not to Use LangChain
LangChain is not mandatory for every AI project.
A raw provider SDK can be better when:
You only need one simple LLM call.
You need a provider-specific feature that LangChain does not expose
properly.
You want minimal dependencies.
You are building an extremely latency-sensitive serverless function.
You want debugging to stay as direct as possible.
A simple rule:
``` text
Simple one-call chatbot
        ↓
Raw SDK can be enough

RAG + tools + prompts + multi-step workflow
        ↓
LangChain becomes much more useful
```
---
5. Direct SDK vs LangChain
---
Aspect      Direct SDK                   LangChain.js
---
Provider    Provider-specific code       Usually import/class/config
change      changes                      changes
Simple API  Lightweight                  Additional abstraction
call
Streaming   Provider response format     Common `.stream()` pattern
handled manually
Messages    Manually manage arrays/types Built-in message classes
Prompt      Manual template literals     `PromptTemplate` /
templates                                `ChatPromptTemplate`
RAG         Manually build integrations  Reusable abstractions
Tools       Manually implement workflows Tool abstractions
Agents      Manually implement           Agent abstractions
Debugging   More direct                  Additional abstraction layer
> **Important:** LangChain makes provider switching easier, but it does
> **not** guarantee identical model quality, pricing, tool behavior,
> latency, or provider-specific capabilities.
---
6. LangChain Building Blocks
A simplified picture of the LangChain ecosystem:
``` text
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
7. Common Mistakes
Avoid these mistakes:
Using LangChain for every simple task.
Treating LangChain as magic without understanding raw LLM concepts.
Copying old tutorials without checking the installed LangChain
version.
Assuming provider switching is completely risk-free.
Avoiding raw SDKs unnecessarily.
Assuming every LangChain provider integration supports exactly the
same features.
---
8. Production Notes
For production applications:
Pin your LangChain versions.
Centralize model and provider configuration.
Keep prompts organized instead of scattering them throughout
controllers.
Test model output quality before implementing provider fallbacks.
Keep a raw SDK escape hatch when a provider-specific feature is
important.
Evaluate dependency size and cold-start impact in serverless
environments.
Add proper error handling around model calls.
---
Lesson 1.2 --- Models
1. Simple Explanation
In Project 0, we used the Groq-specific client:
``` typescript
const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
});
```
With LangChain, we use a chat-model class:
``` typescript
const model = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0.7,
});
```
The important idea is that the application interacts with a model
abstraction instead of directly handling the provider's low-level API.
Common methods include:
``` typescript
await model.invoke(...);

await model.stream(...);
```
---
2. Installation
Install LangChain Core and the Groq integration:
``` bash
npm install @langchain/core @langchain/groq
```
If OpenAI is needed later:
``` bash
npm install @langchain/openai
```
---
Package               Purpose
---
`@langchain/core`     Messages, prompts, runnables, and core
abstractions
`@langchain/groq`     Groq integration
`@langchain/openai`   OpenAI integration
---
3. Basic Initialization
``` typescript
import { ChatGroq } from "@langchain/groq";
import { env } from "../config/env.js";

export const model = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0.7,
  maxTokens: 300,
});
```
Important parameters
`apiKey` --- authenticates with the provider.
`model` --- selects the model.
`temperature` --- controls randomness.
`maxTokens` --- limits generated output.
---
4. Non-Streaming: `.invoke()`
Use `.invoke()` when you want the complete response.
``` typescript
const response = await model.invoke(
  "Explain JavaScript closures in 2 lines."
);

console.log(response.content);
```
The important point:
``` typescript
response
```
is an `AIMessage`, not simply a string.
Therefore:
``` typescript
console.log(response.content);
```
is used to access the generated content.
---
5. Streaming: `.stream()`
Use `.stream()` when you want the response incrementally.
``` typescript
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
Raw Groq SDK
Previously, we had to access provider-specific data:
``` typescript
chunk.choices?.delta?.content ?? "";
```
LangChain
We can use:
``` typescript
chunk.content;
```
LangChain normalizes provider response formats into its message/chunk
abstractions.
---
6. Switching Providers
For example, with OpenAI:
``` typescript
import { ChatOpenAI } from "@langchain/openai";
import { env } from "../config/env.js";

const model = new ChatOpenAI({
  apiKey: env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0.7,
});
```
The calling pattern remains similar:
``` typescript
await model.invoke("Hello");

await model.stream("Hello");
```
This is one of the main benefits of using an abstraction layer.
---
7. Model Fallbacks
A production application can have a primary and backup model.
``` typescript
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
However, fallback does not fix:
Bad prompts.
Incorrect application logic.
Poor model quality.
Unsafe tool behavior.
Incorrect business logic.
Fallback is primarily a reliability mechanism, not a quality
guarantee.
---
8. Common Mistakes
Avoid:
Treating `response` as a string instead of using `response.content`.
Assuming every stream chunk contains text.
Forgetting to install `@langchain/core`.
Using model fallbacks without testing quality differences.
Assuming every provider supports every LangChain feature
identically.
---
Lesson 1.3 --- Messages Deep Dive
1. What Are Messages?
LangChain messages are more than simple text containers.
A message can contain:
`content` --- actual message content.
`id` --- message identifier.
`usage\\\_metadata` --- token usage information.
`response\\\_metadata` --- provider-specific information.
`tool\\\_calls` --- tool calls requested by the model.
---
2. Message Types
Import the common message classes:
``` typescript
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  ToolMessage,
} from "@langchain/core/messages";
```
Message           Purpose
---
`SystemMessage`   Developer instructions and behavior rules
`HumanMessage`    User input
`AIMessage`       Model response
`ToolMessage`     Result returned from a tool
Example:
``` typescript
const messages = [
  new SystemMessage("You are a helpful teacher."),
  new HumanMessage("Explain closures."),
  new AIMessage(
    "A closure remembers variables from its outer scope."
  ),
];
```
Conceptually:
``` text
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
3. Response Metadata
Example:
``` typescript
const response = await model.invoke(
  "Explain closures."
);

console.log(response.content);
console.log(response.id);
console.log(response.usage_metadata);
console.log(response.response_metadata);
```
Remember:
``` typescript
response.content
```
contains the content of one response message, not the entire
conversation.
Token usage may look like:
``` typescript
{
  input_tokens: 45,
  output_tokens: 120,
  total_tokens: 165
}
```
Token metadata is useful for:
Cost tracking.
Monitoring.
Usage analytics.
Debugging.
---
4. Serialize Messages for a Database
Do not use LangChain class instances directly as your database storage
format.
Instead, convert them into plain objects.
``` typescript
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
``` typescript
const serializedHistory = history.map(
  serializeMessage
);
```
Example stored data:
``` json
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
> **Important:** LangChain internally uses `"human"` for the human
> message role, not `"user"`.
This matters when deserializing the messages later.
---
5. Deserialize Messages
``` typescript
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
``` json
{
  "role": "user",
  "content": "Hello"
}
```
but your deserializer expects `"human"`, you can get:
``` text
Unknown message role: user
```
Therefore, your serialization and deserialization formats must remain
consistent.
---
6. ToolMessage Preview
A tool result can be represented using `ToolMessage`:
``` typescript
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
``` typescript
tool_call_id
```
connects the tool result with the exact tool call that produced it.
This becomes especially important when the model requests multiple
tools.
---
7. Production Notes
For production applications:
Log `usage\\\_metadata` for cost tracking.
Store a `sessionId` or `conversationId` with persisted messages.
Validate stored roles during deserialization.
Set message-size limits.
Keep the system message first.
Use a shared helper for consistently constructing messages.
Example:
``` typescript
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
Lesson 1.4 --- Prompt Templates
1. Why Prompt Templates?
A hardcoded prompt is simple:
``` typescript
const prompt =
  "You are a great teacher.";
```
A dynamic prompt can be written using JavaScript template literals:
``` typescript
const prompt = `
Analyze this resume for ${jobRole}.

Candidate: ${candidateName}.
`;
```
This works, but as applications grow, prompts become difficult to:
Reuse.
Maintain.
Test.
Organize.
Modify.
LangChain provides prompt templates so that variables can be defined
once and supplied later.
---
2. `PromptTemplate`
``` typescript
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
``` text
{jobRole}
{candidateName}
{resumeText}
```
are filled when `.format()` is called.
If a required variable is missing, formatting fails instead of silently
inserting `undefined`.
---
3. `ChatPromptTemplate`
For chat applications, use `ChatPromptTemplate`.
``` typescript
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
This is useful because chat models work naturally with structured
messages.
---
4. `MessagesPlaceholder`
When building chat applications, we often need to insert previous
conversation history.
`MessagesPlaceholder` is designed for this.
``` typescript
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
``` typescript
const messages =
  await chatPrompt.formatMessages({
    history,
    userMessage: "Explain JavaScript closures.",
  });
```
The final order becomes:
``` text
System message
      ↓
Previous conversation history
      ↓
New user message
```
This replaces manually writing:
``` typescript
[
  new SystemMessage(SYSTEM_PROMPT),
  ...history,
  new HumanMessage(userMessage),
];
```
---
5. Few-Shot Templates
Few-shot prompting means giving the model examples of the desired
behavior.
Example:
``` typescript
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
``` text
Example 1
Input → Output

Example 2
Input → Output

Actual Input
   ↓
Expected behavior
```
This is useful when the required behavior is easier to demonstrate than
to describe.
---
6. Production Prompt Structure
Do not scatter large prompts across controllers and services.
A better structure is:
``` text
src/
└── ai/
    └── prompts/
        ├── chatbot.prompt.ts
        ├── resumeAnalysis.prompt.ts
        └── sentiment.prompt.ts
```
Example:
``` typescript
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
Reusable.
Testable.
Easier to modify.
Easier to review.
Separate from application/business logic.
---
7. Common Mistakes
Variable mismatch
Template:
``` text
{jobRole}
```
Wrong:
``` typescript
.format({
  role: "Developer"
});
```
Correct:
``` typescript
.format({
  jobRole: "Developer"
});
```
Other common mistakes:
Using `MessagesPlaceholder("history")` but passing the wrong
variable name.
Hardcoding prompts throughout controllers/services.
Treating user input as trusted instructions.
Ignoring prompt injection risks.
Mixing application data and system instructions unnecessarily.
---
Complete Chatbot Using LangChain
Now we combine the concepts learned so far into a complete LangChain
chatbot.
Updated Folder Structure
``` text
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
`src/ai/prompts/chatbot.prompt.ts`
``` typescript
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
``` text
System instructions
        ↓
Conversation history
        ↓
Current user message
```
---
`src/store/sessionStoreLangChain.ts`
``` typescript
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
What this store does
The `Map` stores conversation history by session ID:
``` text
sessionId
    ↓
BaseMessage[]
```
For example:
``` text
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
> This is suitable for learning and local development. For a production
> system, persistent storage such as PostgreSQL, MongoDB, Redis, or a
> dedicated LangChain/LangGraph persistence mechanism would normally be
> considered.
---
`src/services/chatServiceLangChain.ts`
``` typescript
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
Important
`userMessage` is already a string.
Do not create another:
``` typescript
new HumanMessage(userMessage)
```
inside the service just to send it to the prompt template.
The prompt template is already responsible for converting the value into
the appropriate message structure.
---
`src/controller/chatControllerLangChain.ts`
``` typescript
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
`src/routes/chatRoutes.ts`
``` typescript
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
`src/app.ts`
``` typescript
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
`src/server.ts`
``` typescript
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
Final Request Flow
The complete request travels through the application like this:
``` text
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
Key Project 0 vs LangChain Change
Project 0 --- Raw Groq SDK
``` text
Manual message array
        ↓
Manual Groq chunk extraction
        ↓
Custom ChatMessage type
        ↓
Provider-specific implementation
```
LangChain
``` text
ChatPromptTemplate
        ↓
SystemMessage / HumanMessage / AIMessage
        ↓
chunk.content
        ↓
ChatGroq unified model interface
```
The main benefit is not that LangChain makes the underlying model more
intelligent.
The benefit is that it provides reusable abstractions for building
larger AI systems.
---
Lesson 1.5 --- Output Parsers
1. Simple Explanation
In Lesson 0.4, we manually handled structured output:
``` text
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
``` typescript
withStructuredOutput()
```
This allows us to provide a schema and ask the model integration to
return structured data.
---
2. Real-World Analogy
Think of the manual approach as building your own quality checker:
``` text
JSON.parse()
      +
Zod safeParse()
      +
Retry logic
```
You build this checker yourself every time.
LangChain's structured output functionality provides a reusable
abstraction around this workflow.
You define the expected schema, and LangChain handles much of the
structured-output plumbing.
---
3. Technical Breakdown
A. `withStructuredOutput()` --- Modern Approach
This is the clean approach for supported model integrations.
``` typescript
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
What happens here?
Step 1 --- Define the schema
``` typescript
const ResumeAnalysisSchema = z.object({
  atsScore: z.number().min(0).max(100),
  missingSkills: z.array(z.string()),
  suggestions: z.array(z.string()).min(1).max(5),
});
```
This defines the structure we expect.
Step 2 --- Bind the schema
``` typescript
const structuredModel =
  model.withStructuredOutput(
    ResumeAnalysisSchema
  );
```
Now the model is configured to produce structured output according to
that schema.
Step 3 --- Invoke the model
``` typescript
const result =
  await structuredModel.invoke(...);
```
The returned result is already structured according to the configured
integration.
You don't manually need to do:
``` typescript
JSON.parse(...)
```
for the normal structured-output path.
TypeScript can also infer the resulting shape from the schema.
For example:
``` typescript
result.atsScore
```
is understood as a number.
---
Hard Guarantee vs Soft Guarantee
This distinction is important.
When the provider supports constrained decoding or equivalent native
structured-output capabilities, the integration may be able to enforce
the structure during generation.
That is stronger than simply generating arbitrary text and validating it
afterward.
Conceptually:
Manual approach
``` text
Generate anything
      ↓
Parse
      ↓
Validate
      ↓
Reject if invalid
```
Constrained structured output
``` text
Generate according to allowed structure
      ↓
Structured result
```
However:
> **Do not interpret this as "the model can never fail."**
Network failures, rate limits, provider errors, unsupported schemas,
configuration problems, and other failures can still occur.
Provider support also varies.
---
B. `StructuredOutputParser` --- Older / Manual Approach
You may encounter the older pattern in tutorials and existing codebases.
``` typescript
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
Here, the parser generates format instructions that are inserted into
the prompt.
Then you manually parse the model response.
Difference
``` text
StructuredOutputParser
        ↓
Prompt instructions
        ↓
Model
        ↓
Manual parser.parse()
```
Whereas:
``` text
withStructuredOutput()
        ↓
Model configured with schema
        ↓
Structured result
```
Production Rule
For new code, prefer:
``` typescript
withStructuredOutput()
```
when the model integration supports it appropriately.
Understand `StructuredOutputParser` because:
You will encounter it in older tutorials.
Existing projects may use it.
It can provide more direct control over format instructions.
Some provider/integration edge cases may require alternative
approaches.
It is not a special solution for complex schemas.
---
C. Validation Failure --- What Happens?
Even with structured output, production code should have error handling.
``` typescript
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
``` text
Structured output
≠
The request can never fail
```
You can still encounter:
Network errors.
Rate limits.
Provider errors.
Invalid configuration.
Unsupported capabilities.
Unexpected edge cases.
Therefore, `try/catch` remains important.
---
D. Structured Output + Streaming
Structured output and streaming can be a difficult combination.
Suppose the final output should be:
``` json
{
  "atsScore": 87,
  "missingSkills": [
    "Docker"
  ]
}
```
If we stream it token by token, the frontend may temporarily receive:
``` text
{
```
then:
``` text
{"atsScore":
```
then:
``` text
{"atsScore": 8
```
then:
``` text
{"atsScore": 87,
```
These intermediate states are incomplete JSON.
The frontend cannot reliably treat every partial chunk as a complete
object.
Therefore, for normal structured-output use cases:
``` typescript
structuredModel.invoke(...)
```
is usually simpler than:
``` typescript
structuredModel.stream(...)
```
unless you specifically need advanced progressive structured-output
handling.
---
4. Real Application Usage
This is directly useful for the HireHub resume analysis/matching
feature.
Previously, the resume parser manually performed:
``` text
Model
 ↓
JSON.parse()
 ↓
Zod validation
 ↓
Retry
```
Now we can use:
``` typescript
withStructuredOutput()
```
to simplify the implementation.
For example, a job-matching schema can contain:
``` typescript
const JobMatchSchema = z.object({
  matchScore: z.number().min(0).max(100),
  matchingSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  recommendations: z.array(z.string()),
});
```
---
5. Common Mistakes
Avoid:
Using streaming when you need a complete structured object without
handling partial output.
Assuming structured output means the request can never fail.
Removing `try/catch` because a schema is present.
Using the old `StructuredOutputParser` pattern unnecessarily when
`withStructuredOutput()` is supported.
Creating extremely complicated schemas that make model behavior less
reliable.
Assuming every provider offers exactly the same structured-output
guarantees.
---
6. Production Considerations
Provider Support
Different providers can have different levels of structured-output
support.
Some may support native/constrained structured generation while others
may rely on prompt-based techniques or other mechanisms.
Always understand the behavior of the provider you are using.
Schema Complexity
Very complex schemas can reduce reliability.
For example:
``` text
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
Graceful Degradation
If structured output repeatedly fails:
``` text
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
``` text
"Resume analysis is temporarily unavailable.
Please try again later."
```
---
Small Exercise
Build a Job Matching feature for HireHub using
`withStructuredOutput()`.
Your schema should contain:
``` text
matchScore
matchingSkills
missingSkills
recommendation
```
Requirements:
Bind the model with `withStructuredOutput()`.
Use one `.invoke()` call.
Provide the resume and job description.
Decide whether `.invoke()` or `.stream()` is more appropriate.
Explain your decision using the structured-output + streaming
trade-off.
---
Test Your Understanding --- 5 Questions
Question 1
What additional capability can `withStructuredOutput()` provide compared
with manually doing:
``` text
JSON.parse()
+
Zod safeParse()
```
?
Question 2
Why can structured output and streaming be problematic together?
Think about an incomplete JSON object being received token by token.
Question 3
Why should you still use `try/catch` with structured output?
What does structured-output support guarantee, and what does it not
guarantee?
Question 4
What problems can occur when a Zod schema becomes extremely complex?
Question 5
Why is it still useful to understand `StructuredOutputParser` even if
you prefer `withStructuredOutput()` for new code?
---
Correct Resume/Job Matching Implementation
The resume/job matching example below uses `withStructuredOutput()` and
a `ChatPromptTemplate`.
The implementation follows these steps:
``` text
Resume + Job Description
        ↓
ChatPromptTemplate
        ↓
ChatGroq
        ↓
withStructuredOutput(Zod schema)
        ↓
Structured result
```
Correct Implementation
``` typescript
import { z } from "zod";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { env } from "../config/env.js";

const ResumeParseSchema = z.object({
  matchScore: z.number().min(0).max(100),
  matchingSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  recommendation: z.array(z.string()),
});

const model = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0.3,
});

const structuredModel = model.withStructuredOutput(
  ResumeParseSchema
);

const resumeParseTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are an expert at comparing a resume against a job description and extracting matchScore, matchingSkills, missingSkills, and recommendations.",
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
  const chain = resumeParseTemplate.pipe(structuredModel);

  const response = await chain.invoke({
    resume,
    jobDescription,
  });

  return response;
}
```
Why This Implementation Is Correct
`ChatGroq` is the correct LangChain Groq model class.
`env` is imported before the API key is used.
`matchScore` is a number constrained from `0` to `100`.
`z.array()` is used for arrays of strings.
LangChain prompt variables use `{resume}` and `{jobDescription}`.
The function is a normal `async` function because it uses
`.invoke()`, not a stream.
The result is returned to the caller.
The prompt and structured model are composed with `.pipe()`, which
prepares the implementation for LCEL.
Structured Output Guarantee
`withStructuredOutput()` provides a stronger structured-output workflow
when the model integration supports the required structured generation
capabilities. It does not mean that network errors, rate limits,
provider failures, configuration problems, or every possible model
failure disappear.
Structured Output and Streaming
For an object such as:
``` json
{
  "matchScore": 87,
  "missingSkills": ["Docker"]
}
```
streaming can expose incomplete intermediate JSON such as:
``` text
{
{"matchScore":
{"matchScore": 87,
```
For ordinary structured extraction, `.invoke()` is therefore usually
easier to consume than `.stream()`.
Why Learn `StructuredOutputParser`?
`StructuredOutputParser` is useful to understand because:
Older LangChain tutorials use it.
Existing projects may use it.
It gives direct control over format instructions.
Some provider/integration situations may require an alternative
structured-output approach.
It is not simply a fallback for complex schemas.
---
Lesson 1.6 --- Runnables / LCEL
1. Simple Explanation
Until now, we repeatedly used a pattern like:
``` typescript
const messages =
  await template.formatMessages({
    ...
  });

const response =
  await model.invoke(messages);
```
These are multiple steps:
``` text
Template
   ↓
Model
```
In production, a workflow can become much larger:
``` text
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
LCEL
LCEL stands for LangChain Expression Language.
It provides a composable way to connect LangChain components into
pipelines.
The core idea is similar to the Unix pipe operator:
``` text
command1 | command2 | command3
```
In LangChain:
``` typescript
prompt.pipe(model).pipe(parser)
```
---
2. Real-World Analogy
Think about an Express middleware chain:
``` typescript
app.post(
  "/exam",
  authMiddleware,
  validateMiddleware,
  rateLimitMiddleware,
  examController
);
```
Each middleware performs a specific task and passes the request to the
next stage.
Conceptually:
``` text
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
``` text
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
3. Technical Breakdown
A. Runnable --- The Common Interface
LangChain components such as:
`ChatPromptTemplate`
Chat models
Output parsers
implement the Runnable interface.
This gives them common methods.
`.invoke()`
``` typescript
await runnable.invoke(input);
```
Process one input and return one result.
`.stream()`
``` typescript
await runnable.stream(input);
```
Process the input and return streaming output.
`.batch()`
``` typescript
await runnable.batch([
  input1,
  input2,
  input3,
]);
```
Process multiple inputs.
`.pipe()`
``` typescript
runnable.pipe(nextRunnable);
```
Connect one Runnable to another.
This common interface is one of the main reasons LCEL works so well.
---
B. RunnableSequence
The old approach:
``` typescript
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
``` typescript
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
``` text
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
`.pipe()` creates a new Runnable that connects the output of one
component to the input of the next.
This removes manual intermediate wiring.
---
Multiple Steps
You can build longer pipelines:
``` typescript
const chain =
  promptTemplate
    .pipe(model)
    .pipe(outputParser);
```
Then:
``` typescript
const result =
  await chain.invoke({
    userInput: "...",
  });
```
Conceptually:
``` text
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
C. RunnableParallel
Sometimes you have independent tasks that do not depend on one another.
For example, from a resume you might want:
``` text
1. Extract candidate skills
2. Generate an experience summary
```
These tasks can potentially run at the same time.
``` typescript
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
``` typescript
{
  skills: [...],
  summary: "..."
}
```
Why is this useful?
Sequential execution:
``` text
Chain 1
  ↓
Chain 2

Total time ≈ time1 + time2
```
Parallel execution:
``` text
Chain 1 ──┐
          ├──→ Result
Chain 2 ──┘

Total time ≈ max(time1, time2)
```
When the tasks are independent, parallel execution can significantly
reduce latency.
---
D. RunnableLambda
Sometimes you have a normal JavaScript/TypeScript function that you want
to place inside an LCEL pipeline.
For example:
``` typescript
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
``` typescript
const chain =
  promptTemplate
    .pipe(model)
    .pipe(uppercaseTransform);
```
`RunnableLambda` wraps custom logic so it can participate in the
Runnable pipeline.
---
E. RunnablePassthrough
Sometimes you want to process an input while also keeping the original
input.
For example:
``` typescript
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
``` typescript
const result =
  await chain.invoke({
    resumeText: "...",
  });
```
Conceptually:
``` text
                 ┌──→ original input
Input ───────────┤
                 └──→ analysis chain
```
Result:
``` typescript
{
  original: {
    resumeText: "..."
  },

  analysis: {
    ...
  }
}
```
`RunnablePassthrough` simply passes the input forward without modifying
it.
---
F. Streaming Through a Chain
Another useful feature is that streaming can work through the chain.
``` typescript
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
``` text
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
G. Why LCEL Exists
LCEL provides several benefits.
Less Boilerplate
You don't have to manually pass the result of every step into the next
step.
Consistency
The same methods are available across Runnable components:
``` text
.invoke()
.stream()
.batch()
```
Composability
A chain is itself a Runnable.
Therefore:
``` text
Chain A
   ↓
Chain B
   ↓
Chain C
```
can be composed into larger workflows.
Parallel Execution
`RunnableParallel` makes concurrent execution easier.
---
4. Real Application Usage
Our previous `getResumeParseData()` implementation was:
``` typescript
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
``` typescript
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
This is cleaner because the prompt-to-model relationship is defined
once.
The service only needs to provide the input.
---
5. Common Mistakes
Mistake 1 --- Wrong `.pipe()` Order
The order matters.
Correct:
``` typescript
promptTemplate
  .pipe(model)
  .pipe(outputParser);
```
The prompt produces the model input.
The model produces the parser input.
Incorrect ordering can cause incompatible input/output types or
unexpected behavior.
---
Mistake 2 --- Not Using Parallel Execution
If two tasks are completely independent:
``` text
Task A
Task B
```
and you execute them sequentially, you may waste latency.
Consider:
``` typescript
RunnableParallel
```
when the tasks do not depend on each other.
---
Mistake 3 --- Making Every Tiny Task a Chain
If you only have:
``` typescript
await model.invoke("Hello");
```
there is usually no reason to create a complicated chain.
Do not introduce abstraction simply because LCEL exists.
Use it when it improves composition, readability, reuse, or workflow
management.
---
Mistake 4 --- Forgetting Error Handling
If one step fails:
``` text
Prompt
  ↓
Model ❌
  ↓
Parser
```
the complete chain can fail.
Production applications should handle failures appropriately.
---
6. Production Considerations
Debugging
As chains become larger, it can become difficult to determine which step
failed.
For example:
``` text
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
Tracing tools such as LangSmith can help with this later in the
course.
---
Parallel vs Sequential
Parallel execution is not always correct.
Use parallel execution when:
``` text
Task B does NOT depend on Task A
```
For example:
``` text
Extract skills ──────┐
                     ├──→ Final result
Generate summary ────┘
```
But if:
``` text
Task A
  ↓
Task B requires Task A's output
```
then they must remain sequential.
---
Reusability
For production projects, chains can be organized separately.
For example:
``` text
src/
└── ai/
    └── chains/
        ├── resumeParse.chain.ts
        ├── jobMatch.chain.ts
        └── chatbot.chain.ts
```
Named and exported chains can then be reused across different services
and routes.
---
Small Exercise
Exercise 1
Take:
``` typescript
resumeParseTemplate
```
and:
``` typescript
structuredModel
```
and combine them using `.pipe()`.
Then create:
``` typescript
getResumeParseData()
```
using the chain.
---
Exercise 2
Imagine HireHub needs two independent resume operations:
``` text
A. Extract candidate name + email

B. Perform detailed skill analysis
```
Create the conceptual structure using:
``` typescript
RunnableParallel
```
You can write pseudocode instead of complete implementation.
---
Test Your Understanding --- 5 Questions
Question 1
What is the main benefit of the Runnable interface?
How would combining LangChain components be more difficult without a
common interface?
Question 2
Why does the order matter in:
``` typescript
.pipe()
```
?
Give an example where using the wrong order causes an incompatible
input/output flow.
Question 3
When should you use:
``` typescript
RunnableParallel
```
and when should you not use it?
Think about dependencies between tasks.
Question 4
If:
``` typescript
prompt.pipe(model)
```
supports `.stream()`, what practical benefit does this provide for a
chatbot?
Question 5
Suppose a chain contains three steps:
``` text
Step 1
  ↓
Step 2
  ↓
Step 3
```
If Step 2 fails, what happens to Step 3?
How should this be handled in a production application?
---
My Current Implementation
Here is the current resume matching implementation using LCEL.
``` typescript
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
> **Note:** `RunnableParallel` is imported above because it will be
> useful when implementing multiple independent resume-analysis chains.
> It is not required for the single resume-matching chain shown here.
---
Current Learning Summary
At this point, the major concepts covered in Phase 1 are:
``` text
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
``` text
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
This gives the foundation required for the next LangChain topics such as
more advanced chains, retrieval, RAG, tools, agents, memory, and
production observability.
---
Project 1 --- AI Job Description Generator
This project turns a small company input into a complete, structured job
description.
It intentionally demonstrates several LangChain concepts together:
`ChatPromptTemplate`
LCEL with `.pipe()`
Streaming with `.stream()`
Structured output with `withStructuredOutput()`
Zod schema validation
A two-stage sequential workflow
Server-Sent Events (SSE)
Express controllers and routes
Usage metadata
Clean separation between prompts, schemas, chains, services, and
controllers
Project Goal
The API receives:
``` text
roleTitle
keyRequirements
```
It then:
Generates a readable job description.
Streams that generated text to the client.
Collects the complete generated text.
Sends the complete text through a second extraction chain.
Converts the generated text into a structured `JobDescription`
object.
Sends the final structured result to the client.
Why Two Stages?
The workflow is intentionally sequential:
``` text
Company Input
     ↓
Generation Chain
     ↓
Streaming Job Description
     ↓
Complete Generated Text
     ↓
Extraction Chain
     ↓
Structured JobDescription
```
The extraction step depends on the complete generated text, so it cannot
start before generation has finished.
---
Project Architecture
Folder Structure
``` text
src/
├── ai/
│   ├── chains/
│   │   └── jobDescription.chain.ts
│   ├── prompts/
│   │   └── jobDescription.prompt.ts
│   └── schemas/
│       └── jobDescription.schema.ts
├── config/
│   └── env.ts
├── controllers/
│   └── jobDescription.controller.ts
├── routes/
│   └── router.ts
├── services/
│   └── jobDescription.service.ts
├── utils/
│   └── logger.ts
├── app.ts
└── server.ts
.env
```
Responsibility of Each Layer
---
File                               Responsibility
---
`jobDescription.prompt.ts`         Defines generation and extraction
prompts
`jobDescription.schema.ts`         Defines the expected structured
output
`jobDescription.chain.ts`          Connects prompts and models
`jobDescription.service.ts`        Orchestrates streaming and
extraction
`jobDescription.controller.ts`     Handles HTTP input and SSE output
`router.ts`                        Defines API endpoints
`env.ts`                           Validates environment variables
`logger.ts`                        Provides a small logging
abstraction
`app.ts`                           Creates and configures Express
`server.ts`                        Starts the HTTP server
---
1. Installation
Install the required packages:
``` bash
npm install express dotenv zod @langchain/core @langchain/groq
npm install -D typescript tsx @types/express @types/node
```
The important LangChain packages are:
``` text
@langchain/core
@langchain/groq
```
---
2. Environment Configuration
`.env`
``` env
GROQ_API_KEY=your_groq_api_key
PORT=3000
```
Do not print the API key to the console.
`src/config/env.ts`
``` typescript
import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required"),
  PORT: z.coerce.number().int().positive().default(3000),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Invalid environment variables:",
    parsedEnv.error.format()
  );

  process.exit(1);
}

export const env = parsedEnv.data;
```
Explanation
The environment layer:
Loads `.env`.
Defines the expected variables.
Validates them with Zod.
Converts `PORT` into a number.
Stops application startup when required configuration is invalid.
Exports one typed `env` object for the rest of the application.
---
3. Prompt Layer
`src/ai/prompts/jobDescription.prompt.ts`
The project uses two prompts because it has two different AI tasks.
Generation Prompt
``` typescript
import { ChatPromptTemplate } from "@langchain/core/prompts";

export const streamingJDPrompt =
  ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are an expert HR content writer who writes clear,
professional, and engaging job descriptions.

Use the following sections:
- Summary
- Responsibilities
- Requirements
- Nice to Have

Write naturally and avoid unnecessary repetition.`,
    ],
    [
      "human",
      `Write a job description for the role: {roleTitle}.

Key requirements provided by the company:
{keyRequirements}`,
    ],
  ]);
```
Extraction Prompt
``` typescript
export const extractionJDPrompt =
  ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are an expert at extracting structured information
from job description text.

Extract:
- title
- summary
- responsibilities
- requirements
- nice-to-have skills

Return only information that is present in the generated text.`,
    ],
    [
      "human",
      "Job Description Text:\n{generatedText}",
    ],
  ]);
```
Why Separate the Prompts?
The two prompts have different responsibilities:
``` text
Generation Prompt
    ↓
Create natural language

Extraction Prompt
    ↓
Convert natural language into structured data
```
Keeping them separate makes the application easier to test, modify, and
reuse.
---
4. Schema Layer
`src/ai/schemas/jobDescription.schema.ts`
``` typescript
import { z } from "zod";

export const JobDescriptionSchema = z.object({
  title: z.string(),
  summary: z.string(),
  responsibilities: z.array(z.string()).min(3).max(8),
  requirements: z.array(z.string()).min(3).max(8),
  niceToHave: z.array(z.string()).max(5),
});

export type JobDescription =
  z.infer<typeof JobDescriptionSchema>;
```
What the Schema Defines
``` text
JobDescription
├── title: string
├── summary: string
├── responsibilities: string[]
├── requirements: string[]
└── niceToHave: string[]
```
The schema gives the extraction model a precise target.
Why Zod?
Zod provides:
Runtime validation
TypeScript type inference
Clear field definitions
Constraints such as minimum and maximum array sizes
---
5. Chain Layer
`src/ai/chains/jobDescription.chain.ts`
``` typescript
import { ChatGroq } from "@langchain/groq";

import { env } from "../../config/env.js";

import {
  extractionJDPrompt,
  streamingJDPrompt,
} from "../prompts/jobDescription.prompt.js";

import { JobDescriptionSchema } from "../schemas/jobDescription.schema.js";

const streamingModel = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0.7,
});

const extractionModel = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0.1,
});

const structuredExtractionModel =
  extractionModel.withStructuredOutput(
    JobDescriptionSchema,
    {
      includeRaw: true,
    }
  );

export const jdStreamingChain =
  streamingJDPrompt.pipe(streamingModel);

export const jdExtractionChain =
  extractionJDPrompt.pipe(
    structuredExtractionModel
  );
```
Why Two Models?
The project uses different temperatures for different jobs.
Generation
``` typescript
temperature: 0.7
```
Natural language generation benefits from some creativity.
Extraction
``` typescript
temperature: 0.1
```
Structured extraction benefits from more deterministic behavior.
The important concept is that model configuration should match the task.
---
6. Service Layer
`src/services/jobDescription.service.ts`
``` typescript
import type { AIMessage } from "@langchain/core/messages";

import {
  jdExtractionChain,
  jdStreamingChain,
} from "../ai/chains/jobDescription.chain.js";

export type JobDescriptionStreamEvent =
  | {
      type: "chunk";
      content: string;
    }
  | {
      type: "final";
      data: unknown;
      usage: unknown;
    };

export async function* generateJobDescriptionStream(
  roleTitle: string,
  keyRequirements: string
): AsyncGenerator<JobDescriptionStreamEvent> {
  const stream = await jdStreamingChain.stream({
    roleTitle,
    keyRequirements,
  });

  let fullText = "";

  for await (const chunk of stream) {
    const content =
      typeof chunk.content === "string"
        ? chunk.content
        : "";

    if (!content) {
      continue;
    }

    fullText += content;

    yield {
      type: "chunk",
      content,
    };
  }

  const extractionResponse =
    await jdExtractionChain.invoke({
      generatedText: fullText,
    });

  const rawMessage =
    extractionResponse.raw as AIMessage;

  yield {
    type: "final",
    data: extractionResponse.parsed,
    usage: rawMessage.usage_metadata ?? null,
  };
}
```
What the Service Does
The service contains the main AI workflow.
Step 1 --- Start the streaming chain
``` typescript
const stream = await jdStreamingChain.stream({
  roleTitle,
  keyRequirements,
});
```
Step 2 --- Collect generated chunks
Each chunk is immediately yielded to the controller.
At the same time, all chunks are appended to:
``` typescript
let fullText = "";
```
Step 3 --- Wait for complete generation
Only after the stream finishes do we have the complete job description.
Step 4 --- Run extraction
``` typescript
await jdExtractionChain.invoke({
  generatedText: fullText,
});
```
Step 5 --- Return the structured result
The service emits a final event containing:
``` text
final
├── data
└── usage
```
This makes the service an excellent example of a sequential AI workflow.
---
7. Controller Layer
`src/controllers/jobDescription.controller.ts`
``` typescript
import type { Request, Response } from "express";

import {
  generateJobDescriptionStream,
} from "../services/jobDescription.service.js";

import { logger } from "../utils/logger.js";

function sendSseEvent(
  res: Response,
  data: unknown
): void {
  res.write(
    `data: ${JSON.stringify(data)}\n\n`
  );
}

export const generateJobDescription = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    roleTitle,
    keyRequirements,
  } = req.body;

  if (
    typeof roleTitle !== "string" ||
    roleTitle.trim().length === 0
  ) {
    res.status(400).json({
      success: false,
      message: "roleTitle is required",
    });

    return;
  }

  if (
    typeof keyRequirements !== "string" ||
    keyRequirements.trim().length === 0
  ) {
    res.status(400).json({
      success: false,
      message: "keyRequirements is required",
    });

    return;
  }

  logger.info(
    "Job description generation started",
    { roleTitle }
  );

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

  try {
    for await (
      const event of generateJobDescriptionStream(
        roleTitle.trim(),
        keyRequirements.trim()
      )
    ) {
      if (event.type === "chunk") {
        sendSseEvent(res, {
          type: "chunk",
          content: event.content,
        });
      }

      if (event.type === "final") {
        sendSseEvent(res, {
          type: "final",
          data: event.data,
          usage: event.usage,
        });

        logger.info(
          "Job description generation completed",
          { roleTitle }
        );
      }
    }

    res.end();
  } catch (error) {
    logger.error(
      "Job description generation failed",
      {
        roleTitle,
        error: String(error),
      }
    );

    sendSseEvent(res, {
      type: "error",
      message:
        "Something went wrong while generating the job description",
    });

    res.end();
  }
};
```
Controller Responsibilities
The controller should focus on HTTP concerns:
``` text
Request
  ↓
Validate body
  ↓
Configure SSE
  ↓
Call service
  ↓
Send events
  ↓
End response
```
The controller does not contain the AI prompt or model configuration.
That separation keeps the architecture clean.
---
8. Route Layer
`src/routes/router.ts`
``` typescript
import { Router } from "express";

import {
  generateJobDescription,
} from "../controllers/jobDescription.controller.js";

const router = Router();

router.post(
  "/job-description",
  generateJobDescription
);

export default router;
```
The endpoint is:
``` text
POST /api/job-description
```
---
9. Logger
`src/utils/logger.ts`
``` typescript
type LogLevel =
  | "info"
  | "warn"
  | "error";

function log(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>
): void {
  const timestamp =
    new Date().toISOString();

  const metaString = meta
    ? ` ${JSON.stringify(meta)}`
    : "";

  console.log(
    `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`
  );
}

export const logger = {
  info: (
    message: string,
    meta?: Record<string, unknown>
  ) => log("info", message, meta),

  warn: (
    message: string,
    meta?: Record<string, unknown>
  ) => log("warn", message, meta),

  error: (
    message: string,
    meta?: Record<string, unknown>
  ) => log("error", message, meta),
};
```
A dedicated logger gives the application one consistent place for
logging behavior.
---
10. Express Application
`src/app.ts`
``` typescript
import express from "express";

import apiRouter from "./routes/router.js";

const app = express();

app.use(express.json());

app.use("/api", apiRouter);

export default app;
```
`app.ts` creates the Express application but does not start the server.
This separation makes the application easier to test.
---
11. Server Entry Point
`src/server.ts`
``` typescript
import app from "./app.js";

import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

app.listen(env.PORT, () => {
  logger.info(
    `Server is running on http://localhost:${env.PORT}`
  );
});
```
The server entry point is responsible only for starting the HTTP server.
---
12. Complete Request Flow
``` text
POST /api/job-description
        ↓
router.ts
        ↓
jobDescription.controller.ts
        ↓
Validate roleTitle + keyRequirements
        ↓
jobDescription.service.ts
        ↓
jdStreamingChain
        ↓
streamingJDPrompt
        ↓
ChatGroq
        ↓
SSE chunk → frontend
        ↓
Collect complete generated text
        ↓
jdExtractionChain
        ↓
extractionJDPrompt
        ↓
Structured ChatGroq
        ↓
JobDescriptionSchema
        ↓
Final structured result
        ↓
SSE final event → frontend
```
---
13. Why This Is a Sequential Workflow
The workflow has a strict dependency:
``` text
Generation
    ↓
Complete text
    ↓
Extraction
```
The extraction chain cannot correctly process the generated job
description until generation is complete.
Therefore:
``` text
Step A → Step B
```
is correct.
Using parallel execution here would not provide the desired result
because Step B depends on Step A.
---
14. Why SSE Is Used
The first AI stage is streamed.
Instead of waiting for the entire job description:
``` text
Request
   ↓
Wait
   ↓
Complete response
```
the client receives:
``` text
Request
   ↓
Chunk 1
   ↓
Chunk 2
   ↓
Chunk 3
   ↓
...
   ↓
Final structured result
```
This improves perceived responsiveness for the user.
---
15. Final Event Structure
A streaming chunk looks like:
``` json
{
  "type": "chunk",
  "content": "We are looking for..."
}
```
The final event looks like:
``` json
{
  "type": "final",
  "data": {
    "title": "Backend Developer",
    "summary": "...",
    "responsibilities": [],
    "requirements": [],
    "niceToHave": []
  },
  "usage": {}
}
```
An error event looks like:
``` json
{
  "type": "error",
  "message": "Something went wrong while generating the job description"
}
```
---
16. What This Project Teaches
This single project connects several earlier lessons:
``` text
ChatPromptTemplate
        ↓
Chat Model
        ↓
.pipe()
        ↓
Runnable chain
        ↓
.stream()
        ↓
SSE
        ↓
Second chain
        ↓
withStructuredOutput()
        ↓
Zod schema
        ↓
Structured result
```
This is the bridge from individual LangChain components to real AI
application workflows.
---
17. Production Notes
For a production version, consider adding:
Request rate limiting
Authentication and authorization
Request size limits
Timeouts
Retry and fallback strategies
Persistent logging
LangSmith tracing
Usage and cost tracking
Model configuration through environment variables
Request cancellation
Persistent storage for generated content
Stronger input validation
Monitoring and alerting
The learning implementation keeps these concerns separate so the core
LangChain workflow remains easy to understand.
---
Phase 2 --- Chains & Workflows
> **Goal:** Learn how to combine LangChain components into predictable,
> parallel, and conditional AI workflows.
Phase 1 introduced individual LangChain building blocks and LCEL. Phase
2 moves from individual chains to larger workflow design.
---
Table of Contents --- Phase 2
Lesson 2.1 --- Sequential, Parallel, Conditional
Workflows
1. Simple Explanation
2. Real-World Analogy
3. Technical Breakdown
4. Real Application Usage
5. Common Mistakes
6. Production Considerations
7. Chain vs Agent
Exercise
Test Your Understanding
Current Implementation
---
Lesson 2.1 --- Sequential, Parallel, Conditional Workflows
1. Simple Explanation
The job-description project already contains a sequential workflow:
``` text
Generate job description
        ↓
Wait for complete output
        ↓
Extract structured data
```
The extraction step depends on the generated text, so the steps must run
in order.
There are three major workflow patterns:
Sequential
Step B depends on Step A.
``` text
Step A
  ↓
Step B
  ↓
Step C
```
Parallel
Independent steps can run at the same time.
``` text
        ┌──→ Step A ──┐
Input ──┤             ├──→ Combined Result
        └──→ Step B ──┘
```
Conditional / Branching
The next step is selected at runtime.
``` text
Input
  ↓
Condition
  ├──→ Branch A
  ├──→ Branch B
  └──→ Default
```
Production AI systems commonly combine all three patterns.
---
2. Real-World Analogy
Imagine onboarding a candidate in HireHub.
Sequential
First verify the candidate's email.
Only after verification:
``` text
Email verification
        ↓
Profile activation
```
There is a dependency.
Parallel
These tasks are independent:
``` text
Send welcome email
        │
        ├── run independently
        │
Record analytics event
```
They do not need to wait for one another.
Conditional
Suppose the candidate selects a plan:
``` text
Candidate plan
      ↓
  ┌───┴────┐
Premium    Free
   ↓         ↓
Premium    Basic
flow       flow
```
The runtime condition determines which path is executed.
---
3. Technical Breakdown
A. Sequential Workflows
LCEL naturally represents sequential workflows through `.pipe()`.
``` typescript
const chain =
  step1Prompt
    .pipe(model)
    .pipe(step1Transform)
    .pipe(step2Prompt)
    .pipe(model);
```
Each stage receives the previous stage's output.
Conceptually:
``` text
Input
  ↓
Step 1
  ↓
Step 2
  ↓
Step 3
```
When to Use It
Use sequential execution when:
``` text
Step B requires Step A's output
```
The AI job-description generator is a direct example:
``` text
Generation
    ↓
Extraction
```
---
B. Parallel Workflows
Use `RunnableParallel` when tasks are independent.
``` typescript
import {
  RunnableParallel,
} from "@langchain/core/runnables";

const resumeAnalysisChain =
  RunnableParallel.from({
    skillsExtraction:
      skillsExtractionChain,

    experienceSummary:
      experienceSummaryChain,

    atsScore:
      atsScoreChain,
  });

const result =
  await resumeAnalysisChain.invoke({
    resumeText: "...",
  });
```
The result can look like:
``` typescript
{
  skillsExtraction: [...],
  experienceSummary: "...",
  atsScore: 85
}
```
All three chains use the same resume input but do not depend on each
other's output.
Sequential Timing
``` text
Chain A
  ↓
Chain B

Total time ≈ timeA + timeB
```
Parallel Timing
``` text
Chain A ──┐
          ├──→ Result
Chain B ──┘

Total time ≈ max(timeA, timeB)
```
Parallel execution can therefore reduce latency when the tasks are truly
independent.
---
C. Conditional / Branching Workflows
Use `RunnableBranch` when the runtime condition determines the next
chain.
``` typescript
import {
  RunnableBranch,
} from "@langchain/core/runnables";

const contentAnalysisChain =
  RunnableBranch.from([
    [
      (input: { category: string }) =>
        input.category === "job_posting",

      jobPostingProcessingChain,
    ],

    [
      (input: { category: string }) =>
        input.category === "resume",

      resumeProcessingChain,
    ],

    defaultProcessingChain,
  ]);
```
Invoke it with:
``` typescript
const result =
  await contentAnalysisChain.invoke({
    category: "resume",
    content: "...",
  });
```
How `RunnableBranch` Works
Each conditional entry contains:
``` text
[condition, chain]
```
LangChain checks the conditions from top to bottom.
The first matching condition determines the chain that runs.
The final chain is the default/fallback branch.
HireHub Example
A unified content-analysis endpoint could accept:
``` text
Resume
Job Posting
Other Content
```
The application can classify the content and route it to the appropriate
workflow.
---
D. Async Execution
`RunnableParallel` is conceptually similar to running independent
asynchronous operations concurrently.
For example:
``` typescript
const result = await Promise.all([
  taskA(),
  taskB(),
  taskC(),
]);
```
The same fundamental backend idea applies:
``` text
Independent tasks
      ↓
Concurrent execution
      ↓
Combined result
```
The main requirement is that the tasks must not depend on one another.
---
E. Error Handling in Workflows
Different workflow types have different failure behavior.
Sequential
If Step 2 fails:
``` text
Step 1
  ↓
Step 2 ❌
  ↓
Step 3 does not receive Step 2's result
```
The chain execution fails unless the application handles the error.
Parallel
If one branch fails, the overall operation can fail.
If partial results are required, individual branches should be designed
with their own error handling or fallback behavior.
Conditional
A default branch should normally be provided.
``` typescript
RunnableBranch.from([
  [conditionA, chainA],
  [conditionB, chainB],
  defaultChain,
]);
```
This prevents unmatched input from producing an unexpected
branch-selection failure.
---
F. Retries and Fallbacks
LangChain Runnables support fallback and retry patterns.
Fallback
``` typescript
const reliableChain =
  primaryChain.withFallbacks([
    backupChain,
  ]);
```
Retry
``` typescript
const chainWithRetry =
  myChain.withRetry({
    stopAfterAttempt: 3,
  });
```
These are reliability mechanisms.
They do not automatically fix:
Bad prompts
Incorrect application logic
Poor model quality
Unsafe tool behavior
Incorrect business rules
More advanced retry strategies such as exponential backoff and circuit
breakers belong in later production-focused material.
---
4. Real Application Usage
Imagine HireHub provides a Complete Resume Analysis feature.
It needs to:
``` text
1. Extract skills
2. Calculate ATS score
3. Generate job-match recommendations
```
If these operations are independent, they can run in parallel:
``` text
                 ┌──→ Skills
                 │
Resume ──────────┼──→ ATS Score
                 │
                 └──→ Recommendations
                          ↓
                    Final Summary
```
The final summary depends on the three results, so the overall workflow
becomes hybrid:
``` text
Parallel analysis
       ↓
Combined results
       ↓
Sequential final-summary chain
```
This hybrid pattern is common in production AI systems.
---
5. Common Mistakes
Mistake 1 --- Making independent work sequential
If two tasks do not depend on one another, running them one after
another can unnecessarily increase latency.
Mistake 2 --- Making dependent work parallel
If Task B needs Task A's result, they must remain sequential.
Mistake 3 --- Forgetting a default branch
A conditional workflow should normally have a safe fallback.
Mistake 4 --- Ignoring branch-level failures
One failing parallel branch can affect the entire operation. Decide
whether the application needs:
``` text
All-or-nothing result
```
or:
``` text
Partial results
```
before designing the workflow.
Mistake 5 --- Creating a chain for every tiny operation
Not every LLM call needs a complex LCEL abstraction.
Use chains when they improve:
Composition
Readability
Reuse
Workflow management
Streaming
Testing
---
6. Production Considerations
Latency
Parallel workflows reduce latency when work is independent, but total
response time is still limited by the slowest branch.
``` text
Branch A = 2 seconds
Branch B = 5 seconds
Branch C = 3 seconds

Parallel total ≈ 5 seconds
```
Cost
Parallel execution can mean several model calls happen concurrently.
That can reduce latency but increase concurrent model usage.
The design should balance:
``` text
Latency
+
Cost
+
Concurrency
```
Observability
As workflows become larger:
``` text
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
it becomes harder to identify exactly where a failure occurred.
Tracing and observability tools such as LangSmith become important for
larger workflows.
Reusability
Organize chains as independent modules:
``` text
src/
└── ai/
    └── chains/
        ├── resumeParse.chain.ts
        ├── jobMatch.chain.ts
        ├── chatbot.chain.ts
        └── jobDescription.chain.ts
```
Named chains can then be reused by different services and routes.
---
7. Chain vs Agent
This distinction is extremely important.
Chain
A chain has a predetermined workflow.
The developer decides:
``` text
Step 1
  ↓
Step 2
  ↓
Step 3
```
The LLM generates or transforms content inside those steps, but the
application controls the workflow.
Example:
``` text
Generate job description
        ↓
Extract structured data
```
The order is known in advance.
Agent
An agent can dynamically decide what action to take.
Conceptually:
``` text
User request
      ↓
LLM decides
      ↓
Choose tool
      ↓
Observe result
      ↓
Decide next action
      ↓
Continue or finish
```
The exact path is not necessarily known in advance.
Simple Decision Rule
Ask:
> Do I know the exact sequence of steps beforehand?
If yes:
``` text
Use a Chain
```
If the LLM genuinely needs to decide:
``` text
Use an Agent
```
Production Principle
Prefer chains whenever they are sufficient.
Chains are generally:
More predictable
Easier to test
Easier to debug
Easier to control
Often cheaper
Use agents when the task genuinely requires dynamic decision-making.
An agent should not be introduced simply because it looks more advanced.
---
Exercise
Exercise 1 --- Sequential Chain
Take:
``` typescript
resumeParseTemplate
```
and:
``` typescript
structuredModel
```
Combine them using:
``` typescript
.pipe()
```
Then create:
``` typescript
getResumeParseData()
```
using the resulting chain.
Exercise 2 --- Parallel Analysis
Imagine HireHub needs:
``` text
A. Extract candidate name and email
B. Perform detailed skill analysis
```
These operations are independent.
Design the conceptual structure using:
``` typescript
RunnableParallel
```
You can use pseudocode instead of a complete implementation.
Exercise 3 --- Conditional Analysis
Design a branch that chooses between:
``` text
Resume analysis
Job posting analysis
Default content analysis
```
using:
``` typescript
RunnableBranch
```
---
Test Your Understanding
Question 1
What is the main benefit of the Runnable interface?
Why does a common interface make it easier to combine LangChain
components?
Question 2
Why does order matter in:
``` typescript
.pipe()
```
Give an example where the wrong order produces an incompatible
input/output flow.
Question 3
When should you use:
``` typescript
RunnableParallel
```
and when should you avoid it?
Think about dependencies between tasks.
Question 4
If:
``` typescript
prompt.pipe(model)
```
supports `.stream()`, what practical benefit does this provide for a
chatbot?
Question 5
Suppose a chain contains:
``` text
Step 1
  ↓
Step 2
  ↓
Step 3
```
If Step 2 fails, what happens to Step 3?
How should a production application handle this?
---
Current Implementation
The resume matching implementation can now be expressed cleanly with
LCEL:
``` typescript
import { ChatGroq } from "@langchain/groq";
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { env } from "../config/env.js";

const resumeParseSchema = z.object({
  matchScore: z.number().min(0).max(100),
  matchSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  recommendations: z.array(z.string()),
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
      "You are an expert at comparing a resume against a job description and extracting matchScore, matchingSkills, missingSkills, and recommendations.",
    ],
    [
      "human",
      "Resume:\n{resume}\n\nJob Description:\n{jobDescription}",
    ],
  ]);

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
The important improvement is that the prompt-to-model relationship is
defined once:
``` text
resumeParseTemplate
        ↓
structuredModel
```
The service only supplies the runtime values:
``` typescript
{
  resume,
  jobDescription
}
```
---
Phase 2 Learning Summary
The workflow progression is:
``` text
Individual Runnables
        ↓
RunnableSequence / .pipe()
        ↓
Sequential Workflows
        ↓
RunnableParallel
        ↓
Parallel Workflows
        ↓
RunnableBranch
        ↓
Conditional Workflows
        ↓
Hybrid Workflows
        ↓
Retries + Fallbacks
        ↓
Production AI Workflows
```
The most important design question is always:
``` text
Does this step depend on the previous step?
            ↓
        Yes → Sequential

        No
            ↓
Can the tasks run independently?
            ↓
        Yes → Parallel

Does runtime input determine the next path?
            ↓
        Yes → Conditional
```
---
Overall Phase 1 → Phase 2 Progression
``` text
Raw LLM SDK
      ↓
LangChain Model
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
      ↓
Sequential Workflows
      ↓
Parallel Workflows
      ↓
Conditional Workflows
      ↓
Production AI Pipelines
```
This progression takes the project from individual model calls to
composable, predictable AI workflows.
import "dotenv/config";
import { createOllama } from "ollama-ai-provider-v2";
import { Agent } from "@mastra/core/agent";
import { weatherTool, fetchStockTool, nosanaSubmitTool, nosanaStatusTool } from "@/mastra/tools";
import { LibSQLStore } from "@mastra/libsql";
import { z } from "zod";
import { Memory } from "@mastra/memory";

export const AgentState = z.object({
  proverbs: z.array(z.string()).default([]),
});

const ollama = createOllama({
  baseURL: process.env.NOS_OLLAMA_API_URL || process.env.OLLAMA_API_URL,
})

export const weatherAgent = new Agent({
  name: "Weather Agent",
  tools: { weatherTool },
  // model: openai("gpt-4o"), // uncomment this line to use openai
  model: ollama(process.env.NOS_MODEL_NAME_AT_ENDPOINT || process.env.MODEL_NAME_AT_ENDPOINT || "qwen3:8b"), // comment this line to use openai
  instructions: "You are a helpful assistant.",
  description: "An agent that can get the weather for a given location.",
  memory: new Memory({
    storage: new LibSQLStore({ url: "file::memory:" }),
    options: {
      workingMemory: {
        enabled: true,
        schema: AgentState,
      },
    },
  }),
})

export const stockAgent = new Agent({
  name: "Stock Agent",
  tools: { fetchStockTool, nosanaSubmitTool, nosanaStatusTool },
  // model: openai("gpt-4o"), // uncomment this line to use openai
  model: ollama(process.env.NOS_MODEL_NAME_AT_ENDPOINT || process.env.MODEL_NAME_AT_ENDPOINT || "qwen3:8b"), // comment this line to use openai
  instructions: `You are a helpful assistant. Route user intents as follows:
- If the user says "price <SYMBOL>", call fetchStockTool with the symbol.
- If the user says "submit <TASK> <SYMBOL>", call nosanaSubmitTool with task and params containing the symbol.
- If the user says "status <JOB_ID>", call nosanaStatusTool with the jobId.`,
  description: "An agent that can fetch stock prices, submit Nosana jobs, and check job status.",
  memory: new Memory({
    storage: new LibSQLStore({ url: "file::memory:" }),
    options: {
      workingMemory: {
        enabled: true,
        schema: AgentState,
      },
    },
  }),
})

// Export all agents for external access
export const agents = [weatherAgent, stockAgent];

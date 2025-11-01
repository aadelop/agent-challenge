# Developer Guidance: Mastra Agent Integration Fix

## **Purpose of the Fix**

This fix resolved the visibility and functionality issues with custom tools (`fetchStockTool`, `nosanaSubmitTool`, `nosanaStatusTool`) in the Mastra Agent Playground. The primary issue was **incomplete agent registration**, preventing tools from appearing in the UI despite being correctly implemented.

## **Technology Stack Overview**

### **Mastra Framework**
- **Purpose**: AI task/agent orchestration platform
- **Key Concept**: Agents contain tools and execute LLM-powered workflows
- **Architecture**: Agents → Tools → External APIs/Services
- **Version**: @mastra/core v0.19.1

### **Nosana Network**
- **Purpose**: Decentralized GPU compute network
- **Key Concept**: Submit computational jobs to distributed nodes
- **Integration**: Via REST API with job submission and status tracking
- **Pattern**: Submit → Poll Status → Retrieve Results

### **CopilotKit SDK**
- **Purpose**: Reactive AI UI components for React applications
- **Key Concept**: useCopilotAction hooks expose AI functions to users
- **Integration**: Direct connection to Mastra agents via HTTP API
- **Pattern**: UI Action → Agent Call → State Update

## **Libraries & APIs Affected**

### **Mastra Framework (@mastra/core v0.19.1)**
- **Agent Registration System**: Modified main configuration in [`src/mastra/index.ts`](src/mastra/index.ts)
- **Tool Creation API**: Fixed parameter handling in tool `execute` functions
- **Memory & Storage Integration**: Uses LibSQL storage with working memory schema

### **External APIs**
- **Alpha Vantage API**: Stock data retrieval with fallback mock mode
- **Nosana Service**: Custom job submission and status checking (placeholder implementation)

### **Supporting Libraries**
- **Zod**: Schema validation for tool inputs/outputs
- **Axios**: HTTP client for external API calls
- **Ollama AI Provider**: LLM integration with configurable endpoints

## **Expected Interfaces & Data Types**

### **Agent Configuration Pattern**
```typescript
export const agentName = new Agent({
  name: "Agent Display Name",
  tools: { toolName1, toolName2 },  // Object destructuring
  model: ollama("model-name"),
  instructions: "System prompt",
  description: "Agent description for UI",
  memory: new Memory({ /* config */ })
});
```

### **Tool Creation Pattern**
```typescript
export const toolName = createTool({
  id: 'kebab-case-id',
  description: 'Human-readable description',
  inputSchema: z.object({
    param: z.string().describe('Parameter description')
  }),
  outputSchema: z.object({
    result: z.string()
  }),
  execute: async ({ context }) => {  // CRITICAL: Use { context }
    const { param } = context;       // Extract from context
    return { result: "value" };
  }
});
```

### **Mastra Registration Pattern**
```typescript
export const mastra = new Mastra({
  agents: {
    agentName1,    // Each agent must be explicitly listed
    agentName2
  },
  mcpServers: { server },
  storage: new LibSQLStore({ url: ":memory:" }),
  logger: new ConsoleLogger({ level: "info" })
});
```

## **Critical Coding Conventions**

### **1. Agent Registration Requirement**
- **Rule**: All agents MUST be registered in [`src/mastra/index.ts`](src/mastra/index.ts) to appear in Playground
- **Pattern**: Import agent → Add to `agents` object
- **Anti-pattern**: Defining agents without registration (invisible to UI)

### **2. Tool Parameter Destructuring**
- **Correct**: `execute: async ({ context }) => { const { param } = context; }`
- **Incorrect**: `execute: async ({ param }) => { }` (causes runtime errors)
- **Reason**: Mastra wraps parameters in `context` object

### **3. Tool Import/Export Structure**
```typescript
// In tool file
export const toolName = createTool({ /* config */ });

// In index.ts
export { toolName } from './toolFile';

// In agent file
import { toolName } from '@/mastra/tools';
```

### **4. Environment Configuration**
- **Mock Mode**: Set `MOCK_MODE=true` for development/testing
- **API Keys**: Use descriptive env var names (`ALPHA_VANTAGE_API_KEY`)
- **Model Configuration**: Support both local Ollama and remote endpoints

### **5. Schema Validation Pattern**
```typescript
const ToolResultSchema = z.object({
  field: z.number(),
  optional: z.string().optional(),
  timestamp: z.string()
});

export type ToolResult = z.infer<typeof ToolResultSchema>;
```

## **Architecture Implications**

### **Agent-Tool Relationship**
- Agents are **containers** for tools with specific instructions and memory
- Tools are **stateless functions** with strict input/output contracts
- Multiple agents can share the same tools

### **Registration Hierarchy**
```
src/mastra/index.ts (Main Config)
    ↓
src/mastra/agents/index.ts (Agent Definitions)
    ↓
src/mastra/tools/index.ts (Tool Exports)
    ↓
src/mastra/tools/*.ts (Individual Tools)
```

### **Error Handling Strategy**
- **Environment Validation**: Check required env vars at tool execution
- **Graceful Degradation**: Mock mode for external API failures
- **Type Safety**: Zod validation prevents runtime type errors

## **Future Contributor Guidelines**

### **Adding New Tools**
1. Create tool in `src/mastra/tools/newTool.ts`
2. Export from `src/mastra/tools/index.ts`
3. Import and add to relevant agent in `src/mastra/agents/index.ts`
4. Ensure agent is registered in `src/mastra/index.ts`

### **Adding New Agents**
1. Define agent in `src/mastra/agents/index.ts`
2. Import in `src/mastra/index.ts`
3. Add to `agents` object in Mastra configuration

### **Testing Integration**
- Start server: `pnpm run dev:agent`
- Verify agents appear in Playground at http://localhost:4111
- Test tool execution with appropriate prompts

This architectural pattern ensures maintainable, discoverable, and properly integrated agent tools within the Mastra ecosystem.
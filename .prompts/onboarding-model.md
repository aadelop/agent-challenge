# Onboarding Guide for AI Models

You are working within a **Mastra + Nosana + CopilotKit** integration project. This is a sophisticated tech stack that requires precise patterns.

## **Technology Stack Context**

### **Mastra Framework** (Primary)
- **Purpose**: AI agent orchestration platform
- **Key Files**: `src/mastra/agents/`, `src/mastra/tools/`, `src/mastra/index.ts`
- **Pattern**: Agents contain Tools, Tools call External Services
- **Critical Rule**: ALL agents must be registered in `src/mastra/index.ts` or they won't appear in Playground

### **Nosana Network** (Integration)
- **Purpose**: Decentralized GPU compute jobs
- **Key Pattern**: Submit job → Poll status → Get results
- **Critical Rule**: Always include `idempotencyKey` for retry safety
- **Mock Mode**: Use `MOCK_MODE=true` for development

### **CopilotKit SDK** (UI Integration)
- **Purpose**: React components for AI interactions
- **Key Pattern**: `useCopilotAction` hooks + `useCopilotReadable` state
- **Critical Rule**: Always handle async state updates properly

## **Required Reading**
**MUST READ THESE DOCUMENTS BEFORE CODING:**
- `/docs/dev-guidance.md` - Architecture patterns and critical fixes
- `/docs/style-normalization.md` - Code style requirements
- `/src/examples/mastra-nosana-step.ts` - Complete Mastra+Nosana pattern
- `/src/examples/copilotkit-integration.tsx` - CopilotKit+Mastra pattern

## **Coding Rules (STRICT)**

### **1. Explicit Everything**
```typescript
// CORRECT: Always explicit types and imports
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const toolInput: ToolInputType = context.inputParam;
const result: ToolOutputType = await processData(toolInput);
```

### **2. Parameter Destructuring (CRITICAL)**
```typescript
// CORRECT: Mastra tools MUST use { context }
execute: async ({ context }) => {
  const { param1, param2 } = context;
  return { result: "value" };
}

// WRONG: This will cause runtime errors
execute: async ({ param1, param2 }) => { // DON'T DO THIS
```

### **3. Agent Registration (CRITICAL)**
```typescript
// CORRECT: All agents must be registered in src/mastra/index.ts
export const mastra = new Mastra({
  agents: {
    weatherAgent,
    stockAgent,    // Must be explicitly listed
    yourNewAgent   // Must be explicitly listed
  },
});
```

### **4. Async/Await Only**
```typescript
// CORRECT: Always async/await
async function callAPI(): Promise<ResponseType> {
  try {
    const response = await fetch('/api/endpoint');
    const data = await response.json();
    return data;
  } catch (error) {
    const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`API call failed: ${errorMessage}`);
  }
}

// WRONG: No .then() chains or callbacks
```

### **5. Error Handling Pattern**
```typescript
// ALWAYS use this exact pattern
try {
  const result = await someOperation();
  return result;
} catch (error) {
  const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
  throw new Error(`Operation failed: ${errorMessage}`);
}
```

## **Development Workflow**

### **When Adding New Tools:**
1. Create tool file in `src/mastra/tools/newTool.ts`
2. Export from `src/mastra/tools/index.ts`
3. Import in agent file `src/mastra/agents/index.ts`
4. Add to agent's `tools` object
5. Ensure agent is registered in `src/mastra/index.ts`
6. Test with `pnpm run dev:agent`

### **When Adding New Agents:**
1. Define agent in `src/mastra/agents/index.ts`
2. Import in `src/mastra/index.ts`
3. Add to `agents` object in Mastra config
4. Verify appears in Playground at http://localhost:4111

## **Code Generation Protocol**

When generating code, ALWAYS follow this structure:

### **1. Architecture Explanation (2-4 lines)**
Explain exactly how your code fits into the Mastra → Tools → Services pattern and which integration boundaries it crosses.

### **2. Code Implementation**
Follow the exact patterns from `/src/examples/` - do not deviate or invent new patterns.

### **3. Testing Requirements**
If your code touches these integration boundaries, provide tests:
- **Mastra Tool Execution**: Test the `execute` function with mock context
- **Nosana API Calls**: Test job submission with request payload snapshots
- **CopilotKit State Updates**: Test state changes and UI reactions

### **4. Self-Review Checklist**
End with this exact format:
```
Self-Review:
- Risks: [Potential failure points]
- Assumptions: [What you assumed about the environment]
- Follow-ups: [What should be tested/verified next]
```

## **Common Mistakes to Avoid**

1. **Tool Parameter Destructuring**: Must use `{ context }`, never direct destructuring
2. **Agent Registration**: Defining agents without registering them in main config
3. **Import Paths**: Always use `@/` for internal imports, exact package names for externals
4. **Error Handling**: Never catch errors without explicit type checking
5. **Async Patterns**: Never use .then() chains or callbacks

## **Emergency Debugging**

If something doesn't work:
1. Check agent registration in `src/mastra/index.ts`
2. Verify tool parameter destructuring uses `{ context }`
3. Confirm all imports are explicit and correct
4. Test server starts without errors: `pnpm run dev:agent`
5. Check Playground shows agent at http://localhost:4111

Remember: This stack is very particular about patterns. Follow examples exactly rather than improvising.

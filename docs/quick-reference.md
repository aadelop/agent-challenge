# Quick Reference Guide

## **CRITICAL PATTERNS - DO NOT DEVIATE**

### **1. Mastra Tool Pattern (EXACT SYNTAX)**
```typescript
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const toolName = createTool({
  id: 'kebab-case-id',
  description: 'Clear description of what this tool does',
  inputSchema: z.object({
    param: z.string().describe('Parameter description'),
  }),
  outputSchema: z.object({
    result: z.string(),
    status: z.string(),
    timestamp: z.string(),
  }),
  execute: async ({ context }) => {  // CRITICAL: Use { context }
    const { param } = context;       // CRITICAL: Extract from context
    
    try {
      // Your logic here
      const result: string = `Processed: ${param}`;
      
      return {
        result: result,
        status: 'success',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Tool execution failed: ${errorMessage}`);
    }
  },
});
```

### **2. Agent Registration Pattern (CRITICAL)**
```typescript
// In src/mastra/agents/index.ts
export const agentName = new Agent({
  name: "Display Name",
  tools: { toolName1, toolName2 },  // Object with tool references
  model: ollama("model-name"),
  instructions: "Clear instructions",
  description: "Agent description for UI",
  memory: new Memory({ /* config */ })
});

// In src/mastra/index.ts (MUST DO THIS)
export const mastra = new Mastra({
  agents: {
    agentName,    // CRITICAL: Must be listed here
  },
  // ... rest of config
});
```

### **3. Nosana Job Pattern (COMPLETE CYCLE)**
```typescript
// Job submission with idempotency
interface NosanaJobPayload {
  task: string;
  params: Record<string, any>;
  idempotencyKey: string;  // CRITICAL: Always include
  timeout?: number;
}

async function submitNosanaJob(payload: NosanaJobPayload): Promise<NosanaJobResponse> {
  // Always include idempotencyKey for safe retries
  const jobPayload: NosanaJobPayload = {
    ...payload,
    idempotencyKey: `${payload.task}-${Date.now()}-${Math.random()}`,
  };
  
  // Mock mode for development
  if (process.env.MOCK_MODE === 'true') {
    return mockJobResponse;
  }
  
  // Real API call with retry logic
  return await withRetry(
    () => callNosanaAPI(jobPayload),
    { retries: 3, baseDelay: 200 }
  );
}
```

### **4. CopilotKit Action Pattern**
```typescript
// State management + action registration
const [state, setState] = useState<AgentState>({
  isProcessing: false,
  lastResult: null,
  error: null,
  timestamp: null,
});

// Make state readable to CopilotKit
useCopilotReadable({
  description: 'Current agent state',
  value: state,
});

// Register action
useCopilotAction({
  name: 'actionName',
  description: 'What this action does',
  parameters: [
    {
      name: 'param',
      type: 'string',
      description: 'Parameter description',
      required: true,
    },
  ],
  handler: async ({ param }: { param: string }) => {
    setState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      const result = await callMastraAgent('agentName', param);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        lastResult: result,
        timestamp: new Date().toISOString(),
      }));
      return result;
    } catch (error) {
      const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }));
      throw error;
    }
  },
});
```

## **COMMON MISTAKES - WILL BREAK SYSTEM**

### **❌ Tool Parameter Destructuring (WRONG)**
```typescript
// DON'T DO THIS - Will cause runtime errors
execute: async ({ param1, param2 }) => {
  return { result: param1 };
}
```

### **✅ Tool Parameter Destructuring (CORRECT)**
```typescript
// DO THIS - Will work correctly
execute: async ({ context }) => {
  const { param1, param2 } = context;
  return { result: param1 };
}
```

### **❌ Agent Not Registered (WRONG)**
```typescript
// DON'T DO THIS - Agent won't appear in Playground
// Agent defined in src/mastra/agents/index.ts but not added to main config
export const myAgent = new Agent({ /* config */ });
```

### **✅ Agent Properly Registered (CORRECT)**
```typescript
// DO THIS - Agent will appear in Playground
// 1. Define in src/mastra/agents/index.ts
export const myAgent = new Agent({ /* config */ });

// 2. Register in src/mastra/index.ts
export const mastra = new Mastra({
  agents: {
    myAgent,  // MUST be listed here
  },
});
```

### **❌ Implicit Types and Error Handling (WRONG)**
```typescript
// DON'T DO THIS
function processData(data) {  // No types
  try {
    return fetch('/api').then(r => r.json());  // .then() chain
  } catch (e) {
    throw e;  // No error context
  }
}
```

### **✅ Explicit Types and Error Handling (CORRECT)**
```typescript
// DO THIS
async function processData(data: InputType): Promise<OutputType> {
  try {
    const response = await fetch('/api');
    const result = await response.json();
    return result;
  } catch (error) {
    const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`processData failed: ${errorMessage}`);
  }
}
```

## **FILE STRUCTURE CHECKLIST**

### **When Adding New Tool**
1. ✅ Create: `src/mastra/tools/newTool.ts`
2. ✅ Export: `src/mastra/tools/index.ts`
3. ✅ Import: `src/mastra/agents/index.ts` 
4. ✅ Add to agent: `tools: { existingTool, newTool }`
5. ✅ Verify agent registered: `src/mastra/index.ts`

### **When Adding New Agent**
1. ✅ Define: `src/mastra/agents/index.ts`
2. ✅ Import: `src/mastra/index.ts`
3. ✅ Register: `agents: { existingAgent, newAgent }`

## **ENVIRONMENT VARIABLES PATTERN**

```typescript
// Always validate environment variables
const requiredVar: string | undefined = process.env.REQUIRED_VAR;
if (!requiredVar) {
  throw new Error('REQUIRED_VAR environment variable is required');
}

const optionalVar: string = process.env.OPTIONAL_VAR || 'default_value';
const mockMode: boolean = process.env.MOCK_MODE === 'true';
const numericVar: number = parseInt(process.env.NUMERIC_VAR || '10', 10);
```

## **TESTING PATTERN**

```typescript
// Always test integration boundaries
describe('Tool Name', () => {
  test('should execute with correct input/output', async () => {
    // Arrange
    const mockContext = { param: 'test_value' };
    
    // Act
    const result = await toolName.execute({ context: mockContext });
    
    // Assert
    expect(result).toEqual({
      result: expect.any(String),
      status: 'success',
      timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
    });
  });
  
  test('should handle errors properly', async () => {
    // Arrange
    const invalidContext = { param: null };
    
    // Act & Assert
    await expect(toolName.execute({ context: invalidContext }))
      .rejects
      .toThrow(/Tool execution failed/);
  });
});
```

## **QUICK DEBUGGING CHECKLIST**

### **Tool Not Appearing in Playground**
1. ✅ Check agent registration in `src/mastra/index.ts`
2. ✅ Check tool export from `src/mastra/tools/index.ts`
3. ✅ Check tool added to agent's `tools` object
4. ✅ Restart server: `pnpm run dev:agent`

### **Tool Execution Failing**
1. ✅ Check parameter destructuring uses `{ context }`
2. ✅ Check input schema matches actual parameters
3. ✅ Check error handling includes proper context
4. ✅ Check environment variables are set

### **Server Won't Start**
1. ✅ Run `tsc --noEmit` to check TypeScript errors
2. ✅ Check all imports are correct
3. ✅ Check all agents are properly exported
4. ✅ Check environment variables in `.env`

## **EMERGENCY REFERENCE**

### **Complete Minimum Tool Template**
```typescript
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const basicTool = createTool({
  id: 'basic-tool',
  description: 'Basic tool template',
  inputSchema: z.object({ input: z.string() }),
  outputSchema: z.object({ result: z.string() }),
  execute: async ({ context }) => {
    return { result: `Processed: ${context.input}` };
  },
});
```

### **Complete Minimum Agent Setup**
```typescript
// In src/mastra/agents/index.ts
export const basicAgent = new Agent({
  name: "Basic Agent",
  tools: { basicTool },
  model: ollama("qwen3:8b"),
  instructions: "You are a helpful assistant.",
  description: "Basic agent for testing.",
});

// In src/mastra/index.ts
export const mastra = new Mastra({
  agents: { basicAgent },
  // ... other config
});
```

**Remember**: If in doubt, copy exactly from `/src/examples/` rather than improvising!
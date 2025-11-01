# Style Normalization

## **Import Patterns**

### **Always Use Explicit Imports**
```typescript
// CORRECT: Explicit imports with full paths
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { buildNosanaJobPayload } from '@/services/nosana/buildPayload';
import { callMastraAgent } from '@/examples/copilotkit-integration';

// INCORRECT: Avoid wildcard or implicit imports
import * as mastra from '@mastra/core'; // DON'T DO THIS
import { createTool } from 'mastra'; // DON'T DO THIS
```

### **Path Structure**
- Use `@/` for internal project files
- Use exact package names for external libraries
- Always specify file extensions for TypeScript: `.ts`, `.tsx`

## **Async/Await Patterns**

### **Only async/await - No Callbacks or Promises**
```typescript
// CORRECT: Use async/await consistently
async function callExternalAPI(data: RequestData): Promise<ResponseData> {
  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`API call failed: ${errorMessage}`);
  }
}

// INCORRECT: Don't use .then() chains or callbacks
function callExternalAPI(data: RequestData) {
  return fetch('/api/endpoint')
    .then(response => response.json()) // DON'T DO THIS
    .catch(error => console.log(error)); // DON'T DO THIS
}
```

### **Retry Pattern for External IO**
```typescript
// Standard retry wrapper for all external calls
async function withRetry<T>(
  fn: () => Promise<T>,
  options: { retries: number; baseDelay: number }
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= options.retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === options.retries) {
        throw lastError;
      }
      
      const delay: number = options.baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Usage example
const result = await withRetry(
  () => callExternalAPI(requestData),
  { retries: 3, baseDelay: 200 }
);
```

## **Module Structure**

### **One Module = One Concern**
```typescript
// File: src/services/nosanaJobService.ts
// CONCERN: Nosana job operations only

interface NosanaJobRequest {
  task: string;
  params: Record<string, any>;
}

interface NosanaJobResponse {
  jobId: string;
  status: string;
  result?: any;
}

// Internal helper functions (not exported)
function validateJobRequest(request: NosanaJobRequest): boolean {
  return request.task.length > 0 && typeof request.params === 'object';
}

function formatJobResponse(rawResponse: any): NosanaJobResponse {
  return {
    jobId: rawResponse.id || '',
    status: rawResponse.status || 'unknown',
    result: rawResponse.data,
  };
}

// Public API functions (exported at bottom)
async function submitNosanaJob(request: NosanaJobRequest): Promise<NosanaJobResponse> {
  if (!validateJobRequest(request)) {
    throw new Error('Invalid job request format');
  }
  
  const rawResponse = await withRetry(
    () => fetch('/api/nosana/jobs', {
      method: 'POST',
      body: JSON.stringify(request),
    }),
    { retries: 3, baseDelay: 200 }
  );
  
  const data = await rawResponse.json();
  return formatJobResponse(data);
}

// Export public API at bottom of file
export {
  submitNosanaJob,
  type NosanaJobRequest,
  type NosanaJobResponse,
};
```

## **Error Handling Patterns**

### **Always Use Explicit Error Types**
```typescript
// CORRECT: Explicit error handling with type checking
try {
  const result = await someOperation();
  return result;
} catch (error) {
  const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
  const context: string = 'someOperation';
  throw new Error(`${context} failed: ${errorMessage}`);
}

// INCORRECT: Generic catch without type checking
try {
  return await someOperation();
} catch (e) {
  throw e; // DON'T DO THIS
}
```

## **Testing Patterns**

### **Integration Boundary Tests**
```typescript
// File: __tests__/nosanaJobService.test.ts
import { submitNosanaJob } from '@/services/nosanaJobService';

describe('Nosana Job Service', () => {
  test('should submit job with correct payload format', async () => {
    // Arrange
    const mockRequest = {
      task: 'analyze_data',
      params: { dataset: 'test.csv' },
    };
    
    const expectedPayload = {
      task: 'analyze_data',
      params: { dataset: 'test.csv' },
      idempotencyKey: expect.stringMatching(/^analyze_data-\d+-/),
    };
    
    // Mock the fetch call
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: 'job123',
        status: 'pending',
      }),
    });
    
    // Act
    const result = await submitNosanaJob(mockRequest);
    
    // Assert
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/nosana/jobs',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(expectedPayload),
      })
    );
    
    expect(result).toEqual({
      jobId: 'job123',
      status: 'pending',
      result: undefined,
    });
  });
});
```

## **Type Definition Patterns**

### **Explicit Interface Definitions**
```typescript
// CORRECT: Clear, explicit interfaces
interface MastraToolInput {
  symbol: string;
  timeframe?: '1d' | '1w' | '1m';
  includeMetadata: boolean;
}

interface MastraToolOutput {
  result: any;
  executionTime: number;
  timestamp: string;
  status: 'success' | 'error';
  error?: string;
}

// INCORRECT: Avoid any or implicit types
function processTool(input: any): any { // DON'T DO THIS
  return input.result;
}
```

## **Environment Variable Patterns**

### **Explicit Validation and Defaults**
```typescript
// CORRECT: Validate environment variables with explicit fallbacks
const nosanaApiUrl: string = process.env.NOSANA_API_URL || 'http://localhost:8080';
const nosanaApiKey: string | undefined = process.env.NOSANA_API_KEY;

if (!nosanaApiKey) {
  throw new Error('NOSANA_API_KEY environment variable is required');
}

const mockMode: boolean = process.env.MOCK_MODE === 'true';
const retryAttempts: number = parseInt(process.env.RETRY_ATTEMPTS || '3', 10);

// INCORRECT: Direct usage without validation
const apiKey = process.env.NOSANA_API_KEY; // DON'T DO THIS
```

## **Examples Reference**
- See `/src/examples/mastra-nosana-step.ts` for complete Mastra + Nosana integration
- See `/src/examples/copilotkit-integration.tsx` for CopilotKit + Mastra patterns
- Follow these patterns exactly for consistent, maintainable code

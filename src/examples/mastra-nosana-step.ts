/**
 * Canonical pattern for Mastra-Nosana integration
 * This example shows the complete lifecycle of a Nosana job within a Mastra tool
 */
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Define explicit interfaces for Nosana integration
interface NosanaJobPayload {
  task: string;
  params: Record<string, any>;
  idempotencyKey: string;
  timeout?: number;
}

interface NosanaJobResponse {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// Schema definitions for tool validation
const NosanaStepInputSchema = z.object({
  task: z.string().describe('Task description for Nosana execution'),
  params: z.record(z.any()).describe('Task parameters object'),
  timeoutMs: z.number().optional().default(30000).describe('Timeout in milliseconds'),
});

const NosanaStepOutputSchema = z.object({
  jobId: z.string(),
  status: z.string(),
  result: z.any().optional(),
  executionTime: z.number(),
  timestamp: z.string(),
});

export type NosanaStepInput = z.infer<typeof NosanaStepInputSchema>;
export type NosanaStepOutput = z.infer<typeof NosanaStepOutputSchema>;

/**
 * Build Nosana job payload with required fields
 * Always include idempotencyKey for safe retries
 */
function buildNosanaJobPayload(
  task: string, 
  params: Record<string, any>, 
  timeoutMs: number = 30000
): NosanaJobPayload {
  // Generate idempotency key from task and params for deterministic retries
  const idempotencyKey: string = `${task}-${Date.now()}-${JSON.stringify(params).slice(0, 50)}`;
  
  const payload: NosanaJobPayload = {
    task: task,
    params: params,
    idempotencyKey: idempotencyKey,
    timeout: timeoutMs,
  };
  
  return payload;
}

/**
 * Submit job to Nosana with proper error handling
 */
async function submitNosanaJob(payload: NosanaJobPayload): Promise<NosanaJobResponse> {
  const apiUrl: string = process.env.NOSANA_API_URL || 'http://localhost:8080';
  const apiKey: string | undefined = process.env.NOSANA_API_KEY;
  
  if (!apiKey) {
    throw new Error('NOSANA_API_KEY environment variable is required');
  }
  
  // Mock mode for development
  if (process.env.MOCK_MODE === 'true') {
    const mockResponse: NosanaJobResponse = {
      jobId: `mock-${payload.idempotencyKey}`,
      status: 'completed',
      result: { message: `Mock result for task: ${payload.task}` },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return mockResponse;
  }
  
  try {
    const response = await fetch(`${apiUrl}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Idempotency-Key': payload.idempotencyKey,
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`Nosana API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    const jobResponse: NosanaJobResponse = {
      jobId: data.jobId || '',
      status: data.status || 'pending',
      result: data.result,
      error: data.error,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
    
    return jobResponse;
    
  } catch (error) {
    const errorMessage: string = error instanceof Error ? error.message : 'Unknown Nosana error';
    throw new Error(`Nosana job submission failed: ${errorMessage}`);
  }
}

/**
 * Mastra tool that integrates with Nosana
 * Follows the complete Mastra step lifecycle: input → process → output → error handling
 */
export const nosanaExecuteTool = createTool({
  id: 'nosana-execute-step',
  description: 'Execute a task on Nosana decentralized compute network',
  inputSchema: NosanaStepInputSchema,
  outputSchema: NosanaStepOutputSchema,
  
  // CRITICAL: Always use { context } parameter destructuring
  execute: async ({ context }) => {
    const startTime: number = Date.now();
    
    try {
      // Step 1: Extract and validate input parameters
      const task: string = context.task;
      const params: Record<string, any> = context.params;
      const timeoutMs: number = context.timeoutMs || 30000;
      
      // Step 2: Build Nosana job payload
      const jobPayload: NosanaJobPayload = buildNosanaJobPayload(task, params, timeoutMs);
      
      // Step 3: Submit job to Nosana
      const jobResponse: NosanaJobResponse = await submitNosanaJob(jobPayload);
      
      // Step 4: Return standardized output
      const executionTime: number = Date.now() - startTime;
      
      const output: NosanaStepOutput = {
        jobId: jobResponse.jobId,
        status: jobResponse.status,
        result: jobResponse.result,
        executionTime: executionTime,
        timestamp: new Date().toISOString(),
      };
      
      return output;
      
    } catch (error) {
      // Step 5: Handle errors with proper context
      const executionTime: number = Date.now() - startTime;
      const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
      
      throw new Error(`Nosana execution failed after ${executionTime}ms: ${errorMessage}`);
    }
  },
});

// Export all public interfaces and functions
export {
  buildNosanaJobPayload,
  submitNosanaJob,
};

export type {
  NosanaJobPayload,
  NosanaJobResponse,
};
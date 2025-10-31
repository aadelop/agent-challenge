import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { submitJob } from '../services/nosanaService';

const NosanaSubmitToolResultSchema = z.object({
  jobId: z.string(),
  status: z.string(),
  message: z.string(),
});

export const nosanaSubmitTool = createTool({
  id: 'nosana-submit-job',
  description: 'Submit a job to Nosana for processing',
  inputSchema: z.object({
    task: z.string().describe('Task description'),
    params: z.any().describe('Task parameters'),
  }),
  outputSchema: NosanaSubmitToolResultSchema,
  execute: async ({ context }) => {
    const { task, params } = context;
    // TODO: replace with real Nosana CLI call
    const result = await submitJob({ task, params });
    return {
      jobId: result.jobId,
      status: result.status,
      message: `Job submitted successfully with ID ${result.jobId}`,
    };
  },
});
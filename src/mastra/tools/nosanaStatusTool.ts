import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getJobStatus } from '../services/nosanaService';

const NosanaStatusToolResultSchema = z.object({
  jobId: z.string(),
  status: z.string(),
  result: z.any().optional(),
  updatedAt: z.string(),
});

export const nosanaStatusTool = createTool({
  id: 'nosana-job-status',
  description: 'Get the status of a Nosana job',
  inputSchema: z.object({
    jobId: z.string().describe('Job ID to check status for'),
  }),
  outputSchema: NosanaStatusToolResultSchema,
  execute: async ({ context }) => {
    const { jobId } = context;
    // TODO: replace with real Nosana CLI call
    return getJobStatus(jobId);
  },
});
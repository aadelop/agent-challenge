interface Job {
  id: string;
  status: 'pending' | 'running' | 'completed';
  result?: {
    trend: string;
    confidence: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const jobs = new Map<string, Job>();

export const submitJob = async (payload: { task: string; params: Record<string, unknown> }): Promise<{ jobId: string; status: string }> => {
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const job: Job = {
    id: jobId,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  jobs.set(jobId, job);

  // Simulate job progression
  setTimeout(() => {
    job.status = 'running';
    job.updatedAt = new Date();
  }, 1000);

  setTimeout(() => {
    job.status = 'completed';
    job.result = {
      trend: 'bullish', // Fake result
      confidence: 0.85,
    };
    job.updatedAt = new Date();
  }, 5000);

  return { jobId, status: job.status };
};

export const getJobStatus = (jobId: string): { jobId: string; status: string; result?: { trend: string; confidence: number }; updatedAt: string } => {
  const job = jobs.get(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }
  return {
    jobId: job.id,
    status: job.status,
    result: job.result,
    updatedAt: job.updatedAt.toISOString(),
  };
};
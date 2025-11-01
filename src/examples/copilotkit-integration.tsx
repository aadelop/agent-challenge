/**
 * CopilotKit Integration Pattern
 * Shows how to integrate Mastra agents with CopilotKit UI components
 * Simplified version focusing on patterns rather than exact API details
 */
import React, { useState } from 'react';
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core';

// Define explicit state interfaces
interface AgentState {
  isProcessing: boolean;
  lastResult: string | null;
  error: string | null;
  timestamp: string | null;
}

interface MastraAgentResponse {
  result: any;
  status: 'success' | 'error';
  message: string;
  executionTime: number;
}

/**
 * Call Mastra agent with proper error handling
 */
async function callMastraAgent(
  agentName: string, 
  prompt: string
): Promise<MastraAgentResponse> {
  try {
    const apiUrl: string = process.env.NEXT_PUBLIC_MASTRA_API_URL || 'http://localhost:4111/api';
    
    const response = await fetch(`${apiUrl}/agents/${agentName}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
        stream: false,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Mastra API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    const agentResponse: MastraAgentResponse = {
      result: data.message || data.result,
      status: 'success',
      message: 'Agent executed successfully',
      executionTime: data.executionTime || 0,
    };
    
    return agentResponse;
    
  } catch (error) {
    const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
    
    const errorResponse: MastraAgentResponse = {
      result: null,
      status: 'error',
      message: `Agent execution failed: ${errorMessage}`,
      executionTime: 0,
    };
    
    return errorResponse;
  }
}

/**
 * Stock price CopilotKit action using Mastra agent
 */
export function StockPriceCopilotAction() {
  const [agentState, setAgentState] = useState<AgentState>({
    isProcessing: false,
    lastResult: null,
    error: null,
    timestamp: null,
  });
  
  // Make agent state readable to CopilotKit
  useCopilotReadable({
    description: 'Current state of the stock price agent',
    value: {
      isProcessing: agentState.isProcessing,
      lastResult: agentState.lastResult,
      hasError: agentState.error !== null,
      timestamp: agentState.timestamp,
    },
  });
  
  // Define CopilotKit action for stock price lookup
  useCopilotAction({
    name: 'getStockPrice',
    description: 'Get current stock price for a given symbol using Mastra agent',
    parameters: [
      {
        name: 'symbol',
        type: 'string',
        description: 'Stock symbol (e.g., TSLA, AAPL)',
        required: true,
      },
    ],
    handler: async ({ symbol }: { symbol: string }) => {
      // Update state: processing started
      setAgentState(prev => ({
        ...prev,
        isProcessing: true,
        error: null,
        timestamp: new Date().toISOString(),
      }));
      
      try {
        // Call Mastra stock agent
        const prompt: string = `price ${symbol}`;
        const response: MastraAgentResponse = await callMastraAgent('stockAgent', prompt);
        
        if (response.status === 'error') {
          throw new Error(response.message);
        }
        
        // Update state: success
        setAgentState(prev => ({
          ...prev,
          isProcessing: false,
          lastResult: JSON.stringify(response.result),
          error: null,
          timestamp: new Date().toISOString(),
        }));
        
        return `Stock price for ${symbol}: ${JSON.stringify(response.result)}`;
        
      } catch (error) {
        const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
        
        // Update state: error
        setAgentState(prev => ({
          ...prev,
          isProcessing: false,
          lastResult: null,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        }));
        
        throw new Error(`Failed to get stock price: ${errorMessage}`);
      }
    },
  });
  
  return (
    <div className="agent-state-display">
      {agentState.isProcessing && (
        <div className="processing-indicator">
          Processing stock price request...
        </div>
      )}
      
      {agentState.error && (
        <div className="error-display">
          Error: {agentState.error}
        </div>
      )}
      
      {agentState.lastResult && (
        <div className="result-display">
          <strong>Last Result:</strong>
          <pre>{agentState.lastResult}</pre>
          <small>Updated: {agentState.timestamp}</small>
        </div>
      )}
    </div>
  );
}

/**
 * Nosana job submission CopilotKit action
 */
export function NosanaJobCopilotAction() {
  const [jobState, setJobState] = useState<AgentState>({
    isProcessing: false,
    lastResult: null,
    error: null,
    timestamp: null,
  });
  
  // Make job state readable to CopilotKit
  useCopilotReadable({
    description: 'Current state of Nosana job submissions',
    value: {
      isProcessing: jobState.isProcessing,
      lastJobId: jobState.lastResult,
      hasError: jobState.error !== null,
      timestamp: jobState.timestamp,
    },
  });
  
  // Define CopilotKit action for Nosana job submission
  useCopilotAction({
    name: 'submitNosanaJob',
    description: 'Submit a computational task to Nosana network',
    parameters: [
      {
        name: 'task',
        type: 'string',
        description: 'Task description to execute',
        required: true,
      },
      {
        name: 'params',
        type: 'object',
        description: 'Task parameters as JSON object',
        required: false,
      },
    ],
    handler: async ({ task, params }: { task: string; params?: any }) => {
      setJobState(prev => ({
        ...prev,
        isProcessing: true,
        error: null,
        timestamp: new Date().toISOString(),
      }));
      
      try {
        const paramsString: string = params ? JSON.stringify(params) : '{}';
        const prompt: string = `submit ${task} ${paramsString}`;
        const response: MastraAgentResponse = await callMastraAgent('stockAgent', prompt);
        
        if (response.status === 'error') {
          throw new Error(response.message);
        }
        
        setJobState(prev => ({
          ...prev,
          isProcessing: false,
          lastResult: JSON.stringify(response.result),
          error: null,
          timestamp: new Date().toISOString(),
        }));
        
        return `Nosana job submitted: ${JSON.stringify(response.result)}`;
        
      } catch (error) {
        const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
        
        setJobState(prev => ({
          ...prev,
          isProcessing: false,
          lastResult: null,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        }));
        
        throw new Error(`Failed to submit Nosana job: ${errorMessage}`);
      }
    },
  });
  
  return (
    <div className="nosana-job-display">
      {jobState.isProcessing && (
        <div className="processing-indicator">
          Submitting Nosana job...
        </div>
      )}
      
      {jobState.error && (
        <div className="error-display">
          Job Error: {jobState.error}
        </div>
      )}
      
      {jobState.lastResult && (
        <div className="result-display">
          <strong>Last Job:</strong>
          <pre>{jobState.lastResult}</pre>
          <small>Submitted: {jobState.timestamp}</small>
        </div>
      )}
    </div>
  );
}

/**
 * Complete CopilotKit + Mastra integration component
 */
export function MastraAgentCopilot() {
  return (
    <div className="mastra-agent-copilot">
      <h3>Mastra Agent Integration</h3>
      
      {/* Stock price action with state display */}
      <div className="copilot-section">
        <h4>Stock Price Agent</h4>
        <StockPriceCopilotAction />
      </div>
      
      {/* Nosana job action with state display */}
      <div className="copilot-section">
        <h4>Nosana Compute Jobs</h4>
        <NosanaJobCopilotAction />
      </div>
      
      <div className="instructions">
        <p>Use natural language to:</p>
        <ul>
          <li>Ask for stock prices: "Get the current price of TSLA"</li>
          <li>Submit compute jobs: "Submit a task to analyze data"</li>
          <li>Check job status: "What's the status of job abc123"</li>
        </ul>
      </div>
    </div>
  );
}

// Export all components and utilities
export {
  callMastraAgent,
  type MastraAgentResponse,
  type AgentState,
};
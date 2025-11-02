"use client";

import { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";

const AVAILABLE_AGENTS = [
  { id: "stockAgent", name: "Stock Agent", description: "Fetch stock prices and submit Nosana jobs" },
  { id: "weatherAgent", name: "Weather Agent", description: "Get weather information" },
] as const;

type AgentId = typeof AVAILABLE_AGENTS[number]["id"];

export function AgentSelector({ children }: { children: React.ReactNode }) {
  const [selectedAgent, setSelectedAgent] = useState<AgentId>("stockAgent");

  return (
    <div className="min-h-screen">
      {/* Agent Selector Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Agent Selector</h1>
              <p className="text-sm text-gray-600">Choose which agent to interact with</p>
            </div>
            <div className="flex gap-2">
              {AVAILABLE_AGENTS.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedAgent === agent.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  title={agent.description}
                >
                  {agent.name}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Current Agent: <span className="font-medium">{AVAILABLE_AGENTS.find(a => a.id === selectedAgent)?.name}</span>
            {" - "}
            {AVAILABLE_AGENTS.find(a => a.id === selectedAgent)?.description}
          </div>
        </div>
      </div>

      {/* CopilotKit Provider with selected agent */}
      <CopilotKit runtimeUrl="/api/copilotkit" agent={selectedAgent}>
        {children}
      </CopilotKit>
    </div>
  );
}
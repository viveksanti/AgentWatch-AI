export type Agent = {
  id: string; name: string; type: string; description: string; systemPrompt: string;
  provider: string; model: string; temperature: number; status: "ACTIVE" | "PAUSED";
  createdAt: string; updatedAt: string; executions?: Execution[];
};

export type Execution = {
  id: string; agentId: string; status: "SUCCESS" | "FAILED"; task: string;
  output: string | null; model: string; latency: number; tokens: number;
  cost: number; error: string | null; createdAt: string;
  agent?: Pick<Agent, "name" | "type">;
};

export type Overview = {
  agents: number; activeAgents: number; executions: number; successRate: number;
  runtimeMode: "LIVE" | "SIMULATION";
  avgLatency: number; totalTokens: number; totalCost: number;
  statuses: Record<string, number>; latestExecutions: Execution[];
  timeline: { time: string; latency: number; tokens: number; success: number }[];
};

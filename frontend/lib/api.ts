import type { Agent, Execution, Overview } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isForm = init?.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...(isForm ? {} : { "Content-Type": "application/json" }), ...init?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    throw new Error(message || `Request failed (${response.status})`);
  }
  return response.json();
}

export const api = {
  overview: () => request<Overview>("/observer/overview"),
  agents: () => request<Agent[]>("/agents"),
  agent: (id: string) => request<Agent>(`/agents/${id}`),
  createAgent: (data: Partial<Agent>) => request<Agent>("/agents", { method: "POST", body: JSON.stringify(data) }),
  updateAgent: (id: string, data: Partial<Agent>) => request<Agent>(`/agents/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteAgent: (id: string) => request<Agent>(`/agents/${id}`, { method: "DELETE" }),
  executions: (limit = 100) => request<Execution[]>(`/executions?limit=${limit}`),
  run: (agentId: string, task: string) => request<Execution>(`/executions/${agentId}/run`, { method: "POST", body: JSON.stringify({ task }) }),
  runDocument: (agentId: string, task: string, file: File) => {
    const form = new FormData(); form.append("task", task); form.append("file", file);
    return request<Execution>(`/executions/${agentId}/run-document`, { method: "POST", body: form });
  },
  testAgent: (agentId: string) => request<{ passed: boolean; checks: Record<string, boolean>; execution: Execution }>(`/executions/${agentId}/test`, { method: "POST", body: JSON.stringify({}) }),
  deleteExecution: (id: string) => request<Execution>(`/executions/${id}`, { method: "DELETE" }),
};

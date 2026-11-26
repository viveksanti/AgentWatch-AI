"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Agent } from "@/lib/types";
import { Icon } from "@/components/icons";
import {
  Empty,
  ErrorBanner,
  Loading,
  PageHeader,
  Status,
} from "@/components/ui";

const blank = {
  name: "",
  type: "Assistant",
  description: "",
  systemPrompt: "You are a helpful AI agent.",
  provider: "openai",
  model: "gpt-4.1-mini",
  temperature: 0.2,
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Partial<Agent> | null>(null);
  const [saving, setSaving] = useState(false);
  const load = useCallback(() => {
    api
      .agents()
      .then(setAgents)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      await (editing.id
        ? api.updateAgent(editing.id, editing)
        : api.createAgent(editing));
      setEditing(null);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }
  async function toggle(agent: Agent) {
    await api.updateAgent(agent.id, {
      status: agent.status === "ACTIVE" ? "PAUSED" : "ACTIVE",
    });
    load();
  }
  async function remove(agent: Agent) {
    if (!confirm(`Delete ${agent.name} and all its execution history?`)) return;
    await api.deleteAgent(agent.id);
    load();
  }
  return (
    <div className="page">
      <PageHeader
        eyebrow="AI workforce"
        title="Agents"
        description="Create, configure, and manage the agents doing your work."
        action={
          <button className="button primary" onClick={() => setEditing(blank)}>
            <Icon name="plus" />
            New agent
          </button>
        }
      />
      {error && <ErrorBanner message={error} />}{" "}
      {loading ? (
        <Loading />
      ) : agents.length === 0 ? (
        <Empty
          title="No agents yet"
          text="Create your first agent to begin running AI tasks."
        />
      ) : (
        <div className="agent-grid">
          {agents.map((agent) => (
            <article className="agent-card card" key={agent.id}>
              <div className="agent-top">
                <div className="agent-avatar">
                  {agent.name.slice(0, 2).toUpperCase()}
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  {agent.demo && <span className="demo-badge">Demo</span>}
                  <Status value={agent.status} />
                </div>
              </div>
              <h2>{agent.name}</h2>
              <span className="agent-type">{agent.type}</span>
              <p>{agent.description || "No description provided."}</p>
              <div className="agent-meta">
                <div>
                  <span>Model</span>
                  <code>{agent.model}</code>
                </div>
                <div>
                  <span>Temperature</span>
                  <strong>{agent.temperature}</strong>
                </div>
                <div>
                  <span>Runs</span>
                  <strong>{agent.executions?.length ?? 0}</strong>
                </div>
              </div>
              <div className="agent-actions">
                <button
                  className="button subtle"
                  onClick={() => setEditing(agent)}
                >
                  Configure
                </button>
                {!agent.demo && (
                  <button className="button ghost" onClick={() => toggle(agent)}>
                    {agent.status === "ACTIVE" ? "Pause" : "Resume"}
                  </button>
                )}
                {!agent.demo && (
                  <button
                    className="icon-button danger"
                    aria-label="Delete agent"
                    onClick={() => remove(agent)}
                  >
                    <Icon name="trash" />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {editing && (
        <div className="modal-backdrop" onMouseDown={() => setEditing(null)}>
          <form
            className="modal"
            onSubmit={save}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="eyebrow">Agent configuration</span>
                <h2>{editing.id ? "Edit agent" : "Create an agent"}</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setEditing(null)}
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="form-grid">
              <label>
                Name
                <input
                  required
                  minLength={2}
                  value={editing.name ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  placeholder="Research analyst"
                />
              </label>
              <label>
                Type
                <input
                  required
                  value={editing.type ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, type: e.target.value })
                  }
                  placeholder="Assistant"
                />
              </label>
              <label className="full">
                Description
                <input
                  value={editing.description ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  placeholder="What is this agent responsible for?"
                />
              </label>
              <label>
                Provider
                <select
                  value={editing.provider ?? "openai"}
                  onChange={(e) =>
                    setEditing({ ...editing, provider: e.target.value })
                  }
                >
                  <option value="openai">OpenAI</option>
                </select>
              </label>
              <label>
                Model
                <input
                  required
                  value={editing.model ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, model: e.target.value })
                  }
                />
              </label>
              <label className="full">
                System prompt
                <textarea
                  required
                  rows={5}
                  value={editing.systemPrompt ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, systemPrompt: e.target.value })
                  }
                />
              </label>
              <label className="full">
                Temperature <span>{editing.temperature}</span>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={editing.temperature ?? 0.2}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      temperature: Number(e.target.value),
                    })
                  }
                />
              </label>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="button ghost"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button className="button primary" disabled={saving}>
                {saving ? "Saving…" : "Save agent"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

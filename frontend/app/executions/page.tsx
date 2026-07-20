"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Agent, Execution } from "@/lib/types";
import { Icon } from "@/components/icons";
import {
  Empty,
  ErrorBanner,
  ExecutionTable,
  Loading,
  PageHeader,
  Status,
} from "@/components/ui";

const taskTemplates = (agent?: Agent) => {
  const role = `${agent?.name ?? ""} ${agent?.type ?? ""}`.toLowerCase();
  if (/recruit|resume/.test(role)) return ["Compare the attached resume with this job description. Return a fit score, matching evidence, gaps, risks, and interview questions.", "Create a structured candidate summary from the attached resume.", "Identify the strongest and weakest evidence for this candidate against the role."];
  if (/code|engineer|review/.test(role)) return ["Review the supplied design for correctness, security, scalability, and maintainability. Prioritize the findings.", "Create a test plan covering success, validation, failure, and edge-case paths.", "Explain the likely root causes of this error and propose a safe fix."];
  if (/content|creative|writer/.test(role)) return ["Draft a concise product launch announcement for the supplied audience and value proposition.", "Rewrite the attached content for clarity, specificity, and stronger structure.", "Create three campaign concepts with headline, message, and call to action."];
  if (/support|operations/.test(role)) return ["Draft an empathetic support response with clear next steps and no unsupported promises.", "Summarize this incident and produce a customer update plus internal follow-up actions.", "Turn the attached support conversation into a concise escalation brief."];
  if (/research/.test(role)) return ["Research the topic, separate facts from assumptions, compare options, and recommend next steps.", "Summarize the attached document into findings, risks, and actions.", "Create a decision brief comparing three practical approaches."];
  return ["Analyze this request according to your assigned role and return findings, risks, and recommended actions."];
};

export default function ExecutionsPage() {
  const [rows, setRows] = useState<Execution[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [selected, setSelected] = useState<Execution | null>(null);
  const [runner, setRunner] = useState(false);
  const [agentId, setAgentId] = useState("");
  const [task, setTask] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [testResult, setTestResult] = useState("");
  const load = useCallback(() => {
    Promise.all([api.executions(200), api.agents()])
      .then(([runs, list]) => {
        setRows(runs);
        setAgents(list);
        setAgentId((current) => current || list[0]?.id || "");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (status === "ALL" || r.status === status) &&
          `${r.task} ${r.agent?.name} ${r.model}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [rows, status, query],
  );
  async function run(e: FormEvent) {
    e.preventDefault();
    setRunning(true);
    setError("");
    try {
      const result = file
        ? await api.runDocument(agentId, task, file)
        : await api.run(agentId, task);
      setRunner(false);
      setTask("");
      setFile(null);
      setSelected(result);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRunning(false);
    }
  }
  async function testAgent() {
    if (!agentId) return;
    setRunning(true);
    setTestResult("");
    setError("");
    try {
      const result = await api.testAgent(agentId);
      setTestResult(
        result.passed
          ? "Agent test passed: execution completed and returned output."
          : "Agent test failed. Open its execution for diagnostics.",
      );
      setSelected(result.execution);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRunning(false);
    }
  }
  async function remove(id: string) {
    await api.deleteExecution(id);
    setSelected(null);
    load();
  }
  const currentAgent = agents.find((agent) => agent.id === agentId);
  const templates = taskTemplates(currentAgent);
  return (
    <div className="page">
      <PageHeader
        eyebrow="Run history"
        title="Executions"
        description="Run tasks with documents and inspect every response, metric, and failure."
        action={
          <button
            className="button primary"
            onClick={() => setRunner(true)}
            disabled={!agents.length}
          >
            <Icon name="play" />
            Run a task
          </button>
        }
      />
      {error && <ErrorBanner message={error} />}
      <div className="toolbar card">
        <div className="search">
          <Icon name="search" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, agents, or models"
          />
        </div>
        <div className="tabs">
          {["ALL", "SUCCESS", "FAILED"].map((x) => (
            <button
              key={x}
              className={status === x ? "active" : ""}
              onClick={() => setStatus(x)}
            >
              {x === "ALL" ? "All runs" : x.toLowerCase()}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <Loading />
      ) : filtered.length ? (
        <div className="card">
          <ExecutionTable rows={filtered} onSelect={setSelected} />
        </div>
      ) : (
        <Empty
          title="No matching executions"
          text={
            rows.length
              ? "Try changing your filters."
              : "Run a task with one of your active agents."
          }
        />
      )}
      {runner && (
        <div className="modal-backdrop" onMouseDown={() => setRunner(false)}>
          <form
            className="modal run-modal"
            onSubmit={run}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="eyebrow">New execution</span>
                <h2>Run or test an agent</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setRunner(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            <label>
              Agent
              <select
                required
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
              >
                {agents
                  .filter((a) => a.status === "ACTIVE")
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} · {a.model}
                    </option>
                  ))}
              </select>
            </label>
            <div className="assigned-tasks">
              <span>Assigned task examples for {currentAgent?.name ?? "this agent"}</span>
              <div>{templates.map((template) => <button type="button" key={template} onClick={() => setTask(template)}>{template}</button>)}</div>
            </div>
            <label>
              Task
              <textarea
                autoFocus
                required
                minLength={1}
                rows={6}
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Example: Compare this resume with the senior backend engineer role and report fit, gaps, and interview questions."
              />
            </label>
            <label>
              Document{" "}
              <span className="optional">
                Optional · PDF, DOCX, TXT, or MD · max 5 MB
              </span>
              <div className="file-picker">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <span>{file ? file.name : "Choose a resume or document"}</span>
              </div>
            </label>
            {testResult && <div className="test-result">{testResult}</div>}
            <div className="modal-actions">
              <button
                type="button"
                className="button subtle"
                onClick={testAgent}
                disabled={running || !agentId}
              >
                Smoke test
              </button>
              <span className="modal-spacer" />
              <button
                type="button"
                className="button ghost"
                onClick={() => setRunner(false)}
              >
                Cancel
              </button>
              <button
                className="button primary"
                disabled={running || !agentId || !task}
              >
                {running
                  ? "Running…"
                  : file
                    ? "Run with document"
                    : "Start execution"}
              </button>
            </div>
          </form>
        </div>
      )}
      {selected && (
        <div className="drawer-backdrop" onMouseDown={() => setSelected(null)}>
          <aside className="drawer" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="eyebrow">Execution detail</span>
                <h2>{selected.agent?.name ?? "Agent run"}</h2>
              </div>
              <button className="icon-button" onClick={() => setSelected(null)}>
                <Icon name="close" />
              </button>
            </div>
            <Status value={selected.status} />
            <section>
              <span className="field-label">Task</span>
              <p className="content-box">{selected.task}</p>
            </section>
            <section>
              <span className="field-label">Output</span>
              <pre className="content-box output">
                {selected.output || selected.error || "No output returned."}
              </pre>
            </section>
            <div className="detail-grid">
              <div>
                <span>Model</span>
                <strong>{selected.model}</strong>
              </div>
              <div>
                <span>Latency</span>
                <strong>{selected.latency} ms</strong>
              </div>
              <div>
                <span>Tokens</span>
                <strong>{selected.tokens}</strong>
              </div>
              <div>
                <span>Cost</span>
                <strong>${selected.cost.toFixed(4)}</strong>
              </div>
            </div>
            <button
              className="button danger-button"
              onClick={() => remove(selected.id)}
            >
              <Icon name="trash" />
              Delete execution
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}

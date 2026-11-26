"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

// ── Quick Try ─────────────────────────────────────────────────────────────────
const QUICK_SCENARIOS = [
  {
    label: "Recruit a candidate",
    agent: "Resume Recruiter",
    emoji: "🧑‍💼",
    task: "Evaluate this candidate for a senior backend engineer role at a fintech startup. The ideal hire has 5+ years with Node.js, TypeScript, PostgreSQL, and cloud deployments. They need strong API design skills and experience with high-availability systems.\n\nCandidate summary: 7 years of backend experience across two startups and one enterprise company. Built and maintained REST and GraphQL APIs using Node.js and TypeScript. Led a team of three engineers, introduced CI/CD pipelines, and migrated a legacy PHP monolith to a microservice architecture on AWS. Proficient in PostgreSQL and Redis. Some experience with Kubernetes. No formal computer science degree but completed a software engineering bootcamp in 2017.",
  },
  {
    label: "Research a topic",
    agent: "Research Scout",
    emoji: "🔎",
    task: "Compare three approaches to reducing AI model hallucinations in production: retrieval-augmented generation (RAG), fine-tuning on domain data, and prompt engineering with strict output schemas. For each approach, summarize how it works, its main trade-offs, typical implementation cost, and the scenario it fits best. Close with a recommended starting point for a small engineering team.",
  },
  {
    label: "Write product copy",
    agent: "Content Studio",
    emoji: "✍️",
    task: "Write a product launch announcement for AgentWatch — an AI operations dashboard that lets teams create agents, run tasks, and monitor every execution with built-in observability. Audience: engineering managers and CTOs at software companies with 20–200 people. Tone: confident and clear, not hype-driven. Include a headline, a 60-word body, and a call to action. Avoid buzzwords like 'revolutionize' or 'game-changer'.",
  },
  {
    label: "Review some code",
    agent: "Code Reviewer",
    emoji: "🛠️",
    task: "Review this API endpoint design for security and correctness issues:\n\nPOST /api/users/:id/promote\n- Accepts { role: string } in the body\n- Fetches the user by ID from the database\n- Updates their role to the supplied value\n- No authentication middleware on this route\n- No validation on the role field\n- Returns the updated user object including password hash\n\nIdentify each risk, explain the impact, and suggest a corrected implementation.",
  },
  {
    label: "Draft a support reply",
    agent: "Support Copilot",
    emoji: "💬",
    task: "A customer named Sarah has emailed to report that she was charged twice for the same monthly subscription. She tried to cancel her plan three weeks ago and says she received a confirmation email, but her card was still billed. She is frustrated and says she will dispute the charges with her bank if she does not hear back today. Draft an empathetic, professional response that acknowledges the issue, explains the next steps for investigation, and sets a realistic timeline for resolution.",
  },
];

function QuickTry({ agents, onDone }: { agents: Agent[]; onDone: (ex: Execution) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [task, setTask] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Execution | null>(null);
  const [err, setErr] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);

  function pick(idx: number) {
    setPicked(idx);
    setTask(QUICK_SCENARIOS[idx].task);
    setResult(null);
    setErr("");
  }

  async function run() {
    if (picked === null || !task.trim()) return;
    const scenario = QUICK_SCENARIOS[picked];
    const agent = agents.find((a) => a.status === "ACTIVE" && a.name === scenario.agent)
      ?? agents.find((a) => a.status === "ACTIVE");
    if (!agent) { setErr("No active agents found."); return; }
    setRunning(true);
    setResult(null);
    setErr("");
    try {
      const ex = await api.run(agent.id, task);
      setResult(ex);
      onDone(ex);
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setRunning(false);
    }
  }

  const scenario = picked !== null ? QUICK_SCENARIOS[picked] : null;

  return (
    <div className="quick-try card">
      <div className="qt-head">
        <div>
          <span className="eyebrow">Interactive demo</span>
          <h2>Try it yourself</h2>
          <p>Pick an agent, edit the task however you like, then hit Run.</p>
        </div>
        <span className="qt-badge">Simulation mode · no API key needed</span>
      </div>
      <div className="qt-grid">
        {QUICK_SCENARIOS.map((s, i) => (
          <button
            key={i}
            className={`qt-card${picked === i ? " qt-selected" : ""}`}
            onClick={() => pick(i)}
            disabled={running}
          >
            <span className="qt-emoji">{s.emoji}</span>
            <strong>{s.label}</strong>
            <span className="qt-agent">{s.agent}</span>
          </button>
        ))}
      </div>
      {scenario && (
        <div className="qt-compose">
          <div className="qt-compose-head">
            <span className="qt-compose-label">{scenario.emoji} {scenario.agent}</span>
            <span className="qt-compose-hint">Edit the task or write your own</span>
          </div>
          <textarea
            className="qt-textarea"
            rows={5}
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Describe what you want the agent to do…"
            disabled={running}
            autoFocus
          />
          {err && <div className="error-banner" style={{ margin: "6px 0 0" }}>{err}</div>}
          <button
            className="button primary qt-run-btn"
            onClick={run}
            disabled={running || !task.trim()}
          >
            {running ? "Running…" : `Run with ${scenario.agent} →`}
          </button>
        </div>
      )}
      {result && (
        <div className="qt-output" ref={outputRef}>
          <div className="qt-output-head">
            <span className="field-label">Response from {result.agent?.name}</span>
            <div className="qt-meta">
              <span><strong>{result.model}</strong></span>
              <span><strong>{result.latency.toLocaleString()} ms</strong></span>
              <span><strong>{result.tokens}</strong> tokens</span>
              <span className={`status ${result.status.toLowerCase()}`}><i />{result.status}</span>
            </div>
          </div>
          <pre className="content-box output">{result.output || result.error || "No output."}</pre>
          <button className="button subtle qt-again-btn" onClick={() => { setResult(null); setErr(""); }}>
            ↩ Try again with a different task
          </button>
        </div>
      )}
    </div>
  );
}

// ── Build Your Own Agent ───────────────────────────────────────────────────────
const AGENT_TEMPLATES = [
  { emoji: "📧", label: "Email drafter", type: "Assistant", systemPrompt: "You are a professional email writer. Draft clear, concise, and appropriate emails based on the context provided. Match the tone to the audience.", temperature: 0.5 },
  { emoji: "📋", label: "Meeting summarizer", type: "Assistant", systemPrompt: "You are an expert at summarizing meetings and conversations. Extract key decisions, action items, owners, and deadlines. Format output as a structured brief.", temperature: 0.2 },
  { emoji: "🔍", label: "SEO analyst", type: "Research", systemPrompt: "You are an SEO and content analyst. Evaluate content for search intent, keyword usage, structure, and readability. Provide specific, actionable improvements.", temperature: 0.3 },
  { emoji: "⚖️", label: "Contract reviewer", type: "Legal", systemPrompt: "You are a contract review assistant. Identify risks, unusual clauses, missing protections, and obligations. Always note that this is not legal advice.", temperature: 0.1 },
  { emoji: "🎯", label: "Sales coach", type: "Sales", systemPrompt: "You are a sales coach. Analyze pitches, emails, and objections. Suggest improvements to messaging, positioning, and closing techniques.", temperature: 0.6 },
  { emoji: "✏️", label: "Custom (you define it)", type: "Assistant", systemPrompt: "", temperature: 0.4 },
];

function BuildAgent({ onAgentCreated }: { onAgentCreated: (agent: Agent) => void }) {
  const [step, setStep] = useState<"pick" | "configure" | "run">("pick");
  const [templateIdx, setTemplateIdx] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [task, setTask] = useState("");
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Execution | null>(null);
  const [err, setErr] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);

  function pickTemplate(idx: number) {
    const t = AGENT_TEMPLATES[idx];
    setTemplateIdx(idx);
    setName(t.label === "Custom (you define it)" ? "" : t.label);
    setPrompt(t.systemPrompt);
    setErr("");
    setStep("configure");
  }

  async function createAndRun() {
    if (!name.trim() || !prompt.trim() || !task.trim()) return;
    const tpl = templateIdx !== null ? AGENT_TEMPLATES[templateIdx] : AGENT_TEMPLATES[5];
    setSaving(true);
    setErr("");
    try {
      const agent = await api.createAgent({
        name: name.trim(),
        type: tpl.type,
        description: `Created from demo: ${tpl.label}`,
        systemPrompt: prompt.trim(),
        provider: "openai",
        model: "gpt-4.1-mini",
        temperature: tpl.temperature,
      });
      setSaving(false);
      setRunning(true);
      const ex = await api.run(agent.id, task);
      setResult(ex);
      onAgentCreated(agent);
      setStep("run");
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
      setRunning(false);
    }
  }

  function reset() {
    setStep("pick");
    setTemplateIdx(null);
    setName("");
    setPrompt("");
    setTask("");
    setResult(null);
    setErr("");
  }

  return (
    <div className="build-agent card">
      <div className="qt-head">
        <div>
          <span className="eyebrow">Go further</span>
          <h2>Build your own agent</h2>
          <p>Pick a purpose, give it a name, write a first task — your agent is live in seconds.</p>
        </div>
      </div>

      {step === "pick" && (
        <div className="qt-grid ba-grid">
          {AGENT_TEMPLATES.map((t, i) => (
            <button key={i} className="qt-card" onClick={() => pickTemplate(i)}>
              <span className="qt-emoji">{t.emoji}</span>
              <strong>{t.label}</strong>
              <span className="qt-agent">{t.type}</span>
            </button>
          ))}
        </div>
      )}

      {(step === "configure" || step === "run") && (
        <div className="qt-compose">
          {step === "configure" && <>
            <div className="qt-compose-head">
              <span className="qt-compose-label">
                {templateIdx !== null ? AGENT_TEMPLATES[templateIdx].emoji : "✏️"} Configure your agent
              </span>
              <button className="qt-compose-hint ba-back" onClick={reset}>← Change purpose</button>
            </div>
            <div className="ba-fields">
              <label className="ba-label">
                Agent name
                <input
                  className="ba-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My email drafter"
                />
              </label>
              <label className="ba-label">
                System prompt <span className="optional">— tells the agent how to behave</span>
                <textarea
                  className="qt-textarea"
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="You are a helpful assistant that…"
                />
              </label>
              <label className="ba-label">
                First task <span className="optional">— run immediately after creation</span>
                <textarea
                  className="qt-textarea"
                  rows={4}
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="Describe what you want this agent to do right now…"
                />
              </label>
            </div>
            {err && <div className="error-banner" style={{ margin: "6px 0 0" }}>{err}</div>}
            <button
              className="button primary qt-run-btn"
              onClick={createAndRun}
              disabled={saving || running || !name.trim() || !prompt.trim() || !task.trim()}
            >
              {saving ? "Creating agent…" : running ? "Running first task…" : "Create agent & run →"}
            </button>
          </>}

          {step === "run" && result && (
            <div ref={outputRef}>
              <div className="qt-compose-head">
                <span className="qt-compose-label">✅ Agent "{name}" created and ran successfully</span>
                <button className="qt-compose-hint ba-back" onClick={reset}>← Build another</button>
              </div>
              <div className="qt-output-head" style={{ marginTop: 12 }}>
                <span className="field-label">Response</span>
                <div className="qt-meta">
                  <span><strong>{result.model}</strong></span>
                  <span><strong>{result.latency.toLocaleString()} ms</strong></span>
                  <span><strong>{result.tokens}</strong> tokens</span>
                  <span className={`status ${result.status.toLowerCase()}`}><i />{result.status}</span>
                </div>
              </div>
              <pre className="content-box output">{result.output || result.error || "No output."}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const taskProfile = (agent?: Agent) => {
  const role = `${agent?.name ?? ""} ${agent?.type ?? ""}`.toLowerCase();
  if (/recruit|resume/.test(role)) return {
    purpose: "Evaluate a candidate against a specific role",
    templates: ["Compare the attached resume with this job description. Return a fit score, matching evidence, gaps, risks, and interview questions.", "Create a structured candidate summary from the attached resume.", "Identify the strongest and weakest evidence for this candidate against the role."],
    placeholder: "Paste the job description and explain the seniority, required skills, and hiring criteria.",
    attachment: "Candidate resume",
    emptyAttachment: "Choose a resume",
    action: "Evaluate candidate",
  };
  if (/code|engineer|review/.test(role)) return {
    purpose: "Review code, architecture, errors, or technical plans",
    templates: ["Review the supplied design for correctness, security, scalability, and maintainability. Prioritize the findings.", "Create a test plan covering success, validation, failure, and edge-case paths.", "Explain the likely root causes of this error and propose a safe fix."],
    placeholder: "Describe the implementation or error. Include expected behavior, constraints, and the areas that need review.",
    attachment: "Code or technical specification",
    emptyAttachment: "Choose a code or design document",
    action: "Run engineering review",
  };
  if (/content|creative|writer/.test(role)) return {
    purpose: "Create polished content for a defined audience and channel",
    templates: ["Draft a concise product launch announcement for the supplied audience and value proposition.", "Rewrite the attached content for clarity, specificity, and stronger structure.", "Create three campaign concepts with headline, message, and call to action."],
    placeholder: "Describe the audience, channel, goal, tone, key message, and desired call to action.",
    attachment: "Creative brief or source copy",
    emptyAttachment: "Choose a brief or draft",
    action: "Create content",
  };
  if (/support|operations/.test(role)) return {
    purpose: "Turn a customer issue into a clear, empathetic response",
    templates: ["Draft an empathetic support response with clear next steps and no unsupported promises.", "Summarize this incident and produce a customer update plus internal follow-up actions.", "Turn the attached support conversation into a concise escalation brief."],
    placeholder: "Describe the customer issue, what has already happened, relevant policy, and the outcome you can offer.",
    attachment: "Support conversation or incident log",
    emptyAttachment: "Choose a conversation or incident file",
    action: "Draft support response",
  };
  if (/research/.test(role)) return {
    purpose: "Analyze supplied evidence and produce a decision-ready brief",
    templates: ["Analyze this topic, separate supplied facts from assumptions, compare options, and recommend next steps.", "Summarize the attached source into key findings, risks, open questions, and actions.", "Create a decision brief comparing three practical approaches."],
    placeholder: "State the research question, decision to support, known facts, constraints, and comparison criteria.",
    attachment: "Research source or reference material",
    emptyAttachment: "Choose a report or source file",
    action: "Create research brief",
  };
  return {
    purpose: agent?.description || "Complete a task using this agent's configured role",
    templates: ["Analyze this request according to your assigned role and return findings, risks, and recommended actions."],
    placeholder: "Describe the desired outcome, relevant context, constraints, and preferred response format.",
    attachment: "Reference document",
    emptyAttachment: "Choose a reference document",
    action: "Start execution",
  };
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
        setAgentId((current) => current || list.find((agent) => agent.status === "ACTIVE")?.id || "");
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
  const profile = taskProfile(currentAgent);
  return (
    <div className="page">
      <PageHeader
        eyebrow="Try it · Run history"
        title="Executions"
        description="Five agents are ready to use — pick a scenario below, edit it, and run it. Or build your own agent and run a task immediately."
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
      {!loading && agents.length > 0 && (
        <QuickTry agents={agents} onDone={(ex) => { setSelected(ex); load(); }} />
      )}
      {!loading && (
        <BuildAgent onAgentCreated={() => load()} />
      )}
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
                <h2>{currentAgent ? `Run ${currentAgent.name}` : "Run an agent"}</h2>
                <p>{profile.purpose}</p>
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
                onChange={(e) => {
                  setAgentId(e.target.value);
                  setTask("");
                  setFile(null);
                  setTestResult("");
                }}
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
              <span>Tasks designed for {currentAgent?.name ?? "this agent"}</span>
              <div>{profile.templates.map((template) => <button type="button" key={template} onClick={() => setTask(template)}>{template}</button>)}</div>
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
                placeholder={profile.placeholder}
              />
            </label>
            <label>
              {profile.attachment}{" "}
              <span className="optional">
                Optional · PDF, DOCX, TXT, or MD · max 5 MB
              </span>
              <div className="file-picker">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <span>{file ? file.name : profile.emptyAttachment}</span>
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
                    ? `${profile.action} with attachment`
                    : profile.action}
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

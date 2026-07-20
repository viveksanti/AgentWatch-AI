import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

type AgentConfig = { name: string; type?: string; systemPrompt: string; model: string; temperature: number };

@Injectable()
export class AiService {
  async run(agent: AgentConfig, task: string) {
    const started = Date.now();
    if (!process.env.OPENAI_API_KEY || process.env.AI_SIMULATION === 'true') {
      const output = this.simulate(agent, task);
      return { output, latency: Date.now() - started, tokens: Math.ceil((task.length + output.length) / 4), cost: 0 };
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: process.env.OPENAI_BASE_URL });
    const result = await client.chat.completions.create({
      model: agent.model,
      temperature: agent.temperature,
      messages: [{ role: 'system', content: agent.systemPrompt }, { role: 'user', content: task }],
    });
    const tokens = result.usage?.total_tokens ?? 0;
    return { output: result.choices[0]?.message.content ?? '', latency: Date.now() - started, tokens, cost: 0 };
  }

  private simulate(agent: AgentConfig, task: string) {
    const role = `${agent.name} ${agent.type ?? ''}`.toLowerCase();
    if (/recruit|resume|hiring/.test(role)) return this.recruiterReport(task);
    if (/code|engineer|review/.test(role)) return `SIMULATED ENGINEERING REVIEW\n\nSummary\nThe proposed implementation needs explicit validation, authorization boundaries, failure handling, and automated coverage before production use.\n\nPriority findings\n1. Validate and limit all external input at the API boundary.\n2. Keep credentials server-side and add per-user authorization.\n3. Add timeouts, retry limits, structured errors, and request tracing.\n4. Cover success, validation, provider failure, and persistence paths with tests.\n\nRecommended next step\nTurn the request into acceptance criteria, implement the highest-risk controls first, then run integration tests.\n\nTask reviewed\n${this.summary(task)}`;
    if (/content|creative|writer/.test(role)) return `SIMULATED CONTENT DRAFT\n\nHeadline\nSee every AI agent. Understand every run. Improve every outcome.\n\nBody\nAgentWatch gives teams one operational view for configuring agents, running work, inspecting outputs, and tracking reliability. Move from scattered experiments to an observable AI workforce with clear execution history and performance signals.\n\nCall to action\nLaunch your first monitored agent workflow today.\n\nBrief used\n${this.summary(task)}`;
    if (/support|operations/.test(role)) return `SIMULATED SUPPORT RESPONSE\n\nHi there,\n\nI’m sorry the automation failed twice. I understand why you’re concerned about duplicate charges. I’ve documented both attempts for review.\n\nNext steps\n1. Pause further retries while the execution history is checked.\n2. Compare transaction identifiers for both attempts.\n3. If a duplicate charge is confirmed, route it for correction and send a written update.\n\nPlease share the run IDs and approximate times so the investigation can be completed.\n\nRequest summary\n${this.summary(task)}`;
    if (/research|analyst/.test(role)) return `SIMULATED RESEARCH BRIEF\n\nExecutive summary\nThe request has multiple viable approaches. The best choice depends on implementation effort, time to evidence, and data quality.\n\nOptions\n1. Improve onboarding activation: fast to test and directly tied to first value.\n2. Add behavior-based lifecycle messaging: scalable, but depends on reliable event data.\n3. Introduce assisted conversion for high-intent accounts: higher effort, strongest for larger contracts.\n\nRecommendation\nStart with onboarding activation, define one measurable activation event, and run a controlled experiment. Add lifecycle messaging after event quality is verified.\n\nRisks and assumptions\n- Baseline conversion and segment data must be trustworthy.\n- Evaluate results by customer segment, not only in aggregate.\n- This simulated brief does not use external web sources.\n\nTask summary\n${this.summary(task)}`;
    return `SIMULATED ${agent.type?.toUpperCase() ?? 'AGENT'} RESULT\n\nAnalysis\nThe task was received and processed according to the ${agent.name} role. The requested outcome should be reviewed against the supplied business context before action.\n\nRecommended actions\n1. Confirm the desired success criteria.\n2. Validate the source information.\n3. Apply the result and monitor the next execution.\n\nTask summary\n${this.summary(task)}`;
  }

  private recruiterReport(task: string) {
    const skills = ['TypeScript', 'Node.js', 'NestJS', 'PostgreSQL', 'Docker', 'AWS', 'CI/CD', 'testing'].filter((skill) => task.toLowerCase().includes(skill.toLowerCase()));
    return `SIMULATED RECRUITER ASSESSMENT\n\nOverall fit: STRONG (82/100)\nRecommendation: Advance to technical screening\n\nMatching evidence\n${skills.length ? skills.map((skill) => `- Evidence found for ${skill}`).join('\n') : '- Relevant professional experience is present, but the task needs a more specific job description for precise matching.'}\n- Backend service and API delivery experience is demonstrated.\n- Production operations and database experience align with a senior backend role.\n\nGaps to validate\n- Scale, traffic volume, and ownership level are not quantified.\n- System-design decision making needs validation in interview.\n- Leadership and mentoring experience is not clearly evidenced.\n\nSuggested interview questions\n1. Describe a production incident you owned and how you prevented recurrence.\n2. How would you design and evolve a high-volume PostgreSQL-backed API?\n3. Which tradeoffs did you make in a recent distributed-system design?\n4. How do you structure integration and contract testing?\n\nImportant\nThis is a simulated test assessment, not a hiring decision. Use a live model and human review for real recruiting.\n\nTask summary\n${this.summary(task)}`;
  }

  private summary(task: string) {
    return task.split('--- DOCUMENT START ---')[0].replace(/\s+/g, ' ').trim().slice(0, 500);
  }
}

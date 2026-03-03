# time-and-tokens

**A machine to learn how to orchestrate AI coding effectively.**

This repository is a rigorous benchmarking framework for measuring and comparing AI agentic coding methodologies. We are not benchmarking the LLMs themselves — we are benchmarking the **workflows**: state management (Markdown PRDs vs. Beads), verification loops (TDD, Shift-Left linting), and orchestration (Headless loops, Agent Teams).

The target application is **TinkeringChef**, a highly-scoped web app that serves as the constant across all experiments. The only variables are *how* we instruct the AI to build it.

## Metrics

Every run is measured across three axes:

| Axis | How We Measure |
|---|---|
| **Human Time** | Manual stopwatch — wall-clock time the human spends steering, reviewing, and unblocking |
| **Token Efficiency / Cost** | OpenTelemetry collector capturing Claude Code's OTLP traces, exported to JSON |
| **Code Quality** | `scc` (LOC & complexity), linters (ESLint/golangci-lint), test coverage (`vitest`/`lcov`) |

## Branching Strategy

```
main
 ├── specs/          # PRD, mocks, and app specification (constant across runs)
 ├── scripts/        # OTEL infra, quality measurement scripts
 └── README.md       # This file — the dashboard

Branches (all off main):
 ├── level-1.0       # Monolithic PRD baseline
 ├── level-1.1       # + Repo Mapping (Aider RepoMap / Context7)
 ├── level-1.2       # + CLAUDE.md style & memory
 ├── level-1.3       # + Custom skills & slash commands
 ├── level-2.0       # Beads graph-based state
 ├── level-2.1       # Native Claude Code Tasks
 ├── level-3.0       # TDD/BDD quality gates
 ├── ...
 └── level-6.0       # GasTown factory orchestration
```

`main` holds the specification and framework. Each methodology gets its own branch off `main`. Results are aggregated in the table below.

---

## Benchmark Runs

| Level | Methodology | Human Time | Human Interventions | LLM Time | Tokens (In / Out / Cache) | Cost ($) | LOC & Complexity | Test Coverage % | Vibe Score (1-10) |
|-------|------------|------------|---------------------|----------|---------------------------|----------|------------------|-----------------|-------------------|
| 1.0 | Monolithic PRD | — | — | — | — | — | — | — | — |
| 1.1 | + Repo Mapping | — | — | — | — | — | — | — | — |
| 1.2 | + Style & Memory | — | — | — | — | — | — | — | — |
| 1.3 | + Specialized Tooling | — | — | — | — | — | — | — | — |
| 2.0 | Beads (Graph State) | — | — | — | — | — | — | — | — |
| 2.1 | Native Tasks | — | — | — | — | — | — | — | — |
| 3.0 | TDD/BDD Quality Gates | — | — | — | — | — | — | — | — |
| 3.1 | Verification Engine | — | — | — | — | — | — | — | — |
| 3.2 | Test Density & Timing | — | — | — | — | — | — | — | — |
| 4.0 | Agent Teams | — | — | — | — | — | — | — | — |
| 4.1 | Custom Personas | — | — | — | — | — | — | — | — |
| 4.2 | Adversarial Review | — | — | — | — | — | — | — | — |
| 5.0 | Headless Loop | — | — | — | — | — | — | — | — |
| 5.1 | External Orchestrator | — | — | — | — | — | — | — | — |
| 5.2 | Native Headless (Ralph) | — | — | — | — | — | — | — | — |
| 6.0 | GasTown Factory | — | — | — | — | — | — | — | — |

> **Human Interventions** = the number (and approximate token size) of manual inputs the human provides to steer the agent during a run. Lower is better.
>
> **Vibe Score** = subjective frustration-adjusted quality rating. 10 = "shipped it, felt great." 1 = "burned tokens arguing with a wall."

---

## Agentic Engineering Levels

### Level 1: The Monolithic Baseline (Context & Memory Optimization)

**The Jump:** Proving out the standard "modern" AI workflow. Feed the agent a massive Markdown PRD and mocks, then measure how efficiently it chews through the spec without explicit task tracking.

**Core Setup:** A single comprehensive `specs/PRD.md`. No Beads. Manual interactive steering via Claude Code CLI.

| Variation | What Changes | Key Question |
|-----------|-------------|--------------|
| **1.0 — Baseline** | Raw PRD + mocks, vanilla Claude Code | How far does a monolithic spec get us? |
| **1.1 — Repo Mapping** | Add [Aider RepoMap](https://aider.chat/docs/repomap.html) or [Context7 MCP](https://github.com/upstash/context7) | Does injecting a compressed AST/structural map reduce tokens burned on blind file exploration? |
| **1.2 — Style & Memory** | Introduce a strict `CLAUDE.md` coding style guide. Save architectural decisions back to it. | Does persistent memory prevent the agent from hallucinating context in later turns? |
| **1.3 — Specialized Tooling** | Inject custom [Skills/Slash Commands](https://docs.anthropic.com/en/docs/claude-code), [HumanLayer](https://github.com/humanlayer/humanlayer) integrations for approvals, DB seeding tools | What is the token offset of giving the agent exact tools vs. letting it write bash scripts? |

### Level 2: Discrete State Management (Graph over Markdown)

**The Jump:** Throwing away the monolithic PRD to stop the agent from constantly re-reading the entire project scope. Move to strict, graph-based state.

| Variation | What Changes | Key Question |
|-----------|-------------|--------------|
| **2.0 — Beads** | [steveyegge/beads](https://github.com/steveyegge/beads) — pure dependency graph, discrete state properties | Does graph-based state tracking reduce token waste from context re-reads? |
| **2.1 — Native Tasks** | Swap Beads for [Claude Code native Tasks](https://docs.anthropic.com/en/docs/claude-code) | How does Anthropic's native implementation compare to the rigid structure of Beads in token efficiency and state-loss? |

### Level 3: Automated Quality Gates (Advanced Backpressure)

**The Jump:** Removing subjective human review from the implementation phase. The agent must use test failures to steer itself — a Bead/Task is not done until the objective gate passes.

| Variation | What Changes | Key Question |
|-----------|-------------|--------------|
| **3.0 — TDD/BDD Gates** | Strict test-first development. Agent loops on red/green/refactor. | How many tokens does test-driven self-correction cost vs. human-in-the-loop review? |
| **3.1 — Verification Engine** | Compare CLI test runners ([Vitest](https://vitest.dev/), `go test`) vs. [Playwright MCP](https://github.com/anthropics/anthropic-quickstarts) / raw Playwright for UI verification against mocks | Is visual verification more token-efficient than DOM-based assertions? |
| **3.2 — Test Density & Timing** | Branch A: 10 heavy E2E tests. Branch B: 100 integration tests. Branch C: 500 micro unit tests. | What is the token cost of parsing massive E2E stack traces vs. the time cost of running hundreds of unit tests on every save? |

### Level 4: Multi-Agent Collaboration (Specialization)

**The Jump:** Splitting cognitive load. Instead of one agent balancing TinkeringChef's database schema and React components, we parallelize.

| Variation | What Changes | Key Question |
|-----------|-------------|--------------|
| **4.0 — Agent Teams** | [Native Agent Teams](https://docs.anthropic.com/en/docs/claude-code). Frontend agent + backend agent, communicating across boundaries. | Does parallelization reduce wall-clock time enough to justify coordination overhead? |
| **4.1 — Custom Personas** | Custom subagents with restricted toolsets (e.g., a DB agent that cannot write to UI directories) | Does hard sandboxing prevent cross-domain hallucination and reduce rework? |
| **4.2 — Adversarial Review** | Dedicated "Reviewer" subagent. Implementing agent must get sign-off before proceeding. | Do tokens spent arguing save tokens later by preventing integration bugs? |

### Level 5: Autonomous Execution (Headless Loops)

**The Jump:** Step away from the keyboard entirely. The machine runs execution, test, and retry loops without a human pressing Enter.

| Variation | What Changes | Key Question |
|-----------|-------------|--------------|
| **5.0 — Headless Loop** | Continuous loop feeding test stdout/stderr back into Claude until a completion sigil is emitted. | What is the failure mode when the agent gets stuck without human intervention? |
| **5.1 — External Orchestrator** | Raw Bash/Python script wrapping the CLI, managing loop state externally (the original "Ralph" concept) | How much overhead does external process management add? |
| **5.2 — Native Headless (Ralph)** | Official [Claude Code headless mode](https://docs.anthropic.com/en/docs/claude-code) | Is Anthropic's internal loop handling faster or cheaper than an external script tearing down and rebuilding the CLI? |

### Level 6: Factory Orchestration (GasTown)

**The Jump:** Steve Yegge's endgame. Scaling from a single autonomous loop to a full-blown AI software factory.

| Variation | What Changes | Key Question |
|-----------|-------------|--------------|
| **6.0 — GasTown** | [GasTown orchestrator](https://github.com/steveyegge/gastown). A "Mayor" agent delegates parallel workstreams to workers, handling merge conflicts, branch management, and dependency resolution autonomously. | Does the orchestration overhead (managing workers, resolving git conflicts between autonomous agents) cost more tokens than it saves in wall-clock time for a scoped app like TinkeringChef? |

---

## Repository Layout

```
time-and-tokens/
├── README.md                  # This file — project dashboard
├── specs/
│   ├── PRD.md                 # TinkeringChef product requirements
│   └── mocks/                 # UI mockups and wireframes
├── scripts/
│   ├── otel-config.yaml       # OpenTelemetry collector configuration
│   ├── start-otel.sh          # Launch OTEL collector in Docker
│   └── measure-quality.sh     # Run scc, linters, coverage
├── output/                    # Telemetry output (gitignored)
└── src/                       # Generated application code (per-branch)
```

## Getting Started

### 1. Start the telemetry collector

```bash
./scripts/start-otel.sh
```

Then export the environment variables it prints before launching Claude Code.

### 2. Run a benchmark

```bash
git checkout -b level-1.0 seed-state
# ... run Claude Code against specs/PRD.md ...
```

### 3. Measure quality

```bash
./scripts/measure-quality.sh
```

### 4. Record results

Fill in the benchmark table above and commit to `main`.

---

## Publishing

Detailed blog posts, architectural breakdowns, methodology deep-dives, and comparative graphs will be published via **GitHub Pages** at this repository's site. Each level will get a dedicated write-up covering:

- Setup and configuration
- Raw telemetry data and token breakdowns
- Qualitative observations and failure modes
- Side-by-side comparisons with adjacent levels

---

*Built by [li0nel](https://github.com/li0nel) as an empirical investigation into the emerging discipline of Agentic Software Engineering.*

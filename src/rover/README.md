# Rover 2.0 — Autonomous Work OS (core)

This directory is the domain layer that turns Rover from an "ask AI" product
into an **Autonomous Work OS**: users provide an *outcome*, and Rover plans the
work, runs specialized agents through explicit tools, verifies the result, asks
for approval when it matters, and produces a real, reversible outcome.

## The loop

```
GOAL → INTENT → PLAN → AGENTS → TOOLS (+FIREWALL) → EVIDENCE → VERIFY → OUTCOME
```

## Modules

| File | Responsibility |
| --- | --- |
| `types.ts` | The full domain model (Mission, Intent, AgentRun, ToolCall, Evidence, Approval, VerificationReport, …). |
| `store.ts` | `RoverStore` + a swappable `PersistenceProvider`. Default `LocalStorageProvider` persists client-side; implement the interface to connect a real backend — no call sites change. |
| `seed.ts` | Seeds initial state from the existing workspace mock data. |
| `agents.ts` | Built-in specialized agents. Each declares its **allowed tools**, **knowledge scope**, and **auto-approve risk ceiling**. No agent has unrestricted access. |
| `intent.ts` | `IntentEngine` — extracts goal / objectives / constraints / success criteria. Local deterministic impl behind an interface. |
| `tools.ts` | The **only** way agents touch the workspace. Each `ToolDef` declares a risk level, executes against the real store, returns evidence, and (for mutations) captures **undo ops**. |
| `firewall.ts` | The **Agent Firewall**: every tool call is gated by permission + risk policy. Anything above an agent's ceiling produces a pending Approval instead of executing. |
| `verify.ts` | The **Verification Engine**: a Reviewer maps each success criterion to real evidence/work and reports pass/fail. Success ≠ "the tool ran". |
| `runtime.ts` | `AgentRuntime` — plan → firewall → execute → collect evidence → artifact → verify. Persists AgentRun / ToolCall / Artifact / Message. |
| `planner.ts` | Turns an Intent into a concrete plan: mission steps + per-step agent + real tool calls. |
| `orchestrator.ts` | Top-level control loop: `createMission` → `runMission` → approvals → `resumeMission` → verify → mission state/progress. Plus `undoRun` and `cancelMission`. |

## Swapping in real providers

Nothing here is faked. Where a real backend/model is not yet connected, the
seam is an **interface** with a working local implementation:

- Persistence → `PersistenceProvider` (`store.ts`)
- Intent → `IntentEngine` (`intent.ts`)
- Execution → `AgentRuntime` (`runtime.ts`)
- Verification → `Verifier` (`verify.ts`)

Replace the local implementation with a model-/API-backed one without touching
the orchestrator or UI.

## Safety guarantees

- Agents act **only** through tools they are explicitly granted.
- Every tool call passes the **firewall** (permission + risk).
- HIGH/CRITICAL actions require **human approval** before executing.
- Every action is **observable** (persisted tool calls, run log, activity, evidence).
- Mutations are **reversible** via `undoRun`.

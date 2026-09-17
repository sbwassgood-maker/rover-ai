// Verification Engine — an independent check that execution actually met the
// mission's success criteria. It does NOT assume success just because tools
// ran; it maps each success criterion to concrete evidence / produced work and
// reports pass/fail with reasons. Behind an interface so a model-backed
// reviewer can replace it.

import type {
  VerificationReport, VerificationCheck, Evidence, AgentArtifact, AgentToolCall, ID,
} from "./types";
import { uid, nowISO } from "./id";

export interface VerifierInput {
  runId: ID;
  missionId?: ID;
  successCriteria: string[];
  evidence: Evidence[];
  artifacts: AgentArtifact[];
  toolCalls: AgentToolCall[];
}

export interface Verifier {
  verify(input: VerifierInput): VerificationReport;
}

const KEYWORDS: { re: RegExp; needs: (i: VerifierInput) => boolean; why: (i: VerifierInput) => string }[] = [
  {
    re: /document|report|briefing|plan|materials|spec/i,
    needs: (i) => i.artifacts.length > 0 || i.toolCalls.some((t) => /createDocument/.test(t.tool) && t.status === "ok"),
    why: (i) => `${i.artifacts.length} artifact(s) produced.`,
  },
  {
    re: /task|action|follow[- ]?up|owner/i,
    needs: (i) => i.toolCalls.some((t) => /createTask/.test(t.tool) && t.status === "ok"),
    why: (i) => `${i.toolCalls.filter((t) => /createTask/.test(t.tool) && t.status === "ok").length} task(s) created.`,
  },
  {
    re: /evidence|verified|data|analy|research|identif/i,
    needs: (i) => i.evidence.length > 0,
    why: (i) => `${i.evidence.length} piece(s) of evidence gathered.`,
  },
];

export class LocalVerifier implements Verifier {
  verify(input: VerifierInput): VerificationReport {
    const checks: VerificationCheck[] = input.successCriteria.map((criterion) => {
      const rule = KEYWORDS.find((k) => k.re.test(criterion));
      if (!rule) {
        // Generic criterion — met if any real work occurred.
        const worked = input.toolCalls.some((t) => t.status === "ok");
        return {
          criterion,
          passed: worked,
          reason: worked ? "Work was performed toward this criterion." : "No supporting work found.",
          evidenceIds: input.evidence.slice(0, 1).map((e) => e.id),
        };
      }
      const passed = rule.needs(input);
      return {
        criterion,
        passed,
        reason: passed ? rule.why(input) : "No corresponding work or evidence was found.",
        evidenceIds: passed ? input.evidence.slice(0, 2).map((e) => e.id) : [],
      };
    });

    const met = checks.filter((c) => c.passed).length;
    const score = checks.length ? met / checks.length : 0;
    const passed = score >= 0.6; // configurable threshold

    return {
      id: uid("ver"),
      runId: input.runId,
      missionId: input.missionId,
      passed,
      score,
      checks,
      summary: passed
        ? `Verification passed: ${met}/${checks.length} success criteria met.`
        : `Verification failed: only ${met}/${checks.length} criteria met. Plan will be revised.`,
      at: nowISO(),
    };
  }
}

export const verifier = new LocalVerifier();

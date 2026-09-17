// Deterministic mock "AI" responses. No real model is connected — these are
// canned, illustrative answers used to demonstrate the product experience.

export type AIBlock =
  | { type: "text"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "checklist"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "sources"; items: string[] };

export type AIResponse = {
  blocks: AIBlock[];
  sources?: string[];
};

const canned: { match: RegExp; response: AIResponse }[] = [
  {
    match: /attention|need|priorit/i,
    response: {
      blocks: [
        { type: "text", text: "Here's what needs your attention across the workspace:" },
        {
          type: "checklist",
          items: [
            "CRM migration is blocked — API access needed (Mike)",
            "Website redesign has 3 open blockers due Friday",
            "Onboarding proposal is waiting on your review",
          ],
        },
        { type: "text", text: "Two deadlines land this week. Want me to draft owner reminders?" },
      ],
      sources: ["Projects", "Product Strategy Meeting"],
    },
  },
  {
    match: /summar/i,
    response: {
      blocks: [
        { type: "text", text: "I reviewed 18 documents, 6 projects, and this week's meetings. Summary:" },
        {
          type: "list",
          items: [
            "Q4 focus is activation, retention, and expansion.",
            "Launch moved to April 14; beta begins March 20.",
            "Top risk: CRM migration blocking two teams.",
          ],
        },
      ],
      sources: ["Q4 Product Strategy", "Product Strategy Meeting", "Engineering Weekly"],
    },
  },
  {
    match: /project plan|roadmap|launch/i,
    response: {
      blocks: [
        { type: "text", text: "Here's a starting project plan for the launch:" },
        {
          type: "table",
          head: ["Phase", "Owner", "Due"],
          rows: [
            ["Finalize scope", "Alex", "Mar 3"],
            ["Beta release", "Mike", "Mar 20"],
            ["GTM assets", "Maya", "Apr 7"],
            ["Public launch", "Team", "Apr 14"],
          ],
        },
        { type: "text", text: "I can turn this into a project with tasks assigned." },
      ],
      sources: ["Launch Strategy", "Go-to-market Sync"],
    },
  },
  {
    match: /customer|insight|churn|feedback/i,
    response: {
      blocks: [
        { type: "text", text: "Customer signal from the last 30 days:" },
        {
          type: "list",
          ordered: true,
          items: [
            "Onboarding friction — most mentioned theme",
            "Missing integrations — enterprise segment",
            "Pricing confusion — mid-market",
          ],
        },
        { type: "text", text: "Churn ticked up ~8% in Q3, concentrated in the first two weeks." },
      ],
      sources: ["Customer Research", "Support Analysis", "Q3 Retrospective"],
    },
  },
  {
    match: /report|weekly/i,
    response: {
      blocks: [
        { type: "text", text: "Draft weekly report:" },
        {
          type: "list",
          items: [
            "Shipped: workspace dashboard, global search (beta)",
            "In review: onboarding flow, pricing copy",
            "Risks: CRM migration blocked on API access",
          ],
        },
        { type: "text", text: "Insert this into a document or send to leadership?" },
      ],
      sources: ["Engineering Weekly", "Projects"],
    },
  },
];

const fallback: AIResponse = {
  blocks: [
    { type: "text", text: "I searched across your workspace and connected tools. Here's what I found:" },
    {
      type: "list",
      items: [
        "6 documents reference this topic.",
        "2 projects are related and currently active.",
        "1 recent meeting covered a related decision.",
      ],
    },
    { type: "text", text: "Would you like a summary, or should I open the sources?" },
  ],
  sources: ["Q4 Product Strategy", "Product Roadmap", "Customer Research"],
};

export function getAIResponse(prompt: string): AIResponse {
  const found = canned.find((c) => c.match.test(prompt));
  return found ? found.response : fallback;
}

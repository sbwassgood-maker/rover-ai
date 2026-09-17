import { Container, SectionHeading, Reveal } from "@/components/ui/Section";
import { Accordion } from "@/components/ui/Accordion";

const items = [
  { q: "What is Rover AI?", a: "Rover AI is an AI-native workspace that brings your docs, projects, knowledge, databases, and workflows into one place—so your team can find answers, create content, and get work done faster." },
  { q: "How does Rover understand my workspace?", a: "Rover works from the content in your workspace—documents, projects, databases, meeting notes, and connected tools you enable—to answer questions with context and cite its sources." },
  { q: "Can Rover search across my company's information?", a: "Yes. Rover searches your workspace and any connected tools you enable, then returns a direct answer with links to the underlying sources." },
  { q: "Can I create custom AI agents?", a: "You can create agents in plain English, choose which data sources they use, and give them a schedule or run them on demand." },
  { q: "Can Rover take actions for me?", a: "Rover can update pages, create tasks, and execute approved workflows. You decide which actions require your approval before they run." },
  { q: "Can I control what AI can access?", a: "Administrators control what people and AI can access, and which actions require approval—down to individual data sources and integrations." },
  { q: "Does Rover support teams?", a: "Yes. Rover includes shared spaces, comments, mentions, assignments, permissions, and a shared source of truth for the whole team." },
  { q: "What integrations are supported?", a: "Rover is designed to connect with the tools teams already use. The marks shown on this page are generic representations; availability depends on your plan and workspace configuration." },
  { q: "Is Rover secure?", a: "Rover is designed for enterprise security requirements, with encryption, permissions, audit logging, SSO, data controls, and governance over agents and automations." },
  { q: "Can I try Rover for free?", a: "Yes. The Free plan lets individuals explore Rover with a personal workspace and basic AI—no credit card required." },
];

export function FAQ() {
  return (
    <section id="resources" className="scroll-mt-20 py-24 sm:py-32">
      <Container className="max-w-3xl">
        <Reveal>
          <SectionHeading eyebrow="FAQ" title="Questions, answered." />
        </Reveal>
        <Reveal delay={100} className="mt-12">
          <Accordion items={items} />
        </Reveal>
      </Container>
    </section>
  );
}

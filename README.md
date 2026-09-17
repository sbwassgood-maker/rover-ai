# Rover AI

**Your intelligent workspace.** — a premium, AI-native workspace concept that brings
documents, projects, knowledge, databases, search, agents, automations, and meetings
into one place.

This repository contains a polished **marketing website** and an interactive
**authenticated workspace application**, built as a high-fidelity product prototype.

> **Note on data & AI:** All content is illustrative **mock data**, and the "AI"
> responses are **canned, deterministic samples** — no live model or backend is
> connected. Integration marks, testimonials, and company logos are **placeholders**
> to be replaced with real, approved assets before any launch.

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router)
- React 18 + TypeScript
- Tailwind CSS (custom design tokens)
- [lucide-react](https://lucide.dev/) icons
- Inter (via `next/font`)

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
```

## Routes

| Route | Description |
| --- | --- |
| `/` | Marketing landing page (all sections) |
| `/onboarding` | 3-step onboarding flow |
| `/login` | Sign-in screen |
| `/app` | Home dashboard |
| `/app/ask` | Ask Rover — AI chat (accepts `?q=`) |
| `/app/search` | Global search with AI answer + grouped results |
| `/app/agents` | Agent management + agent builder |
| `/app/docs`, `/app/docs/[id]` | Docs list + block editor with slash menu & AI panel |
| `/app/projects` | List / Board / Timeline views |
| `/app/databases` | Table / Board views with "Analyze database" |
| `/app/meetings` | Meeting notes (summary, decisions, action items) |
| `/app/automations` | Workflow builder preview |
| `/app/settings` | Profile, Members, AI, Integrations, Security, … |
| `/app/inbox` | Mentions, assignments, and AI updates |

Press <kbd>⌘K</kbd> / <kbd>Ctrl K</kbd> anywhere in the app for the command palette.

## Project structure

```
src/
  app/                     # routes (marketing + /app workspace)
  components/
    brand/                 # Logo (abstract "R" mark) + Sparkle (AI ✦)
    ui/                    # design-system primitives (Button, Card, Modal, …)
    marketing/             # landing-page sections
    app/                   # workspace shell + page components
  lib/
    mock-data.ts           # illustrative sample data
    ai-mock.ts             # canned AI responses
    utils.ts               # cn() class helper
```

## Design system

- **Colors** — neutral canvas `#F7F7F5`, ink `#0B0B0D`, with a violet AI accent
  `#635BFF` used sparingly. Dark sections use `#0B0B0D`.
- **Logo** — an original, abstract geometric **R** whose leg extends into a
  directional needle (exploration / navigation) with a connection node.
- **AI language** — a consistent ✦ mark denotes every AI surface.
- Respects `prefers-reduced-motion`.

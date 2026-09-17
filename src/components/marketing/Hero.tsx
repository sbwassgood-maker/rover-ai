"use client";
import { useState } from "react";
import { Play } from "lucide-react";
import { Container, Eyebrow, Reveal } from "@/components/ui/Section";
import { ButtonLink, Button } from "@/components/ui/Button";
import { BrowserFrame } from "@/components/ui/BrowserFrame";
import { WorkspacePreview } from "./WorkspacePreview";
import { DemoTour } from "./DemoTour";

export function Hero() {
  const [demoOpen, setDemoOpen] = useState(false);
  return (
    <section className="relative overflow-hidden pt-28 sm:pt-36">
      {/* Ambient backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_20%,transparent_75%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />

      <Container className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <Eyebrow>The intelligent workspace</Eyebrow>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="mt-4 text-display font-semibold text-ink text-balance">
              Everything your team knows. One intelligent workspace.
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted text-balance">
              Rover AI brings your docs, projects, knowledge, and workflows
              together—so you can find answers, create content, and get work
              done faster.
            </p>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href="/onboarding" variant="primary" size="lg">
                Start for free
              </ButtonLink>
              <Button variant="secondary" size="lg" onClick={() => setDemoOpen(true)}>
                <Play className="h-4 w-4" /> Watch demo
              </Button>
            </div>
          </Reveal>
          <Reveal delay={240}>
            <p className="mt-5 text-[13px] text-muted">
              Built for teams that want to work smarter. No credit card required.
            </p>
          </Reveal>
        </div>

        {/* Product visual */}
        <Reveal delay={200} className="relative mt-14 sm:mt-20">
          <div className="pointer-events-none absolute -inset-x-8 -top-6 bottom-0 -z-10 rounded-[32px] bg-gradient-to-b from-accent/10 to-transparent blur-2xl" />
          <BrowserFrame className="mx-auto max-w-5xl">
            <WorkspacePreview />
          </BrowserFrame>
        </Reveal>
      </Container>

      {/* Interactive product tour (opened by "Watch demo").
          To use a real recorded video later, pass videoSrc="/demo.mp4"
          or embedUrl="https://www.youtube.com/embed/…" to <DemoTour />. */}
      <DemoTour open={demoOpen} onClose={() => setDemoOpen(false)} />
    </section>
  );
}

"use client";
import { Play } from "lucide-react";
import { Container, Reveal } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { RoverMark } from "@/components/brand/Logo";
import { useDemo } from "./DemoProvider";

export function FinalCTA() {
  const { openDemo } = useDemo();
  return (
    <section className="px-5 pb-24 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-night px-6 py-20 text-center sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-grid-dark [mask-image:radial-gradient(ellipse_50%_60%_at_50%_50%,#000_10%,transparent_70%)]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-[130px]" />
        <Container className="relative">
          <Reveal>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-night-line bg-night-surface">
              <RoverMark size={30} className="text-white" />
            </div>
            <h2 className="mx-auto mt-8 max-w-2xl text-4xl font-semibold tracking-tight text-white text-balance sm:text-5xl">
              Give your workspace a brain.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-night-muted text-balance">
              Bring your knowledge, projects, documents, and workflows together
              with Rover AI.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href="/onboarding" variant="dark" size="lg">
                Start for free
              </ButtonLink>
              <ButtonLink
                href="#"
                size="lg"
                className="border border-night-line bg-transparent text-white hover:bg-white/5"
              >
                Talk to sales
              </ButtonLink>
            </div>
            <button
              onClick={openDemo}
              className="mx-auto mt-6 inline-flex items-center gap-2 text-[14px] font-medium text-night-muted transition-colors hover:text-white"
            >
              <Play className="h-4 w-4" /> Watch the 30-second demo
            </button>
          </Reveal>
        </Container>
      </div>
    </section>
  );
}

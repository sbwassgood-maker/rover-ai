"use client";
import { createContext, useContext, useState } from "react";
import { DemoTour } from "./DemoTour";

const DemoCtx = createContext<{ openDemo: () => void }>({ openDemo: () => {} });

/** Access the shared product-tour trigger from any marketing component. */
export function useDemo() {
  return useContext(DemoCtx);
}

/**
 * Owns the single product-tour modal for the marketing site so any component
 * (nav, hero, final CTA) can open it via useDemo().openDemo().
 *
 * To use a real recorded video instead of the animated tour, pass
 * videoSrc="/demo.mp4" or embedUrl="https://www.youtube.com/embed/…" here.
 */
export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <DemoCtx.Provider value={{ openDemo: () => setOpen(true) }}>
      {children}
      <DemoTour open={open} onClose={() => setOpen(false)} />
    </DemoCtx.Provider>
  );
}

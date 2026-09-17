"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AskRover } from "@/components/app/AskRover";

function AskInner() {
  const params = useSearchParams();
  const q = params.get("q") ?? undefined;
  return <AskRover initialPrompt={q} />;
}

export default function AskPage() {
  return (
    <Suspense fallback={null}>
      <AskInner />
    </Suspense>
  );
}

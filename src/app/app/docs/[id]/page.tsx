"use client";
import { useParams } from "next/navigation";
import { DocEditor } from "@/components/app/DocEditor";
import { docs } from "@/lib/mock-data";

const defaultBlocks = [
  { id: 1, kind: "h1" as const, text: "Overview" },
  { id: 2, kind: "text" as const, text: "Our Q4 strategy focuses on improving activation, retention, and expansion." },
  { id: 3, kind: "h1" as const, text: "Goals" },
  { id: 4, kind: "check" as const, text: "Increase activation", done: false },
  { id: 5, kind: "check" as const, text: "Reduce churn", done: false },
  { id: 6, kind: "check" as const, text: "Improve onboarding", done: true },
  { id: 7, kind: "quote" as const, text: "Everyone works from the same source of truth, while Rover helps each person move faster." },
];

export default function DocPage() {
  const params = useParams();
  const id = params.id as string;
  const doc = docs.find((d) => d.id === id);
  const title = id === "new" ? "Untitled" : doc?.title ?? "Untitled";

  return (
    <DocEditor
      title={title}
      blocks={
        id === "new"
          ? [{ id: 1, kind: "text", text: "" }]
          : defaultBlocks
      }
    />
  );
}

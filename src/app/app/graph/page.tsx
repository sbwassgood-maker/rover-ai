"use client";
import { useMemo, useState } from "react";
import { PageHeader, PageBody } from "@/components/app/PageHeader";
import { useRoverState } from "@/rover/useRover";
import {
  buildGraph, findRelated, traceDependency, findImpact,
  type GraphNode, type NodeKind,
} from "@/rover/graph";
import { cn } from "@/lib/utils";

const kindColor: Record<NodeKind, string> = {
  workspace: "#0B0B0D",
  member: "#22A06B",
  document: "#635BFF",
  project: "#E6A700",
  task: "#8B7CFF",
  meeting: "#E5484D",
  mission: "#635BFF",
  agent: "#6B6B73",
  run: "#8B7CFF",
  decision: "#22A06B",
  evidence: "#6B6B73",
};

export default function WorkGraphPage() {
  const s = useRoverState();
  const graph = useMemo(() => buildGraph(s), [s]);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [kindFilter, setKindFilter] = useState<NodeKind | "all">("all");

  // Focusable nodes: skip low-signal kinds in the picker
  const focusable = graph.nodes.filter((n) =>
    ["mission", "project", "task", "document", "meeting", "decision"].includes(n.kind) &&
    (kindFilter === "all" || n.kind === kindFilter)
  );

  const related = selected ? findRelated(graph, selected.id) : [];
  const deps = selected ? traceDependency(graph, selected.id) : [];
  const impact = selected ? findImpact(graph, selected.id) : [];

  return (
    <>
      <PageHeader
        title="Work Graph"
        description="Every entity Rover knows about and how they connect. Select a node to trace dependencies and impact."
      />
      <PageBody>
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          {/* Graph canvas */}
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <FilterChip active={kindFilter === "all"} onClick={() => setKindFilter("all")}>All</FilterChip>
              {(["mission", "project", "task", "document", "meeting", "decision"] as NodeKind[]).map((k) => (
                <FilterChip key={k} active={kindFilter === k} onClick={() => setKindFilter(k)} color={kindColor[k]}>
                  {k}
                </FilterChip>
              ))}
            </div>
            <GraphCanvas
              graph={graph}
              focusable={focusable}
              selected={selected}
              onSelect={setSelected}
            />
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-3 text-[11.5px] text-muted">
              {Object.entries(kindColor).filter(([k]) => focusable.some((n) => n.kind === k) || ["member", "agent"].includes(k)).map(([k, c]) => (
                <span key={k} className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: c }} /> {k}
                </span>
              ))}
            </div>
          </div>

          {/* Inspector */}
          <div className="space-y-4">
            {!selected ? (
              <div className="rounded-2xl border border-dashed border-line bg-surface/50 p-6 text-center text-[13px] text-muted">
                Select a node to inspect its connections, dependencies, and downstream impact.
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: kindColor[selected.kind] }} />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">{selected.kind}</span>
                  </div>
                  <h3 className="mt-1.5 text-[15px] font-semibold text-ink">{selected.label}</h3>
                </div>

                <InspectorList title={`Connected (${related.length})`} items={related.map((r) => `${r.node.label}  ·  ${r.via}`)} />
                <InspectorList title={`Depends on (${deps.length})`} items={deps.map((d) => `${d.label} (${d.kind})`)} empty="No dependencies traced." />
                <InspectorList title={`Impact if changed (${impact.length})`} items={impact.map((d) => `${d.label} (${d.kind})`)} empty="Nothing downstream." />
              </>
            )}
          </div>
        </div>
      </PageBody>
    </>
  );
}

function GraphCanvas({
  graph, focusable, selected, onSelect,
}: {
  graph: ReturnType<typeof buildGraph>;
  focusable: GraphNode[];
  selected: GraphNode | null;
  onSelect: (n: GraphNode) => void;
}) {
  // Simple radial layout: central workspace, focusable nodes on a ring.
  const W = 720, H = 420, cx = W / 2, cy = H / 2;
  const ring = Math.min(focusable.length, 18);
  const nodes = focusable.slice(0, 18);
  const positions = new Map<string, { x: number; y: number }>();
  nodes.forEach((n, i) => {
    const a = (i / ring) * Math.PI * 2 - Math.PI / 2;
    const r = 165;
    positions.set(n.id, { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  });
  positions.set(graph.nodes[0]?.id, { x: cx, y: cy });

  // edges between visible nodes
  const visible = new Set([graph.nodes[0]?.id, ...nodes.map((n) => n.id)]);
  const edges = graph.edges.filter((e) => visible.has(e.from) && visible.has(e.to) && e.from !== e.to);
  const highlight = selected ? new Set(findRelated(graph, selected.id).map((r) => r.node.id)) : null;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-canvas/40">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 440 }}>
        {/* center */}
        <circle cx={cx} cy={cy} r={26} fill="#0B0B0D" />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="600">
          {graph.nodes[0]?.label ?? "Workspace"}
        </text>
        {/* edges */}
        {edges.map((e, i) => {
          const a = positions.get(e.from), b = positions.get(e.to);
          if (!a || !b) return null;
          const dim = highlight && !(selected && (e.from === selected.id || e.to === selected.id));
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={dim ? "#E7E7E4" : "#C9C7FF"} strokeWidth={dim ? 1 : 1.5} />;
        })}
        {/* nodes */}
        {nodes.map((n) => {
          const p = positions.get(n.id)!;
          const isSel = selected?.id === n.id;
          const isHi = highlight?.has(n.id);
          return (
            <g key={n.id} className="cursor-pointer" onClick={() => onSelect(n)}>
              <circle
                cx={p.x} cy={p.y} r={isSel ? 12 : 8}
                fill={kindColor[n.kind]}
                stroke={isSel ? "#0B0B0D" : isHi ? "#635BFF" : "#fff"}
                strokeWidth={isSel ? 2.5 : 2}
                opacity={highlight && !isSel && !isHi ? 0.4 : 1}
              />
              <text
                x={p.x} y={p.y - 14} textAnchor="middle" fontSize="9.5"
                fill="#0B0B0D" opacity={highlight && !isSel && !isHi ? 0.4 : 0.9}
              >
                {n.label.length > 18 ? n.label.slice(0, 17) + "…" : n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function FilterChip({ children, active, onClick, color }: { children: React.ReactNode; active: boolean; onClick: () => void; color?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium capitalize transition-colors",
        active ? "border-ink bg-ink text-white" : "border-line text-muted hover:text-ink"
      )}
    >
      {color && <span className="h-1.5 w-1.5 rounded-full" style={{ background: active ? "#fff" : color }} />}
      {children}
    </button>
  );
}

function InspectorList({ title, items, empty }: { title: string; items: string[]; empty?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <h4 className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-muted">{title}</h4>
      {items.length === 0 ? (
        <p className="text-[12.5px] text-muted">{empty ?? "None."}</p>
      ) : (
        <ul className="space-y-1">
          {items.slice(0, 12).map((it, i) => (
            <li key={i} className="truncate text-[13px] text-ink/85">{it}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

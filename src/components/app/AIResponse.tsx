import { Check } from "lucide-react";
import { FileText } from "lucide-react";
import type { AIResponse as AIResponseType } from "@/lib/ai-mock";

export function AIResponseView({ res }: { res: AIResponseType }) {
  return (
    <div className="space-y-3 text-[14.5px] leading-relaxed text-ink">
      {res.blocks.map((b, i) => {
        if (b.type === "text") return <p key={i}>{b.text}</p>;
        if (b.type === "list")
          return b.ordered ? (
            <ol key={i} className="space-y-1.5 pl-1">
              {b.items.map((it, j) => (
                <li key={j} className="flex gap-2">
                  <span className="text-muted/70">{j + 1}.</span>
                  <span>{it}</span>
                </li>
              ))}
            </ol>
          ) : (
            <ul key={i} className="space-y-1.5">
              {b.items.map((it, j) => (
                <li key={j} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted/60" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          );
        if (b.type === "checklist")
          return (
            <ul key={i} className="space-y-1.5">
              {b.items.map((it, j) => (
                <li key={j} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-[5px] border border-line">
                    <Check className="h-3 w-3 text-muted" strokeWidth={2.5} />
                  </span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          );
        if (b.type === "table")
          return (
            <div key={i} className="overflow-hidden rounded-lg border border-line">
              <table className="w-full text-left text-[13.5px]">
                <thead className="bg-canvas/60 text-[12px] text-muted">
                  <tr>
                    {b.head.map((h) => (
                      <th key={h} className="px-3 py-2 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((r, ri) => (
                    <tr key={ri} className="border-t border-line">
                      {r.map((c, ci) => (
                        <td key={ci} className="px-3 py-2 text-ink/85">{c}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        return null;
      })}

      {res.sources && res.sources.length > 0 && (
        <div className="pt-1">
          <div className="text-[12px] font-medium text-muted">Sources</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {res.sources.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-2.5 py-1 text-[12.5px] text-ink"
              >
                <FileText className="h-3.5 w-3.5 text-muted" />
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

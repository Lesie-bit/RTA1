import type { Rule } from "@/lib/types";

const severityLabel: Record<Rule["severity"], string> = {
  normal: "ปกติ",
  warning: "เฝ้าระวัง",
  severe: "ร้ายแรง",
};

const severityColor: Record<Rule["severity"], string> = {
  normal: "var(--color-line-500)",
  warning: "var(--color-badge-500)",
  severe: "var(--color-flag-500)",
};

export default function RuleCard({ rule }: { rule: Rule }) {
  const color = severityColor[rule.severity];

  return (
    <article className="overflow-hidden rounded-md border border-[var(--color-ink-700)] bg-[var(--color-ink-900)]">
      <div className="flex items-start justify-between gap-4 px-5 pt-5">
        <div>
          <span className="font-mono text-xs text-[var(--color-badge-400)]">
            มาตรา {rule.code}
          </span>
          <h3 className="font-display mt-1 text-lg text-[var(--color-paper-50)]">
            {rule.title}
          </h3>
        </div>
        <span
          className="whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px]"
          style={{ borderColor: color, color }}
        >
          {severityLabel[rule.severity]}
        </span>
      </div>
      <p className="px-5 pb-6 pt-3 text-sm leading-relaxed text-[var(--color-slate-400)]">
        {rule.body}
      </p>
      <div className="perforated" />
    </article>
  );
}

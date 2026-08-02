"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { Rule } from "@/lib/types";

const severityLabel: Record<Rule["severity"], string> = {
  petty: "ลหุโทษ",
  light: "โทษชั้นเบา",
  medium: "โทษชั้นกลาง",
  heavy: "โทษชั้นหนัก",
};

const severityColor: Record<Rule["severity"], string> = {
  petty: "var(--color-slate-400)",
  light: "var(--color-line-500)",
  medium: "var(--color-badge-500)",
  heavy: "var(--color-flag-500)",
};

export default function RuleCard({ rule }: { rule: Rule }) {
  const color = severityColor[rule.severity];
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = `มาตรา ${rule.code}: ${rule.title}\n${rule.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard อาจใช้ไม่ได้ในบางเบราว์เซอร์/บริบท — เงียบไว้ ไม่รบกวนผู้ใช้
    }
  }

  return (
    <article className="overflow-hidden rounded-md border border-[var(--color-ink-700)] bg-[var(--color-ink-900)]">
      <div className="flex items-start justify-between gap-4 px-5 pt-5">
        <div className="min-w-0">
          <span className="font-mono text-xs text-[var(--color-badge-400)]">
            มาตรา {rule.code}
          </span>
          <h3 className="font-display mt-1 text-lg text-[var(--color-paper-50)]">
            {rule.title}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px]"
            style={{ borderColor: color, color }}
          >
            {severityLabel[rule.severity]}
          </span>
          <button
            onClick={handleCopy}
            aria-label="คัดลอกมาตราและรายละเอียด"
            title="คัดลอกมาตราและรายละเอียด"
            className="rounded p-1.5 text-[var(--color-slate-400)] hover:bg-[var(--color-ink-800)] hover:text-[var(--color-paper-50)]"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>
      <p className="px-5 pb-6 pt-3 text-sm leading-relaxed text-[var(--color-slate-400)]">
        {rule.body}
      </p>
      <div className="perforated" />
    </article>
  );
}
import { createClient } from "@/lib/supabase/server";
import type { Guide } from "@/lib/types";

export const revalidate = 0;

export default async function HowToPlayPage() {
  const supabase = await createClient();
  const { data: guides } = await supabase
    .from("guides")
    .select("*")
    .order("sort_order");

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs tracking-[0.2em] text-[var(--color-badge-400)]">
        คู่มือผู้เล่นใหม่
      </p>
      <h1 className="font-display mt-3 text-4xl text-[var(--color-paper-50)]">
        วิธีการเล่น
      </h1>

      <div className="mt-12 space-y-10">
        {(guides ?? []).length === 0 && (
          <p className="text-sm text-[var(--color-slate-500)]">
            ยังไม่มีเนื้อหาคู่มือ แอดมินสามารถเพิ่มได้จากแดชบอร์ด
          </p>
        )}
        {(guides ?? []).map((guide: Guide, i: number) => (
          <section key={guide.id} className="flex gap-5">
            <span className="font-mono text-sm text-[var(--color-badge-400)]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="font-display text-xl text-[var(--color-paper-50)]">
                {guide.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-slate-400)]">
                {guide.body}
              </p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

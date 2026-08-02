import { createClient } from "@/lib/supabase/server";
import RuleCard from "@/components/RuleCard";
import type { Category, Rule } from "@/lib/types";

export const revalidate = 0;

export default async function RulesPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: rules }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase
      .from("rules")
      .select("*")
      .eq("is_published", true)
      .order("code"),
  ]);

  const grouped = (categories ?? []).map((category: Category) => ({
    category,
    rules: (rules ?? []).filter((r: Rule) => r.category_id === category.id),
  }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="font-mono text-xs tracking-[0.2em] text-[var(--color-badge-400)]">
        ทะเบียนกฎ — ฉบับปรับปรุงล่าสุด
      </p>
      <h1 className="font-display mt-3 text-4xl text-[var(--color-paper-50)]">
        กฎของแมพ
      </h1>
      <p className="mt-4 max-w-xl text-sm text-[var(--color-slate-400)]">
        ทุกมาตราด้านล่างมีผลบังคับใช้จริง หากมีข้อสงสัยสามารถถามผู้ช่วย AI มุมล่างขวาได้ทันที
      </p>

      <div className="mt-12 space-y-14">
        {grouped.map(({ category, rules }) => (
          <section key={category.id}>
            <h2 className="font-display border-b border-[var(--color-ink-700)] pb-3 text-xl text-[var(--color-paper-100)]">
              {category.name}
            </h2>
            {rules.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--color-slate-500)]">
                ยังไม่มีกฎในหมวดนี้
              </p>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {rules.map((rule: Rule) => (
                  <RuleCard key={rule.id} rule={rule} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

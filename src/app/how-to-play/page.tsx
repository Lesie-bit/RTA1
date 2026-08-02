import { createClient } from "@/lib/supabase/server";
import type { Guide, GuideCategory } from "@/lib/types";

export const revalidate = 0;

export default async function HowToPlayPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: guides }] = await Promise.all([
    supabase.from("guide_categories").select("*").order("sort_order"),
    supabase.from("guides").select("*").order("sort_order"),
  ]);

  const uncategorized = (guides ?? []).filter((g: Guide) => !g.category_id);
  const grouped = (categories ?? []).map((category: GuideCategory) => ({
    category,
    guides: (guides ?? []).filter((g: Guide) => g.category_id === category.id),
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs tracking-[0.2em] text-[var(--color-badge-400)]">
        คู่มือผู้เล่นใหม่
      </p>
      <h1 className="font-display mt-3 text-4xl text-[var(--color-paper-50)]">
        วิธีการเล่น
      </h1>

      {(guides ?? []).length === 0 ? (
        <p className="mt-12 text-sm text-[var(--color-slate-500)]">
          ยังไม่มีเนื้อหาคู่มือ แอดมินสามารถเพิ่มได้จากแดชบอร์ด
        </p>
      ) : (
        <div className="mt-12 space-y-14">
          {grouped
            .filter((g) => g.guides.length > 0)
            .map(({ category, guides }) => (
              <section key={category.id}>
                <h2 className="font-display border-b border-[var(--color-ink-700)] pb-3 text-xl text-[var(--color-paper-100)]">
                  {category.name}
                </h2>
                <div className="mt-8 space-y-10">
                  {guides.map((guide: Guide, i: number) => (
                    <GuideItem key={guide.id} guide={guide} index={i} />
                  ))}
                </div>
              </section>
            ))}

          {uncategorized.length > 0 && (
            <section>
              {grouped.some((g) => g.guides.length > 0) && (
                <h2 className="font-display border-b border-[var(--color-ink-700)] pb-3 text-xl text-[var(--color-paper-100)]">
                  อื่น ๆ
                </h2>
              )}
              <div className="mt-8 space-y-10">
                {uncategorized.map((guide: Guide, i: number) => (
                  <GuideItem key={guide.id} guide={guide} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function GuideItem({ guide, index }: { guide: Guide; index: number }) {
  return (
    <div className="flex gap-5">
      <span className="font-mono text-sm text-[var(--color-badge-400)]">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div>
        <h3 className="font-display text-xl text-[var(--color-paper-50)]">
          {guide.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-slate-400)]">
          {guide.body}
        </p>
      </div>
    </div>
  );
}
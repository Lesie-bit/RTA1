import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, ScrollText, BookOpenText } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("rules")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);

  return (
    <div className="mx-auto max-w-5xl px-6">
      <section className="fade-up border-b border-[var(--color-ink-700)] py-20">
        <p className="font-mono text-xs tracking-[0.2em] text-[var(--color-badge-400)]">
        Version 1.0.0 
        </p>
        <h1 className="font-display mt-4 max-w-2xl text-5xl leading-[1.15] text-[var(--color-paper-50)]">
          กฎและวิธีการเล่น
          <br />
          แมพเกิดใหม่ในค่ายซากุระ
        </h1>
        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--color-slate-400)]">
          รวมกฎของแมพ วิธีการเล่น และผู้ช่วย AI ที่ตอบคำถามจากทะเบียนกฎจริง
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link
            href="/rules"
            className="stamp inline-flex items-center gap-2 px-5 py-2.5 text-sm text-[var(--color-badge-400)]"
          >
            <ScrollText size={16} />
            อ่านกฎของแมพ
          </Link>
          <Link
            href="/how-to-play"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-paper-100)] hover:text-[var(--color-badge-400)]"
          >
            <BookOpenText size={16} />
            วิธีการเล่น
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section className="grid gap-6 py-16 sm:grid-cols-3">
        <div className="border-l border-[var(--color-ink-700)] pl-5">
          <p className="font-display text-3xl text-[var(--color-paper-50)]">
            {count ?? "—"}
          </p>
          <p className="mt-1 text-xs text-[var(--color-slate-400)]">
            มาตรากฎที่มีผลบังคับใช้
          </p>
        </div>
        <div className="border-l border-[var(--color-ink-700)] pl-5">
          <p className="font-display text-3xl text-[var(--color-paper-50)]">24/7</p>
          <p className="mt-1 text-xs text-[var(--color-slate-400)]">
            ผู้ช่วย AI พร้อมตอบคำถาม
          </p>
        </div>
        <div className="border-l border-[var(--color-ink-700)] pl-5">
          <p className="font-display text-3xl text-[var(--color-paper-50)]">1</p>
          <p className="mt-1 text-xs text-[var(--color-slate-400)]">
            แหล่งข้อมูลกฎที่แท้จริง
          </p>
        </div>
      </section>
    </div>
  );
}

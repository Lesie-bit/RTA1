import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RulesManager from "@/components/admin/RulesManager";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="font-display text-2xl text-[var(--color-paper-50)]">
          บัญชีนี้ยังไม่ได้รับสิทธิ์แอดมิน
        </p>
        <p className="mt-3 text-sm text-[var(--color-slate-400)]">
          ให้เจ้าของระบบเพิ่มอีเมลนี้ในตาราง admin_profiles ก่อน
        </p>
      </div>
    );
  }

  const [{ data: rules }, { data: categories }] = await Promise.all([
    supabase.from("rules").select("*").order("code"),
    supabase.from("categories").select("*").order("sort_order"),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <p className="font-mono text-xs tracking-[0.2em] text-[var(--color-badge-400)]">
        แผงควบคุม — {profile.role === "owner" ? "เจ้าของระบบ" : "ผู้แก้ไข"}
      </p>
      <h1 className="font-display mt-3 text-3xl text-[var(--color-paper-50)]">
        จัดการกฎของแมพ
      </h1>

      <RulesManager initialRules={rules ?? []} categories={categories ?? []} />
    </div>
  );
}

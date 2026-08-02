import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import DashboardTabs from "@/components/admin/DashboardTabs";
import type { AdminUser } from "@/lib/types";

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

  const isOwner = profile.role === "owner";

  const [
    { data: rules },
    { data: categories },
    { data: guides },
    { data: guideCategories },
    adminUsers,
  ] = await Promise.all([
    supabase.from("rules").select("*").order("code"),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("guides").select("*").order("sort_order"),
    supabase.from("guide_categories").select("*").order("sort_order"),
    isOwner ? loadAdminUsers() : Promise.resolve([] as AdminUser[]),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <p className="font-mono text-xs tracking-[0.2em] text-[var(--color-badge-400)]">
        แผงควบคุม — {isOwner ? "เจ้าของระบบ" : "ผู้แก้ไข"}
      </p>
      <h1 className="font-display mt-3 text-3xl text-[var(--color-paper-50)]">
        จัดการกฎของแมพ
      </h1>

      <DashboardTabs
        rules={rules ?? []}
        categories={categories ?? []}
        guides={guides ?? []}
        guideCategories={guideCategories ?? []}
        role={profile.role}
        currentUserId={user.id}
        initialUsers={adminUsers}
      />
    </div>
  );
}

/** ดึงรายชื่อแอดมินทั้งหมดพร้อมอีเมล — ใช้ service client เพราะ email อยู่ใน auth.users */
async function loadAdminUsers(): Promise<AdminUser[]> {
  const service = createServiceClient();

  const [{ data: profiles }, { data: authList }] = await Promise.all([
    service.from("admin_profiles").select("*").order("created_at"),
    service.auth.admin.listUsers(),
  ]);

  const emailByUserId = new Map(
    (authList?.users ?? []).map((u) => [u.id, u.email])
  );

  return (profiles ?? []).map((p) => ({
    ...p,
    email: emailByUserId.get(p.user_id) ?? "(ไม่พบอีเมล)",
  }));
}
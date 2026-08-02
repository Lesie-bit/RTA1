"use client";

import { useState } from "react";
import type { AdminRole, AdminUser } from "@/lib/types";
import { Plus, Trash2, X } from "lucide-react";

const emptyForm = { email: "", password: "", displayName: "", role: "editor" as AdminRole };

const roleLabel: Record<AdminRole, string> = {
  owner: "แอดมิน",
  editor: "เจ้าหน้าที่",
};

export default function UsersManager({
  initialUsers,
  currentUserId,
}: {
  initialUsers: AdminUser[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!form.email || !form.password) return;
    setSaving(true);
    setError(null);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "เพิ่มผู้ใช้ไม่สำเร็จ");
      return;
    }

    setUsers((u) => [...u, { ...data.user, created_at: new Date().toISOString() }]);
    setForm(emptyForm);
    setShowForm(false);
  }

  async function handleRoleChange(userId: string, role: AdminRole) {
    const prev = users;
    setUsers((u) => u.map((x) => (x.user_id === userId ? { ...x, role } : x)));

    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    if (!res.ok) {
      setUsers(prev); // rollback ถ้า server ปฏิเสธ (เช่น พยายามลดสิทธิ์ตัวเอง)
      const data = await res.json();
      alert(data.error ?? "เปลี่ยน role ไม่สำเร็จ");
    }
  }

  async function handleRemove(userId: string) {
    if (!confirm("ถอดสิทธิ์แอดมินของผู้ใช้นี้?")) return;

    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((u) => u.filter((x) => x.user_id !== userId));
    } else {
      const data = await res.json();
      alert(data.error ?? "ถอดสิทธิ์ไม่สำเร็จ");
    }
  }

  return (
    <div className="mt-10">
      <div className="space-y-2">
        {users.map((u) => (
          <div
            key={u.user_id}
            className="flex items-center justify-between gap-4 rounded border border-[var(--color-ink-700)] bg-[var(--color-ink-900)] px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-[var(--color-paper-100)]">
                {u.display_name || u.email}
                {u.user_id === currentUserId && (
                  <span className="ml-2 text-[11px] text-[var(--color-slate-500)]">
                    (คุณ)
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-[var(--color-slate-500)]">{u.email}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <select
                value={u.role}
                onChange={(e) =>
                  handleRoleChange(u.user_id, e.target.value as AdminRole)
                }
                className="rounded border border-[var(--color-ink-600)] bg-[var(--color-ink-950)] px-2 py-1.5 text-xs text-[var(--color-paper-100)] outline-none focus:border-[var(--color-badge-500)]"
              >
                <option value="owner">{roleLabel.owner}</option>
                <option value="editor">{roleLabel.editor}</option>
              </select>
              <button
                onClick={() => handleRemove(u.user_id)}
                disabled={u.user_id === currentUserId}
                aria-label="ถอดสิทธิ์แอดมิน"
                className="rounded p-2 text-[var(--color-slate-400)] hover:bg-[var(--color-ink-800)] hover:text-[var(--color-flag-500)] disabled:opacity-20"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="stamp mt-6 inline-flex items-center gap-1.5 px-4 py-2 text-xs text-[var(--color-badge-400)]"
        >
          <Plus size={14} />
          เพิ่มผู้ใช้ใหม่
        </button>
      ) : (
        <div className="mt-6 max-w-sm rounded border border-[var(--color-ink-700)] bg-[var(--color-ink-900)] p-5">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm text-[var(--color-paper-50)]">
              เพิ่มผู้ใช้ใหม่
            </p>
            <button
              onClick={() => {
                setShowForm(false);
                setError(null);
              }}
              aria-label="ปิดฟอร์ม"
              className="text-[var(--color-slate-400)] hover:text-[var(--color-paper-50)]"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <input
              type="email"
              placeholder="อีเมล"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded border border-[var(--color-ink-600)] bg-[var(--color-ink-950)] px-3 py-2 text-sm text-[var(--color-paper-100)] outline-none focus:border-[var(--color-badge-500)]"
            />
            <input
              type="password"
              placeholder="รหัสผ่านชั่วคราว (อย่างน้อย 8 ตัว)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded border border-[var(--color-ink-600)] bg-[var(--color-ink-950)] px-3 py-2 text-sm text-[var(--color-paper-100)] outline-none focus:border-[var(--color-badge-500)]"
            />
            <input
              placeholder="ชื่อที่แสดง (ไม่บังคับ)"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              className="w-full rounded border border-[var(--color-ink-600)] bg-[var(--color-ink-950)] px-3 py-2 text-sm text-[var(--color-paper-100)] outline-none focus:border-[var(--color-badge-500)]"
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole })}
              className="w-full rounded border border-[var(--color-ink-600)] bg-[var(--color-ink-950)] px-3 py-2 text-sm text-[var(--color-paper-100)] outline-none focus:border-[var(--color-badge-500)]"
            >
              <option value="editor">เจ้าหน้าที่ — เพิ่ม/แก้กฎได้เท่านั้น</option>
              <option value="owner">แอดมิน — จัดการทุกอย่างรวมถึงผู้ใช้</option>
            </select>

            {error && <p className="text-xs text-[var(--color-flag-500)]">{error}</p>}

            <button
              onClick={handleCreate}
              disabled={saving}
              className="stamp w-full py-2 text-xs text-[var(--color-badge-400)] disabled:opacity-50"
            >
              {saving ? "กำลังสร้างบัญชี..." : "สร้างบัญชี"}
            </button>
            <p className="text-[11px] leading-relaxed text-[var(--color-slate-500)]">
              ส่งอีเมล+รหัสผ่านนี้ให้ผู้ใช้ทางช่องทางที่ปลอดภัยเอง
              ระบบยังไม่ได้ส่งอีเมลอัตโนมัติ
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Category, Rule, Severity } from "@/lib/types";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";

const emptyForm = {
  id: "",
  code: "",
  title: "",
  body: "",
  category_id: "",
  severity: "light" as Severity,
  is_published: true,
};

export default function RulesManager({
  initialRules,
  categories,
}: {
  initialRules: Rule[];
  categories: Category[];
}) {
  const supabase = createClient();
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function startEdit(rule: Rule) {
    setEditingId(rule.id);
    setForm({
      id: rule.id,
      code: rule.code,
      title: rule.title,
      body: rule.body,
      category_id: rule.category_id ?? "",
      severity: rule.severity,
      is_published: rule.is_published,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function reembed(ruleId: string) {
    // สร้าง embedding ใหม่แบบไม่บล็อก UI — ให้ AI ค้นเจอกฎล่าสุดในครั้งถัดไป
    fetch("/api/embed-rule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ruleId }),
    }).catch(() => {});
  }

  async function handleSave() {
    if (!form.code || !form.title || !form.body) return;
    setSaving(true);

    const payload = {
      code: form.code,
      title: form.title,
      body: form.body,
      category_id: form.category_id || null,
      severity: form.severity,
      is_published: form.is_published,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("rules")
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();
      if (!error && data) {
        setRules((rs) => rs.map((r) => (r.id === editingId ? data : r)));
        reembed(editingId);
      }
    } else {
      const { data, error } = await supabase
        .from("rules")
        .insert(payload)
        .select()
        .single();
      if (!error && data) {
        setRules((rs) => [...rs, data]);
        reembed(data.id);
      }
    }

    setSaving(false);
    resetForm();
  }

  async function handleDelete(id: string) {
    if (!confirm("ลบกฎข้อนี้ถาวร?")) return;
    const { error } = await supabase.from("rules").delete().eq("id", id);
    if (!error) setRules((rs) => rs.filter((r) => r.id !== id));
  }

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* รายการกฎ */}
      <div className="space-y-2">
        {rules.length === 0 && (
          <p className="text-sm text-[var(--color-slate-500)]">ยังไม่มีกฎ เริ่มเพิ่มได้จากฟอร์มด้านขวา</p>
        )}
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center justify-between gap-4 rounded border border-[var(--color-ink-700)] bg-[var(--color-ink-900)] px-4 py-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[var(--color-badge-400)]">
                  {rule.code}
                </span>
                {!rule.is_published && (
                  <span className="rounded-full border border-[var(--color-slate-500)] px-2 py-0.5 text-[10px] text-[var(--color-slate-400)]">
                    ฉบับร่าง
                  </span>
                )}
              </div>
              <p className="truncate text-sm text-[var(--color-paper-100)]">{rule.title}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => startEdit(rule)}
                aria-label="แก้ไขกฎ"
                className="rounded p-2 text-[var(--color-slate-400)] hover:bg-[var(--color-ink-800)] hover:text-[var(--color-paper-50)]"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => handleDelete(rule.id)}
                aria-label="ลบกฎ"
                className="rounded p-2 text-[var(--color-slate-400)] hover:bg-[var(--color-ink-800)] hover:text-[var(--color-flag-500)]"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ฟอร์มเพิ่ม/แก้ไข */}
      <div className="h-fit rounded border border-[var(--color-ink-700)] bg-[var(--color-ink-900)] p-5">
        <p className="font-display text-sm text-[var(--color-paper-50)]">
          {editingId ? "แก้ไขกฎ" : "เพิ่มกฎใหม่"}
        </p>

        <div className="mt-4 space-y-3">
          <input
            placeholder="เลขมาตรา เช่น RP-014"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="w-full rounded border border-[var(--color-ink-600)] bg-[var(--color-ink-950)] px-3 py-2 text-sm text-[var(--color-paper-100)] outline-none focus:border-[var(--color-badge-500)]"
          />
          <input
            placeholder="หัวข้อกฎ"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded border border-[var(--color-ink-600)] bg-[var(--color-ink-950)] px-3 py-2 text-sm text-[var(--color-paper-100)] outline-none focus:border-[var(--color-badge-500)]"
          />
          <textarea
            placeholder="เนื้อหากฎแบบเต็ม"
            rows={5}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="w-full rounded border border-[var(--color-ink-600)] bg-[var(--color-ink-950)] px-3 py-2 text-sm text-[var(--color-paper-100)] outline-none focus:border-[var(--color-badge-500)]"
          />

          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="w-full rounded border border-[var(--color-ink-600)] bg-[var(--color-ink-950)] px-3 py-2 text-sm text-[var(--color-paper-100)] outline-none focus:border-[var(--color-badge-500)]"
          >
            <option value="">— เลือกหมวดหมู่ —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={form.severity}
            onChange={(e) => setForm({ ...form, severity: e.target.value as Severity })}
            className="w-full rounded border border-[var(--color-ink-600)] bg-[var(--color-ink-950)] px-3 py-2 text-sm text-[var(--color-paper-100)] outline-none focus:border-[var(--color-badge-500)]"
          >
            <option value="petty">ระดับโทษ: ลหุโทษ</option>
            <option value="light">ระดับโทษ: โทษชั้นเบา</option>
            <option value="medium">ระดับโทษ: โทษชั้นกลาง</option>
            <option value="heavy">ระดับโทษ: โทษชั้นหนัก</option>
          </select>

          <label className="flex items-center gap-2 text-xs text-[var(--color-slate-400)]">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
            />
            เผยแพร่ให้ผู้เล่นเห็นทันที
          </label>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="stamp flex flex-1 items-center justify-center gap-1.5 py-2 text-xs text-[var(--color-badge-400)] disabled:opacity-50"
            >
              {editingId ? <Check size={14} /> : <Plus size={14} />}
              {saving ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "เพิ่มกฎ"}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                aria-label="ยกเลิกการแก้ไข"
                className="rounded border border-[var(--color-ink-600)] px-3 text-[var(--color-slate-400)] hover:text-[var(--color-paper-50)]"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
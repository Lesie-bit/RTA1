"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Guide, GuideCategory } from "@/lib/types";
import GuideCategoriesManager from "@/components/admin/GuideCategoriesManager";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";

const emptyForm = { id: "", title: "", body: "", category_id: "" };

export default function GuidesManager({
  initialGuides,
  initialCategories,
}: {
  initialGuides: Guide[];
  initialCategories: GuideCategory[];
}) {
  const supabase = createClient();
  const [subTab, setSubTab] = useState<"content" | "categories">("content");
  const [guides, setGuides] = useState<Guide[]>(initialGuides);
  const [categories, setCategories] = useState<GuideCategory[]>(
    [...initialCategories].sort((a, b) => a.sort_order - b.sort_order)
  );
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function startEdit(g: Guide) {
    setEditingId(g.id);
    setForm({
      id: g.id,
      title: g.title,
      body: g.body,
      category_id: g.category_id ?? "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!form.title || !form.body) return;
    setSaving(true);

    const payload = {
      title: form.title,
      body: form.body,
      category_id: form.category_id || null,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("guides")
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();
      if (!error && data) {
        setGuides((gs) => gs.map((g) => (g.id === editingId ? data : g)));
      }
    } else {
      const { data, error } = await supabase
        .from("guides")
        .insert({ ...payload, sort_order: guides.length + 1 })
        .select()
        .single();
      if (!error && data) {
        setGuides((gs) => [...gs, data]);
      }
    }

    setSaving(false);
    resetForm();
  }

  async function handleDelete(id: string) {
    if (!confirm("ลบเนื้อหาวิธีเล่นนี้ถาวร?")) return;
    const { error } = await supabase.from("guides").delete().eq("id", id);
    if (!error) setGuides((gs) => gs.filter((g) => g.id !== id));
  }

  const categoryName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name ?? "ไม่มีหมวดหมู่";

  return (
    <div>
      <div className="mt-6 flex gap-1 text-sm">
        <button
          onClick={() => setSubTab("content")}
          className={`rounded px-3 py-1.5 ${
            subTab === "content"
              ? "bg-[var(--color-ink-800)] text-[var(--color-paper-50)]"
              : "text-[var(--color-slate-400)] hover:text-[var(--color-paper-100)]"
          }`}
        >
          เนื้อหา
        </button>
        <button
          onClick={() => setSubTab("categories")}
          className={`rounded px-3 py-1.5 ${
            subTab === "categories"
              ? "bg-[var(--color-ink-800)] text-[var(--color-paper-50)]"
              : "text-[var(--color-slate-400)] hover:text-[var(--color-paper-100)]"
          }`}
        >
          หมวดหมู่ย่อย
        </button>
      </div>

      {subTab === "categories" ? (
        <GuideCategoriesManager categories={categories} setCategories={setCategories} />
      ) : (
        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-2">
            {guides.length === 0 && (
              <p className="text-sm text-[var(--color-slate-500)]">
                ยังไม่มีเนื้อหาวิธีเล่น เริ่มเพิ่มได้จากฟอร์มด้านขวา
              </p>
            )}
            {guides.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between gap-4 rounded border border-[var(--color-ink-700)] bg-[var(--color-ink-900)] px-4 py-3"
              >
                <div className="min-w-0">
                  <span className="font-mono text-[11px] text-[var(--color-badge-400)]">
                    {categoryName(g.category_id)}
                  </span>
                  <p className="truncate text-sm text-[var(--color-paper-100)]">{g.title}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => startEdit(g)}
                    aria-label="แก้ไขเนื้อหา"
                    className="rounded p-2 text-[var(--color-slate-400)] hover:bg-[var(--color-ink-800)] hover:text-[var(--color-paper-50)]"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(g.id)}
                    aria-label="ลบเนื้อหา"
                    className="rounded p-2 text-[var(--color-slate-400)] hover:bg-[var(--color-ink-800)] hover:text-[var(--color-flag-500)]"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="h-fit rounded border border-[var(--color-ink-700)] bg-[var(--color-ink-900)] p-5">
            <p className="font-display text-sm text-[var(--color-paper-50)]">
              {editingId ? "แก้ไขเนื้อหา" : "เพิ่มเนื้อหาใหม่"}
            </p>

            <div className="mt-4 space-y-3">
              <input
                placeholder="หัวข้อ"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded border border-[var(--color-ink-600)] bg-[var(--color-ink-950)] px-3 py-2 text-sm text-[var(--color-paper-100)] outline-none focus:border-[var(--color-badge-500)]"
              />
              <textarea
                placeholder="เนื้อหาแบบเต็ม"
                rows={6}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="w-full rounded border border-[var(--color-ink-600)] bg-[var(--color-ink-950)] px-3 py-2 text-sm text-[var(--color-paper-100)] outline-none focus:border-[var(--color-badge-500)]"
              />
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full rounded border border-[var(--color-ink-600)] bg-[var(--color-ink-950)] px-3 py-2 text-sm text-[var(--color-paper-100)] outline-none focus:border-[var(--color-badge-500)]"
              >
                <option value="">— เลือกหมวดหมู่ย่อย —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="stamp flex flex-1 items-center justify-center gap-1.5 py-2 text-xs text-[var(--color-badge-400)] disabled:opacity-50"
                >
                  {editingId ? <Check size={14} /> : <Plus size={14} />}
                  {saving ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "เพิ่มเนื้อหา"}
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
      )}
    </div>
  );
}
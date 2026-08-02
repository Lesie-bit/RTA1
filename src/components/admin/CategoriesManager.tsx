"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";
import { Plus, Trash2, Pencil, Check, X, GripVertical } from "lucide-react";

const emptyForm = { id: "", name: "", slug: "", sort_order: 0 };

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CategoriesManager({
  categories,
  setCategories,
}: {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}) {
  const supabase = createClient();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(c: Category) {
    setEditingId(c.id);
    setForm({ id: c.id, name: c.name, slug: c.slug, sort_order: c.sort_order });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      sort_order:
        form.sort_order || (editingId ? form.sort_order : categories.length + 1),
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("categories")
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();
      if (error) setError("บันทึกไม่สำเร็จ (ชื่อย่อ/slug อาจซ้ำ)");
      else if (data) {
        setCategories((cs) =>
          cs
            .map((c) => (c.id === editingId ? data : c))
            .sort((a, b) => a.sort_order - b.sort_order)
        );
      }
    } else {
      const { data, error } = await supabase
        .from("categories")
        .insert(payload)
        .select()
        .single();
      if (error) setError("เพิ่มไม่สำเร็จ (ชื่อย่อ/slug อาจซ้ำ)");
      else if (data) {
        setCategories((cs) =>
          [...cs, data].sort((a, b) => a.sort_order - b.sort_order)
        );
      }
    }

    setSaving(false);
    if (!error) resetForm();
  }

  async function handleDelete(id: string) {
    if (
      !confirm(
        "ลบหมวดหมู่นี้? กฎที่อยู่ในหมวดนี้จะไม่ถูกลบ แต่จะกลายเป็น 'ไม่มีหมวดหมู่'"
      )
    )
      return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (!error) setCategories((cs) => cs.filter((c) => c.id !== id));
  }

  async function moveOrder(id: string, direction: -1 | 1) {
    const idx = categories.findIndex((c) => c.id === id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= categories.length) return;

    const a = categories[idx];
    const b = categories[swapIdx];

    const next = [...categories];
    next[idx] = { ...b, sort_order: a.sort_order };
    next[swapIdx] = { ...a, sort_order: b.sort_order };
    setCategories(next.sort((x, y) => x.sort_order - y.sort_order));

    await Promise.all([
      supabase.from("categories").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("categories").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
  }

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-2">
        {categories.length === 0 && (
          <p className="text-sm text-[var(--color-slate-500)]">
            ยังไม่มีหมวดหมู่ เริ่มเพิ่มได้จากฟอร์มด้านขวา
          </p>
        )}
        {categories.map((c, i) => (
          <div
            key={c.id}
            className="flex items-center justify-between gap-4 rounded border border-[var(--color-ink-700)] bg-[var(--color-ink-900)] px-4 py-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex flex-col text-[var(--color-slate-500)]">
                <button
                  onClick={() => moveOrder(c.id, -1)}
                  disabled={i === 0}
                  aria-label="เลื่อนขึ้น"
                  className="disabled:opacity-20 hover:text-[var(--color-paper-50)]"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveOrder(c.id, 1)}
                  disabled={i === categories.length - 1}
                  aria-label="เลื่อนลง"
                  className="disabled:opacity-20 hover:text-[var(--color-paper-50)]"
                >
                  ▼
                </button>
              </div>
              <GripVertical size={14} className="shrink-0 text-[var(--color-slate-500)]" />
              <div className="min-w-0">
                <p className="truncate text-sm text-[var(--color-paper-100)]">{c.name}</p>
                <p className="font-mono truncate text-[11px] text-[var(--color-slate-500)]">
                  /{c.slug}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => startEdit(c)}
                aria-label="แก้ไขหมวดหมู่"
                className="rounded p-2 text-[var(--color-slate-400)] hover:bg-[var(--color-ink-800)] hover:text-[var(--color-paper-50)]"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                aria-label="ลบหมวดหมู่"
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
          {editingId ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
        </p>

        <div className="mt-4 space-y-3">
          <input
            placeholder="ชื่อหมวดหมู่ เช่น วินัยทหาร"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded border border-[var(--color-ink-600)] bg-[var(--color-ink-950)] px-3 py-2 text-sm text-[var(--color-paper-100)] outline-none focus:border-[var(--color-badge-500)]"
          />
          <input
            placeholder="slug (เว้นว่างไว้ให้สร้างอัตโนมัติ)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="font-mono w-full rounded border border-[var(--color-ink-600)] bg-[var(--color-ink-950)] px-3 py-2 text-sm text-[var(--color-paper-100)] outline-none focus:border-[var(--color-badge-500)]"
          />

          {error && <p className="text-xs text-[var(--color-flag-500)]">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="stamp flex flex-1 items-center justify-center gap-1.5 py-2 text-xs text-[var(--color-badge-400)] disabled:opacity-50"
            >
              {editingId ? <Check size={14} /> : <Plus size={14} />}
              {saving ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "เพิ่มหมวดหมู่"}
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
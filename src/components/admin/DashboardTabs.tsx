"use client";

import { useState } from "react";
import RulesManager from "@/components/admin/RulesManager";
import CategoriesManager from "@/components/admin/CategoriesManager";
import GuidesManager from "@/components/admin/GuidesManager";
import UsersManager from "@/components/admin/UsersManager";
import type { AdminRole, AdminUser, Category, Guide, GuideCategory, Rule } from "@/lib/types";

type Tab = "rules" | "guides" | "categories" | "users";

export default function DashboardTabs({
  rules,
  categories,
  guides,
  guideCategories,
  role,
  currentUserId,
  initialUsers,
}: {
  rules: Rule[];
  categories: Category[];
  guides: Guide[];
  guideCategories: GuideCategory[];
  role: AdminRole;
  currentUserId: string;
  initialUsers: AdminUser[];
}) {
  const isOwner = role === "owner";
  const [tab, setTab] = useState<Tab>("rules");
  const [categoryList, setCategoryList] = useState<Category[]>(
    [...categories].sort((a, b) => a.sort_order - b.sort_order)
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "rules", label: "กฎ" },
    { id: "guides", label: "วิธีการเล่น" },
    ...(isOwner
      ? [
          { id: "categories" as Tab, label: "หมวดหมู่กฎ" },
          { id: "users" as Tab, label: "ผู้ใช้งาน" },
        ]
      : []),
  ];

  return (
    <div>
      <div className="mt-8 flex gap-1 border-b border-[var(--color-ink-700)]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm ${
              tab === t.id
                ? "border-b-2 border-[var(--color-badge-500)] text-[var(--color-paper-50)]"
                : "text-[var(--color-slate-400)] hover:text-[var(--color-paper-100)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "rules" && (
        <RulesManager initialRules={rules} categories={categoryList} />
      )}
      {tab === "guides" && (
        <GuidesManager initialGuides={guides} initialCategories={guideCategories} />
      )}
      {tab === "categories" && isOwner && (
        <CategoriesManager categories={categoryList} setCategories={setCategoryList} />
      )}
      {tab === "users" && isOwner && (
        <UsersManager initialUsers={initialUsers} currentUserId={currentUserId} />
      )}
    </div>
  );
}
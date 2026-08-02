"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }
    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col px-6 py-24">
      <p className="font-mono text-xs tracking-[0.2em] text-[var(--color-badge-400)]">
        สำหรับเจ้าหน้าที่เท่านั้น
      </p>
      <h1 className="font-display mt-3 text-3xl text-[var(--color-paper-50)]">
        เข้าสู่ระบบแอดมิน
      </h1>

      <form onSubmit={handleSubmit} className="mt-10 space-y-4">
        <div>
          <label className="text-xs text-[var(--color-slate-400)]">อีเมล</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border border-[var(--color-ink-600)] bg-[var(--color-ink-900)] px-3 py-2 text-sm text-[var(--color-paper-100)] outline-none focus:border-[var(--color-badge-500)]"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--color-slate-400)]">รหัสผ่าน</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border border-[var(--color-ink-600)] bg-[var(--color-ink-900)] px-3 py-2 text-sm text-[var(--color-paper-100)] outline-none focus:border-[var(--color-badge-500)]"
          />
        </div>

        {error && <p className="text-xs text-[var(--color-flag-500)]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="stamp w-full py-2.5 text-sm text-[var(--color-badge-400)] disabled:opacity-50"
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>
    </div>
  );
}

import Link from "next/link";

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-ink-700)] bg-[var(--color-ink-950)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-lg text-[var(--color-paper-50)]">
            ทะเบียนกฎหมายเมือง
          </span>
          <span className="font-mono text-[11px] text-[var(--color-badge-400)]">
            §RMS
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-[var(--color-slate-400)]">
          <Link href="/rules" className="hover:text-[var(--color-paper-50)]">
            กฎของแมพ
          </Link>
          <Link href="/how-to-play" className="hover:text-[var(--color-paper-50)]">
            วิธีการเล่น
          </Link>
          <Link
            href="/admin/login"
            className="rounded border border-[var(--color-ink-600)] px-3 py-1.5 text-xs text-[var(--color-paper-100)] hover:border-[var(--color-badge-500)] hover:text-[var(--color-badge-400)]"
          >
            เข้าสู่ระบบแอดมิน
          </Link>
        </nav>
      </div>
    </header>
  );
}

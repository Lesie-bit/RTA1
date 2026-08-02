"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

type Message = { role: "user" | "assistant"; text: string };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "สวัสดีครับ ถามเรื่องกฎของแมพหรือวิธีเล่นได้เลย ผมจะตอบจากกฎที่ประกาศไว้จริงเท่านั้น",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    const question = input.trim();
    if (!question || loading) return;

    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", text: data.answer ?? data.error ?? "ขออภัย เกิดข้อผิดพลาด" },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 flex h-[28rem] w-80 flex-col overflow-hidden rounded-lg border border-[var(--color-ink-600)] bg-[var(--color-ink-900)] shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--color-ink-700)] px-4 py-3">
            <div>
              <p className="font-display text-sm text-[var(--color-paper-50)]">
                ผู้ช่วยตอบคำถามกฎ
              </p>
              <p className="text-[11px] text-[var(--color-slate-400)]">
                อ้างอิงจากทะเบียนกฎจริง
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="ปิดหน้าต่างแชท"
              className="text-[var(--color-slate-400)] hover:text-[var(--color-paper-50)]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-md px-3 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto bg-[var(--color-badge-500)] text-[var(--color-ink-950)]"
                    : "bg-[var(--color-ink-800)] text-[var(--color-paper-100)]"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-[var(--color-slate-400)]">
                <Loader2 size={14} className="animate-spin" />
                กำลังค้นกฎที่เกี่ยวข้อง...
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-[var(--color-ink-700)] p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="พิมพ์คำถาม..."
              className="flex-1 rounded border border-[var(--color-ink-600)] bg-[var(--color-ink-950)] px-3 py-2 text-sm text-[var(--color-paper-100)] outline-none focus:border-[var(--color-badge-500)]"
            />
            <button
              onClick={send}
              disabled={loading}
              aria-label="ส่งคำถาม"
              className="rounded bg-[var(--color-badge-500)] p-2 text-[var(--color-ink-950)] disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-badge-500)] text-[var(--color-ink-950)] shadow-lg hover:bg-[var(--color-badge-400)]"
        aria-label={open ? "ปิดผู้ช่วย AI" : "เปิดผู้ช่วย AI"}
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
    </div>
  );
}

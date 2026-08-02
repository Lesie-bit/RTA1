import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { embedText, answerQuestion } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json({ error: "กรุณาพิมพ์คำถาม" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // 1) แปลงคำถามเป็นเวกเตอร์
    const queryEmbedding = await embedText(question);

    // 2) ค้นกฎที่ใกล้เคียงที่สุดผ่านฟังก์ชัน match_rules ใน Postgres
    const { data: matches, error } = await supabase.rpc("match_rules", {
      query_embedding: queryEmbedding,
      match_count: 5,
      match_threshold: 0.55,
    });

    if (error) throw error;

    // 3) ให้ Gemini ตอบ โดยยึดจากกฎที่ค้นเจอเท่านั้น (หรือตอบทั่วไปถ้าไม่พบ)
    const answer = await answerQuestion(question, matches ?? []);

    // 4) เก็บ log ไว้ตรวจสอบย้อนหลัง
    await supabase.from("chat_logs").insert({
      question,
      answer,
      matched_rule_ids: (matches ?? []).map((m: { rule_id: string }) => m.rule_id),
    });

    return NextResponse.json({
      answer,
      matchedRules: (matches ?? []).length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}

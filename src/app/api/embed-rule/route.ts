import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { embedText } from "@/lib/gemini";

/**
 * เรียก route นี้ทุกครั้งหลังแอดมิน เพิ่ม/แก้ไข กฎ
 * body: { ruleId: string }
 * ระบบจะลบ embedding เก่าของกฎนั้น แล้วสร้างใหม่จาก title + body
 */
export async function POST(req: NextRequest) {
  try {
    const { ruleId } = await req.json();
    if (!ruleId) {
      return NextResponse.json({ error: "ต้องระบุ ruleId" }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data: rule, error: ruleError } = await supabase
      .from("rules")
      .select("id, code, title, body")
      .eq("id", ruleId)
      .single();

    if (ruleError || !rule) {
      return NextResponse.json({ error: "ไม่พบกฎนี้" }, { status: 404 });
    }

    await supabase.from("rule_embeddings").delete().eq("rule_id", ruleId);

    const chunk = `มาตรา ${rule.code}: ${rule.title}\n${rule.body}`;
    const embedding = await embedText(chunk);

    const { error: insertError } = await supabase.from("rule_embeddings").insert({
      rule_id: rule.id,
      chunk,
      embedding,
    });

    if (insertError) throw insertError;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "สร้าง embedding ไม่สำเร็จ" }, { status: 500 });
  }
}

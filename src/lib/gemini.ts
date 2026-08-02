import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// เก็บเป็นค่าเดียวไว้ที่นี่ที่เดียว ถ้า Google ออกโมเดลใหม่ แก้ตรงนี้จุดเดียวพอ
const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768; // ต้องตรงกับ vector(768) ใน supabase/schema.sql
const CHAT_MODEL = "gemini-3.6-flash";

/** แปลงข้อความเป็นเวกเตอร์ 768 มิติ ด้วย gemini-embedding-001 */
export async function embedText(text: string): Promise<number[]> {
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: { outputDimensionality: EMBEDDING_DIMENSIONS },
  });

  const values = response.embeddings?.[0]?.values;
  if (!values) throw new Error("ไม่ได้รับ embedding กลับมาจาก Gemini");
  return values;
}

type MatchedRule = { rule_id: string; chunk: string; similarity: number };

/**
 * ตอบคำถามผู้เล่น:
 * - ถ้ามีกฎที่เกี่ยวข้อง (matches) → บังคับให้ตอบจากกฎเท่านั้น ห้ามเดาเอง
 * - ถ้าไม่มีกฎที่เกี่ยวข้อง → ตอบแบบผู้ช่วยทั่วไป (เช่น วิธีสมัคร, ปัญหาเทคนิค)
 */
export async function answerQuestion(
  question: string,
  matches: MatchedRule[]
) {
  const hasRuleContext = matches.length > 0;

  const context = matches.map((m, i) => `[${i + 1}] ${m.chunk}`).join("\n\n");

  const systemInstruction = hasRuleContext
    ? `คุณเป็นผู้ช่วยตอบคำถามกฎของเซิร์ฟเวอร์ Roleplay
ตอบจาก "ข้อมูลกฎ" ด้านล่างเท่านั้น ห้ามแต่งกฎขึ้นเองหรือเดา
ถ้าข้อมูลที่ให้มาไม่พอตอบคำถาม ให้บอกตรง ๆ ว่าไม่พบกฎที่เกี่ยวข้อง และแนะนำให้ถามแอดมิน
ตอบเป็นภาษาไทย กระชับ เข้าใจง่าย อ้างอิงเลขมาตรากฎถ้ามีในข้อมูล

ข้อมูลกฎ:
${context}`
    : `คุณเป็นผู้ช่วยทั่วไปของเว็บไซต์เซิร์ฟเวอร์ Roleplay
คำถามนี้ไม่เกี่ยวกับกฎของเซิร์ฟเวอร์โดยตรง ช่วยตอบอย่างเป็นมิตรและเป็นประโยชน์
ถ้าเป็นคำถามเกี่ยวกับกฎที่คุณไม่แน่ใจ ให้แนะนำให้ไปดูหน้ากฎหรือถามแอดมินแทนการเดา
ตอบเป็นภาษาไทย กระชับ เข้าใจง่าย`;

  const response = await ai.models.generateContent({
    model: CHAT_MODEL,
    contents: question,
    config: { systemInstruction },
  });

  return response.text ?? "ขออภัย ไม่สามารถสร้างคำตอบได้ในขณะนี้";
}

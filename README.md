# ทะเบียนกฎหมายเมือง (RMS)

เว็บไซต์กฎของแมพ + วิธีการเล่น + ผู้ช่วย AI (RAG ด้วย Gemini) + แดชบอร์ดแอดมิน low-code

## สแตกที่ใช้
- **Next.js 15 (App Router) + Tailwind CSS v4** — หน้าเว็บ
- **Supabase** — ฐานข้อมูล (Postgres + pgvector), ระบบ login แอดมิน
- **Gemini API** — สร้าง embedding และตอบคำถามผู้เล่น (RAG)
- **Vercel** — hosting (มี free tier)

## ขั้นตอนติดตั้ง

### 1) ตั้งค่า Supabase
1. เข้า [supabase.com](https://supabase.com) → เปิด project ที่สร้างไว้
2. ไปที่ **SQL editor** → รันไฟล์ `supabase/schema.sql` ทั้งหมด (สร้างตาราง + เปิด pgvector + RLS)
3. ไปที่ **Authentication > Users** → กด "Add user" สร้างบัญชีแอดมินคนแรกด้วยอีเมล/รหัสผ่าน
4. กลับไปที่ **SQL editor** รันคำสั่งนี้ (แทน `EMAIL_ที่สร้าง`):
   ```sql
   insert into admin_profiles (user_id, display_name, role)
   select id, 'ผู้ดูแลระบบ', 'owner' from auth.users where email = 'EMAIL_ที่สร้าง';
   ```
5. ไปที่ **Project Settings > API** คัดลอกค่า `Project URL`, `anon public key`, `service_role key`

### 2) ตั้งค่า Gemini API
1. เข้า [aistudio.google.com/apikey](https://aistudio.google.com/apikey) สร้าง API key

### 3) ตั้งค่า environment variables
```bash
cp .env.local.example .env.local
```
แล้วใส่ค่าจาก Supabase และ Gemini ที่ได้ในขั้นตอนก่อนหน้า

### 4) รันเครื่องทดสอบ
```bash
npm install
npm run dev
```
เปิด http://localhost:3000

### 5) เพิ่มกฎแรก
1. เข้า `/admin/login` ล็อกอินด้วยบัญชีแอดมินที่สร้างไว้
2. ไปที่ `/admin/dashboard` → เพิ่มกฎผ่านฟอร์มด้านขวา
3. ระบบจะสร้าง embedding ให้อัตโนมัติ ผู้ช่วย AI จะค้นเจอกฎนี้ทันที

### 6) Deploy ขึ้น Vercel (ฟรี)
1. push โค้ดขึ้น GitHub
2. เข้า [vercel.com](https://vercel.com) → New Project → เลือก repo
3. ใส่ environment variables ชุดเดียวกับ `.env.local` ในหน้า Vercel
4. Deploy

## โครงสร้างโปรเจกต์
```
src/
  app/
    page.tsx              หน้าแรก
    rules/                หน้ากฎของแมพ (public)
    how-to-play/           หน้าวิธีเล่น (public)
    admin/login/           หน้า login แอดมิน
    admin/dashboard/       แดชบอร์ดจัดการกฎ (ต้อง login)
    api/chat/              endpoint สำหรับ AI ตอบคำถาม (RAG)
    api/embed-rule/        endpoint สร้าง embedding ให้กฎ
  components/               UI components
  lib/
    supabase/               client สำหรับเชื่อม Supabase (browser/server)
    gemini.ts                ฟังก์ชัน embed + ตอบคำถามด้วย Gemini
supabase/
  schema.sql                 SQL schema ทั้งหมด รันครั้งเดียวตอนตั้งค่า
```

## เพิ่มแอดมินคนใหม่ภายหลัง
รันใน SQL editor:
```sql
insert into admin_profiles (user_id, display_name, role)
select id, 'ชื่อที่แสดง', 'editor' from auth.users where email = 'อีเมลใหม่';
```
(ต้องสร้าง user ใน Authentication > Users ก่อน)

## แผนต่อยอดที่แนะนำ
- เพิ่มหน้า "จัดการวิธีเล่น (guides)" และ "จัดการหมวดหมู่" ในแดชบอร์ด (โครงสร้างเดียวกับ RulesManager)
- เพิ่มหน้า log การสนทนา AI (`chat_logs`) ให้แอดมินดูคำถามที่ผู้เล่นถามบ่อย เพื่อรู้ว่าควรเพิ่ม/แก้กฎข้อไหน
- ใส่ Refine.dev แทนแดชบอร์ด custom ถ้าต้องการ CRUD ที่ซับซ้อนขึ้น (ตาราง, filter, pagination อัตโนมัติ)

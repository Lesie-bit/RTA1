-- ============================================================
-- RMS (Rules Management System) — Supabase schema
-- รัน SQL นี้ใน Supabase Dashboard > SQL editor
-- ============================================================

-- 1) เปิดใช้งาน pgvector สำหรับเก็บ embedding ของกฎ (ใช้ทำ RAG)
create extension if not exists vector;

-- 2) หมวดหมู่กฎ เช่น "กฎทั่วไป", "กฎแมพ", "กฎแก๊ง/องค์กร"
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 3) ตัวกฎแต่ละข้อ
create table if not exists rules (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  code text not null,               -- เช่น "RP-014" แสดงเป็นเลขมาตรา
  title text not null,
  body text not null,               -- เนื้อหากฎเต็ม ใช้ markdown ได้
  severity text not null default 'normal' check (severity in ('normal','warning','severe')),
  is_published boolean not null default true,
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rules_category_idx on rules(category_id);
create index if not exists rules_published_idx on rules(is_published);

-- 4) เนื้อหาแนะนำวิธีเล่น (แยกจากกฎ เพราะไม่ต้องการ severity/สถานะ)
create table if not exists guides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5) embedding ของกฎ สำหรับให้ AI ค้นหาแล้วตอบเฉพาะจากกฎจริง (RAG)
--    text-embedding-004 ของ Gemini คืนเวกเตอร์ 768 มิติ
create table if not exists rule_embeddings (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references rules(id) on delete cascade,
  chunk text not null,
  embedding vector(768) not null,
  created_at timestamptz not null default now()
);

create index if not exists rule_embeddings_vector_idx
  on rule_embeddings using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- 6) log การถาม-ตอบของ AI (ไว้ตรวจสอบย้อนหลัง/ปรับปรุงกฎ)
create table if not exists chat_logs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  matched_rule_ids uuid[] default '{}',
  created_at timestamptz not null default now()
);

-- 7) ฟังก์ชันค้นหากฎที่ใกล้เคียงที่สุดด้วย cosine similarity
create or replace function match_rules(
  query_embedding vector(768),
  match_count int default 5,
  match_threshold float default 0.5
)
returns table (
  rule_id uuid,
  chunk text,
  similarity float
)
language sql stable
as $$
  select
    rule_embeddings.rule_id,
    rule_embeddings.chunk,
    1 - (rule_embeddings.embedding <=> query_embedding) as similarity
  from rule_embeddings
  join rules on rules.id = rule_embeddings.rule_id
  where rules.is_published = true
    and 1 - (rule_embeddings.embedding <=> query_embedding) > match_threshold
  order by rule_embeddings.embedding <=> query_embedding
  limit match_count;
$$;

-- 8) ตารางสิทธิ์แอดมิน (ผูกกับ auth.users ของ Supabase)
create table if not exists admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'editor' check (role in ('editor','owner')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table categories enable row level security;
alter table rules enable row level security;
alter table guides enable row level security;
alter table rule_embeddings enable row level security;
alter table chat_logs enable row level security;
alter table admin_profiles enable row level security;

-- ผู้เยี่ยมชมทั่วไปอ่านได้เฉพาะกฎที่เผยแพร่แล้ว
create policy "public read categories" on categories for select using (true);
create policy "public read published rules" on rules for select using (is_published = true);
create policy "public read guides" on guides for select using (true);

-- เฉพาะผู้ที่ login แล้วและมีชื่อใน admin_profiles เท่านั้นที่แก้ไขได้
create policy "admin manage categories" on categories for all
  using (exists (select 1 from admin_profiles where user_id = auth.uid()))
  with check (exists (select 1 from admin_profiles where user_id = auth.uid()));

create policy "admin manage rules" on rules for all
  using (exists (select 1 from admin_profiles where user_id = auth.uid()))
  with check (exists (select 1 from admin_profiles where user_id = auth.uid()));

create policy "admin manage guides" on guides for all
  using (exists (select 1 from admin_profiles where user_id = auth.uid()))
  with check (exists (select 1 from admin_profiles where user_id = auth.uid()));

create policy "admin manage embeddings" on rule_embeddings for all
  using (exists (select 1 from admin_profiles where user_id = auth.uid()))
  with check (exists (select 1 from admin_profiles where user_id = auth.uid()));

create policy "admin read chat logs" on chat_logs for select
  using (exists (select 1 from admin_profiles where user_id = auth.uid()));

create policy "service insert chat logs" on chat_logs for insert
  with check (true);

create policy "admin read own profile" on admin_profiles for select
  using (user_id = auth.uid());

-- ============================================================
-- ข้อมูลตัวอย่าง (ลบออกได้ถ้าไม่ต้องการ)
-- ============================================================
insert into categories (name, slug, sort_order) values
  ('กฎทั่วไป', 'general', 1),
  ('กฎแมพ (RP)', 'roleplay', 2),
  ('กฎแก๊ง/องค์กร', 'organizations', 3)
on conflict (slug) do nothing;

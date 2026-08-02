import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // เรียกจาก Server Component ที่ไม่สามารถ set cookie ได้ —
            // ปล่อยผ่านได้ถ้ามี middleware refresh session อยู่แล้ว
          }
        },
      },
    }
  );
}

// ใช้ service role key เฉพาะฝั่ง server เท่านั้น (ข้าม RLS ได้)
// เอาไว้ใช้ตอนสร้าง embedding อัตโนมัติจาก route handler
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/** ตรวจว่าคนที่เรียก API นี้ login แล้วและมี role เป็น owner จริง */
async function requireOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "ยังไม่ได้เข้าสู่ระบบ", status: 401 } as const;

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.role !== "owner") {
    return { error: "ต้องเป็นแอดมิน (owner) เท่านั้น", status: 403 } as const;
  }

  return { user } as const;
}

/** GET: รายชื่อผู้ใช้แอดมินทั้งหมด พร้อมอีเมล (ต้องดึงจาก auth.admin เพราะ email ไม่ได้เก็บใน admin_profiles) */
export async function GET() {
  const check = await requireOwner();
  if ("error" in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const service = createServiceClient();

  const [{ data: profiles }, { data: authList }] = await Promise.all([
    service.from("admin_profiles").select("*").order("created_at"),
    service.auth.admin.listUsers(),
  ]);

  const emailByUserId = new Map(
    (authList?.users ?? []).map((u) => [u.id, u.email])
  );

  const users = (profiles ?? []).map((p) => ({
    ...p,
    email: emailByUserId.get(p.user_id) ?? "(ไม่พบอีเมล)",
  }));

  return NextResponse.json({ users });
}

/** POST: สร้างบัญชีแอดมินใหม่ { email, password, displayName, role } */
export async function POST(req: NextRequest) {
  const check = await requireOwner();
  if ("error" in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const { email, password, displayName, role } = await req.json();

  if (!email || !password || !role) {
    return NextResponse.json(
      { error: "ต้องระบุอีเมล รหัสผ่าน และ role" },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร" },
      { status: 400 }
    );
  }
  if (role !== "owner" && role !== "editor") {
    return NextResponse.json({ error: "role ไม่ถูกต้อง" }, { status: 400 });
  }

  const service = createServiceClient();

  const { data: created, error: createError } =
    await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message ?? "สร้างบัญชีไม่สำเร็จ (อีเมลอาจถูกใช้แล้ว)" },
      { status: 400 }
    );
  }

  const { error: profileError } = await service.from("admin_profiles").insert({
    user_id: created.user.id,
    display_name: displayName || email,
    role,
  });

  if (profileError) {
    // rollback: ลบบัญชี auth ที่สร้างไปถ้าเพิ่ม profile ไม่สำเร็จ
    await service.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: "เพิ่มสิทธิ์แอดมินไม่สำเร็จ" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    user: { user_id: created.user.id, email, display_name: displayName || email, role },
  });
}
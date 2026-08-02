import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

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

/** PATCH: เปลี่ยน role ของผู้ใช้ { role: 'owner' | 'editor' } */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const check = await requireOwner();
  if ("error" in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const { userId } = await params;
  const { role } = await req.json();

  if (role !== "owner" && role !== "editor") {
    return NextResponse.json({ error: "role ไม่ถูกต้อง" }, { status: 400 });
  }

  if (userId === check.user.id && role !== "owner") {
    return NextResponse.json(
      { error: "ลดสิทธิ์ตัวเองไม่ได้ ให้แอดมินคนอื่นเป็นคนเปลี่ยนแทน" },
      { status: 400 }
    );
  }

  const service = createServiceClient();
  const { error } = await service
    .from("admin_profiles")
    .update({ role })
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: "แก้ไข role ไม่สำเร็จ" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/** DELETE: ถอดสิทธิ์แอดมินออก (ลบจาก admin_profiles เท่านั้น บัญชี Supabase Auth ยังอยู่) */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const check = await requireOwner();
  if ("error" in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const { userId } = await params;

  if (userId === check.user.id) {
    return NextResponse.json(
      { error: "ถอดสิทธิ์ตัวเองไม่ได้ ให้แอดมินคนอื่นเป็นคนทำแทน" },
      { status: 400 }
    );
  }

  const service = createServiceClient();
  const { error } = await service
    .from("admin_profiles")
    .delete()
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: "ถอดสิทธิ์ไม่สำเร็จ" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
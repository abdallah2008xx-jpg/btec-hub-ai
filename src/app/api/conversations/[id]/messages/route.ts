import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify conversation belongs to this student
  const { data: conv } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", params.id)
    .eq("student_id", session.user.id)
    .single();

  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", params.id)
    .eq("student_id", session.user.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data });
}

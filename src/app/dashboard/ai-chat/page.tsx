import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AIChatInterface from "@/components/ai-chat/AIChatInterface";

export default async function AIChatPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  const [conversationsRes, assignmentsRes] = await Promise.all([
    supabase
      .from("conversations")
      .select("*")
      .eq("student_id", session.user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("assignments")
      .select("id, title")
      .eq("student_id", session.user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <AIChatInterface
      userId={session.user.id}
      initialConversations={conversationsRes.data || []}
      assignments={assignmentsRes.data || []}
    />
  );
}

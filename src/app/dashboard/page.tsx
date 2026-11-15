import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardHome from "@/components/dashboard/DashboardHome";

export default async function DashboardPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  const [profileRes, assignmentsRes, conversationsRes] = await Promise.all([
    supabase.from("student_profiles").select("*").eq("user_id", session.user.id).single(),
    supabase.from("assignments").select("*, assessment_criteria(count)").eq("student_id", session.user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("conversations").select("*").eq("student_id", session.user.id).order("updated_at", { ascending: false }).limit(5),
  ]);

  return (
    <DashboardHome
      user={session.user}
      profile={profileRes.data}
      assignments={assignmentsRes.data || []}
      recentConversations={conversationsRes.data || []}
    />
  );
}

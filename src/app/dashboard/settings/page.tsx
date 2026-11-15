import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsPage from "@/components/settings/SettingsPage";

export default async function SettingsServerPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  const [profileRes, usageRes, specRes] = await Promise.all([
    supabase.from("student_profiles").select("*").eq("user_id", session.user.id).single(),
    supabase.from("ai_usage").select("tokens_input, tokens_output, model, created_at")
      .eq("student_id", session.user.id).order("created_at", { ascending: false }).limit(50),
    supabase.from("specializations").select("*"),
  ]);

  return (
    <SettingsPage
      user={session.user}
      profile={profileRes.data}
      recentUsage={usageRes.data || []}
      specializations={specRes.data || []}
    />
  );
}

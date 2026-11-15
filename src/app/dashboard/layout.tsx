import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  return (
    <div className="flex h-screen bg-navy-950 overflow-hidden" dir="rtl">
      <DashboardSidebar user={session.user} profile={profile} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar user={session.user} profile={profile} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

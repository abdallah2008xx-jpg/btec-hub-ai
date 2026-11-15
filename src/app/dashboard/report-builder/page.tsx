import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReportBuilder from "@/components/report-builder/ReportBuilder";

export default async function ReportBuilderPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, assessment_criteria(*)")
    .eq("student_id", session.user.id)
    .order("created_at", { ascending: false });

  return <ReportBuilder assignments={assignments || []} userId={session.user.id} />;
}

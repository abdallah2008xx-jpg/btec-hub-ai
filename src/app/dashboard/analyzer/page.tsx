import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AssignmentAnalyzer from "@/components/analyzer/AssignmentAnalyzer";

export default async function AnalyzerPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");
  return <AssignmentAnalyzer userId={session.user.id} />;
}

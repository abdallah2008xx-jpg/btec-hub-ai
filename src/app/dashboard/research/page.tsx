import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ResearchCenter from "@/components/research/ResearchCenter";

export default async function ResearchPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");
  return <ResearchCenter userId={session.user.id} />;
}

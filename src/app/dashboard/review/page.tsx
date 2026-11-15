import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SmartReview from "@/components/review/SmartReview";

export default async function ReviewPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title")
    .eq("student_id", session.user.id)
    .order("created_at", { ascending: false });

  return <SmartReview assignments={assignments || []} userId={session.user.id} />;
}

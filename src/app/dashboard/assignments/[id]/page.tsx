import { createServerClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import AssignmentWorkspace from "@/components/assignments/AssignmentWorkspace";

export default async function AssignmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  const { data: assignment } = await supabase
    .from("assignments")
    .select("*, activities(*, assessment_criteria(*))")
    .eq("id", params.id)
    .eq("student_id", session.user.id)
    .single();

  if (!assignment) notFound();

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*")
    .eq("assignment_id", params.id)
    .eq("student_id", session.user.id)
    .order("updated_at", { ascending: false });

  return (
    <AssignmentWorkspace
      assignment={assignment}
      conversations={conversations || []}
      userId={session.user.id}
    />
  );
}

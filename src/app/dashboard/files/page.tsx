import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FilesPage from "@/components/files/FilesPage";

export default async function MyFilesPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  const { data: files } = await supabase
    .from("uploaded_files")
    .select("*, assignments(title)")
    .eq("student_id", session.user.id)
    .order("created_at", { ascending: false });

  return <FilesPage files={files || []} />;
}

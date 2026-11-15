import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: assignment } = await supabase
    .from("assignments")
    .select("*, activities(*, assessment_criteria(*))")
    .eq("id", params.id)
    .eq("student_id", session.user.id)
    .single();

  if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let context = `# ${assignment.title}\n\n`;
  if (assignment.parsed_data?.qualification) {
    context += `**المؤهل:** ${assignment.parsed_data.qualification}\n`;
  }
  if (assignment.parsed_data?.specialization) {
    context += `**التخصص:** ${assignment.parsed_data.specialization}\n`;
  }
  context += "\n";

  if (assignment.activities) {
    for (const act of assignment.activities) {
      context += `## ${act.activity_number ? `النشاط ${act.activity_number}: ` : ""}${act.title}\n`;
      if (act.description) context += `${act.description}\n`;
      if (act.assessment_criteria?.length > 0) {
        context += `\n### معايير التقييم:\n`;
        for (const c of act.assessment_criteria) {
          const levelAr = c.level === "pass" ? "ناجح" : c.level === "merit" ? "جيد" : "ممتاز";
          context += `- **${c.code}** (${levelAr}): ${c.description}\n`;
        }
      }
      context += "\n";
    }
  }

  return NextResponse.json({ context });
}

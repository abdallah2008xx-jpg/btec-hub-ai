import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { assignmentId, reportFileId, reportText } = await request.json();
    if (!reportText || !assignmentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch assignment with criteria — owned by this student only
    const { data: assignment } = await supabase
      .from("assignments")
      .select("*, assessment_criteria(*), activities(*)")
      .eq("id", assignmentId)
      .eq("student_id", session.user.id)
      .single();

    if (!assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

    const criteriaList = (assignment.assessment_criteria || [])
      .map((c: any) => `- ${c.code} (${c.level}): ${c.description}`)
      .join("\n");

    const reviewPrompt = `أنت خبير في تقييم تقارير BTEC. راجع تقرير الطالب وقارنه مع معايير التكليف.

## معايير التكليف:
${criteriaList || "لا توجد معايير محددة"}

## تقرير الطالب:
${reportText.slice(0, 6000)}

أعد تقييماً شاملاً بتنسيق JSON فقط:
{
  "overall_summary": "ملخص عام للتقرير بالعربية",
  "criteria_coverage": [
    {
      "criteria_code": "P1",
      "criteria_description": "وصف المعيار",
      "level": "pass",
      "found": true,
      "evidence_found": "الدليل الموجود في التقرير",
      "feedback": "تعليق على المعيار"
    }
  ],
  "missing_sections": ["قسم مفقود 1", "قسم مفقود 2"],
  "improvement_suggestions": ["اقتراح 1", "اقتراح 2"],
  "strengths": ["نقطة قوة 1", "نقطة قوة 2"]
}

تذكير: هذا تقييم غير رسمي لمساعدة الطالب فقط.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: reviewPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 3000,
    });

    const reviewResult = JSON.parse(response.choices[0].message.content || "{}");

    const { data: report, error } = await supabase
      .from("review_reports")
      .insert({
        student_id: session.user.id,
        assignment_id: assignmentId,
        report_file_id: reportFileId || null,
        ai_review: reviewResult,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ report, review: reviewResult });
  } catch (error: any) {
    console.error("Review error:", error);
    return NextResponse.json({ error: error.message || "Review failed" }, { status: 500 });
  }
}

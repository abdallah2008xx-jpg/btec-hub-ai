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

    const { fileId, extractedText } = await request.json();
    if (!extractedText) return NextResponse.json({ error: "No text provided" }, { status: 400 });

    const analysisPrompt = `أنت خبير في تحليل تكليفات BTEC. حلّل النص التالي المستخرج من وثيقة تكليف BTEC وأعد البيانات بتنسيق JSON فقط.

النص:
${extractedText.slice(0, 8000)}

أعد الرد بتنسيق JSON بالشكل التالي فقط، بدون أي نص إضافي:
{
  "title": "عنوان التكليف",
  "qualification": "المؤهل (مثل BTEC Level 3)",
  "specialization": "التخصص",
  "units": [
    {
      "unit_number": "رقم الوحدة",
      "title": "عنوان الوحدة",
      "activities": [
        {
          "activity_number": "رقم النشاط",
          "title": "عنوان النشاط",
          "description": "وصف النشاط",
          "criteria": [
            {
              "code": "P1",
              "level": "pass",
              "description": "وصف المعيار"
            }
          ]
        }
      ]
    }
  ],
  "submission_requirements": ["متطلب 1", "متطلب 2"],
  "deadline": "الموعد النهائي إن وجد"
}

ملاحظات:
- استخرج جميع معايير التقييم (P = pass, M = merit, D = distinction)
- إذا لم تجد معلومة، اترك القيمة null
- أعد فقط JSON نظيف بدون markdown`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: analysisPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 4000,
    });

    const parsedData = JSON.parse(response.choices[0].message.content || "{}");

    // Create assignment record
    const { data: assignment, error: assignmentError } = await supabase
      .from("assignments")
      .insert({
        title: parsedData.title || "تكليف جديد",
        student_id: session.user.id,
        file_id: fileId || null,
        raw_text: extractedText,
        parsed_data: parsedData,
        status: "in_progress",
      })
      .select()
      .single();

    if (assignmentError) throw assignmentError;

    // Create activities and criteria
    if (parsedData.units && assignment) {
      for (const unit of parsedData.units) {
        if (!unit.activities) continue;
        for (let ai = 0; ai < unit.activities.length; ai++) {
          const activity = unit.activities[ai];
          const { data: activityRecord } = await supabase
            .from("activities")
            .insert({
              assignment_id: assignment.id,
              student_id: session.user.id,
              title: activity.title,
              description: activity.description || null,
              activity_number: activity.activity_number || null,
              sort_order: ai,
            })
            .select()
            .single();

          if (activityRecord && activity.criteria?.length > 0) {
            const criteriaInserts = activity.criteria.map((c: any) => ({
              assignment_id: assignment.id,
              activity_id: activityRecord.id,
              student_id: session.user.id,
              code: c.code,
              level: (c.level || "pass") as "pass" | "merit" | "distinction",
              description: c.description,
              is_completed: false,
            }));
            await supabase.from("assessment_criteria").insert(criteriaInserts);
          }
        }
      }
    }

    // Update file with assignment_id
    if (fileId && assignment) {
      await supabase.from("uploaded_files")
        .update({ assignment_id: assignment.id })
        .eq("id", fileId);
    }

    return NextResponse.json({ assignment, parsed_data: parsedData });
  } catch (error: any) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: error.message || "Analysis failed" }, { status: 500 });
  }
}

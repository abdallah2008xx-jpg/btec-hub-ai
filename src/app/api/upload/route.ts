import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";
export const maxDuration = 60;

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.js" as any);
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
    const pdf = await loadingTask.promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ") + "\n";
    }
    return text;
  } catch (err) {
    console.error("PDF extraction error:", err);
    return "";
  }
}

async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (err) {
    console.error("DOCX extraction error:", err);
    return "";
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const serviceSupabase = createServiceClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const assignmentId = formData.get("assignment_id") as string | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) return NextResponse.json({ error: "الملف كبير جداً. الحجم الأقصى 50MB." }, { status: 400 });

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "يدعم فقط ملفات PDF وWord" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split(".").pop() || "pdf";
    const fileId = uuidv4();
    const storagePath = `${session.user.id}/${fileId}.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await serviceSupabase.storage
      .from("student-files")
      .upload(storagePath, fileBuffer, { contentType: file.type, upsert: false });

    if (uploadError) throw uploadError;

    // Extract text
    let extractedText = "";
    if (file.type === "application/pdf") {
      extractedText = await extractTextFromPDF(fileBuffer);
    } else {
      extractedText = await extractTextFromDOCX(fileBuffer);
    }

    // Save to database
    const { data: fileRecord, error: dbError } = await supabase
      .from("uploaded_files")
      .insert({
        student_id: session.user.id,
        assignment_id: assignmentId || null,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: storagePath,
        extracted_text: extractedText,
        processing_status: "done",
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ file: fileRecord, extracted_text: extractedText });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}

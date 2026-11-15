"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload, FileText, Loader2, CheckCircle, ChevronDown, ChevronUp,
  Target, BookOpen, X
} from "lucide-react";
import toast from "react-hot-toast";
import { cn, formatFileSize } from "@/lib/utils";

interface ParsedCriteria {
  code: string;
  level: "pass" | "merit" | "distinction";
  description: string;
}

interface ParsedActivity {
  activity_number?: string;
  title: string;
  description?: string;
  criteria: ParsedCriteria[];
}

interface ParsedUnit {
  unit_number?: string;
  title: string;
  activities: ParsedActivity[];
}

interface ParsedAssignment {
  title: string;
  qualification?: string;
  specialization?: string;
  units: ParsedUnit[];
  submission_requirements?: string[];
  deadline?: string;
}

interface Props { userId: string; }

export default function AssignmentAnalyzer({ userId }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedAssignment | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "analyzing" | "done" | "error">("idle");
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set([0]));
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());
  const [isDragOver, setIsDragOver] = useState(false);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);

  function handleFileSelect(selectedFile: File) {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(selectedFile.type)) {
      toast.error("يرجى رفع ملف PDF أو Word فقط");
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error("الملف كبير جداً. الحجم الأقصى 50 ميجابايت");
      return;
    }
    setFile(selectedFile);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  }

  async function uploadAndAnalyze() {
    if (!file) return;
    setUploadStatus("uploading");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || "فشل الرفع");
      }
      const uploadData = await uploadRes.json();

      setUploadStatus("analyzing");
      const analyzeRes = await fetch("/api/analyze-assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: uploadData.file.id,
          extractedText: uploadData.extracted_text,
        }),
      });
      if (!analyzeRes.ok) {
        const err = await analyzeRes.json();
        throw new Error(err.error || "فشل التحليل");
      }
      const analyzeData = await analyzeRes.json();
      setParsedData(analyzeData.parsed_data);
      setAssignmentId(analyzeData.assignment.id);
      setUploadStatus("done");
      toast.success("تم تحليل التكليف بنجاح!");
      setExpandedUnits(
        new Set(
          analyzeData.parsed_data?.units?.map((_: any, i: number) => i) || [0]
        )
      );
    } catch (err: any) {
      setUploadStatus("error");
      toast.error(err.message || "حدث خطأ");
    }
  }

  function toggleUnit(idx: number) {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  function toggleActivity(key: string) {
    setExpandedActivities((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const levelColors = {
    pass: "bg-green-900/30 text-green-400 border-green-700/30",
    merit: "bg-blue-900/30 text-blue-400 border-blue-700/30",
    distinction: "bg-purple-900/30 text-purple-400 border-purple-700/30",
  };
  const levelLabels = { pass: "ناجح", merit: "جيد", distinction: "ممتاز" };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold gradient-text mb-1">محلل التكليف</h1>
        <p className="text-slate-400">ارفع ملف التكليف لاستخراج المعايير والأنشطة تلقائياً</p>
      </div>

      {/* Upload Area */}
      {(uploadStatus === "idle" || uploadStatus === "error") && (
        <div className="glass rounded-2xl p-6">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200",
              isDragOver
                ? "border-purple-400 bg-purple-900/20"
                : "border-purple-900/40 hover:border-purple-500/60 hover:bg-purple-900/10"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
            />
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">
              {file ? file.name : "اسحب الملف هنا أو انقر للاختيار"}
            </h3>
            <p className="text-slate-400 text-sm">
              {file
                ? formatFileSize(file.size)
                : "يدعم ملفات PDF و Word (.doc, .docx) – الحجم الأقصى 50MB"}
            </p>
          </div>

          {file && (
            <div className="mt-4 flex items-center justify-between p-4 bg-navy-800/50 rounded-xl border border-purple-900/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="font-medium text-sm">{file.name}</div>
                  <div className="text-slate-400 text-xs">{formatFileSize(file.size)}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFile(null)}
                  className="text-slate-400 hover:text-red-400 transition-colors p-2"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={uploadAndAnalyze}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                >
                  تحليل التكليف
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress */}
      {(uploadStatus === "uploading" || uploadStatus === "analyzing") && (
        <div className="glass rounded-2xl p-8 text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">
            {uploadStatus === "uploading" ? "جارٍ رفع الملف..." : "جارٍ تحليل التكليف..."}
          </h3>
          <p className="text-slate-400 text-sm">
            {uploadStatus === "uploading"
              ? "يتم استخراج النص من الملف"
              : "يتم تحديد المعايير والأنشطة بالذكاء الاصطناعي"}
          </p>
        </div>
      )}

      {/* Results */}
      {uploadStatus === "done" && parsedData && (
        <div className="space-y-4 animate-slide-up">
          {/* Assignment Info */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h2 className="text-lg font-bold text-green-400">تم تحليل التكليف بنجاح</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">عنوان التكليف</label>
                <div className="bg-navy-800/50 rounded-xl px-4 py-2.5 text-sm font-medium">
                  {parsedData.title}
                </div>
              </div>
              {parsedData.qualification && (
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">المؤهل</label>
                  <div className="bg-navy-800/50 rounded-xl px-4 py-2.5 text-sm">
                    {parsedData.qualification}
                  </div>
                </div>
              )}
              {parsedData.specialization && (
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">التخصص</label>
                  <div className="bg-navy-800/50 rounded-xl px-4 py-2.5 text-sm">
                    {parsedData.specialization}
                  </div>
                </div>
              )}
              {parsedData.deadline && (
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">الموعد النهائي</label>
                  <div className="bg-navy-800/50 rounded-xl px-4 py-2.5 text-sm">
                    {parsedData.deadline}
                  </div>
                </div>
              )}
            </div>
            {parsedData.submission_requirements && parsedData.submission_requirements.length > 0 && (
              <div className="mt-4">
                <label className="text-xs text-slate-400 mb-2 block">متطلبات التسليم</label>
                <ul className="space-y-1">
                  {parsedData.submission_requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                      <span className="text-slate-300">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Units */}
          {parsedData.units?.map((unit, unitIdx) => (
            <div key={unitIdx} className="glass rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleUnit(unitIdx)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600/30 to-blue-600/30 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-purple-300" />
                  </div>
                  <div className="text-right">
                    {unit.unit_number && (
                      <div className="text-xs text-slate-400">الوحدة {unit.unit_number}</div>
                    )}
                    <div className="font-bold">{unit.title}</div>
                  </div>
                </div>
                {expandedUnits.has(unitIdx) ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {expandedUnits.has(unitIdx) && (
                <div className="border-t border-purple-900/30 p-4 space-y-3">
                  {unit.activities?.map((activity, actIdx) => {
                    const actKey = `${unitIdx}-${actIdx}`;
                    return (
                      <div
                        key={actIdx}
                        className="bg-navy-800/40 rounded-xl overflow-hidden border border-purple-900/20"
                      >
                        <button
                          onClick={() => toggleActivity(actKey)}
                          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center">
                              <Target className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="text-right">
                              {activity.activity_number && (
                                <div className="text-xs text-slate-500">
                                  النشاط {activity.activity_number}
                                </div>
                              )}
                              <div className="font-medium text-sm">{activity.title}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">
                              {activity.criteria?.length || 0} معيار
                            </span>
                            {expandedActivities.has(actKey) ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </button>

                        {expandedActivities.has(actKey) && (
                          <div className="border-t border-purple-900/20 p-4 space-y-2">
                            {activity.description && (
                              <p className="text-sm text-slate-400 mb-3 leading-relaxed">
                                {activity.description}
                              </p>
                            )}
                            {activity.criteria?.map((criterion, cIdx) => (
                              <div
                                key={cIdx}
                                className={cn(
                                  "flex items-start gap-3 p-3 rounded-xl border",
                                  levelColors[criterion.level]
                                )}
                              >
                                <span className="font-bold text-sm flex-shrink-0">
                                  {criterion.code}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm leading-relaxed">
                                    {criterion.description}
                                  </div>
                                </div>
                                <span
                                  className={cn(
                                    "text-xs px-2 py-0.5 rounded-lg border flex-shrink-0",
                                    levelColors[criterion.level]
                                  )}
                                >
                                  {levelLabels[criterion.level]}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setUploadStatus("idle");
                setFile(null);
                setParsedData(null);
                setAssignmentId(null);
              }}
              className="glass px-5 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white transition-colors"
            >
              تحليل تكليف آخر
            </button>
            {assignmentId && (
              <button
                onClick={() => router.push(`/dashboard/assignments/${assignmentId}`)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              >
                فتح مساحة التكليف
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

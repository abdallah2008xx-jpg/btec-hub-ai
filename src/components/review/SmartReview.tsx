"use client";
import { useState, useRef } from "react";
import {
  Upload, FileText, Loader2, CheckCircle, XCircle, AlertCircle,
  Star, TrendingUp, AlertTriangle, Lightbulb, X
} from "lucide-react";
import toast from "react-hot-toast";
import { cn, formatFileSize } from "@/lib/utils";

interface Props {
  assignments: { id: string; title: string }[];
  userId: string;
}

interface ReviewResult {
  overall_summary: string;
  criteria_coverage: {
    criteria_code: string;
    criteria_description: string;
    level: string;
    found: boolean;
    evidence_found?: string;
    feedback?: string;
  }[];
  missing_sections: string[];
  improvement_suggestions: string[];
  strengths: string[];
}

export default function SmartReview({ assignments, userId }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "reviewing" | "done" | "error">("idle");
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);

  function handleFileSelect(f: File) {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(f.type)) { toast.error("يرجى رفع ملف PDF أو Word"); return; }
    if (f.size > 50 * 1024 * 1024) { toast.error("الملف كبير جداً"); return; }
    setFile(f);
  }

  async function handleReview() {
    if (!file || !selectedAssignment) {
      toast.error("يرجى اختيار التكليف ورفع تقريرك");
      return;
    }
    setStatus("uploading");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error((await uploadRes.json()).error);
      const uploadData = await uploadRes.json();

      setStatus("reviewing");
      const reviewRes = await fetch("/api/review-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: selectedAssignment,
          reportFileId: uploadData.file.id,
          reportText: uploadData.extracted_text,
        }),
      });
      if (!reviewRes.ok) throw new Error((await reviewRes.json()).error);
      const reviewData = await reviewRes.json();
      setReviewResult(reviewData.review);
      setStatus("done");
      toast.success("اكتملت المراجعة!");
    } catch (err: any) {
      setStatus("error");
      toast.error(err.message || "فشلت المراجعة");
    }
  }

  const levelColors: Record<string, string> = {
    pass: "text-green-400",
    merit: "text-blue-400",
    distinction: "text-purple-400",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold gradient-text mb-1">المراجعة الذكية</h1>
        <p className="text-slate-400">ارفع تقريرك وسيقارنه الذكاء الاصطناعي مع معايير تكليفك</p>
      </div>

      <div className="glass rounded-2xl p-8 border border-amber-700/20 bg-amber-900/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-amber-300 text-sm leading-relaxed">
            هذه المراجعة غير رسمية وتهدف فقط لمساعدتك في تحسين تقريرك. لا تمثل درجة رسمية من المؤسسة التعليمية.
          </p>
        </div>
      </div>

      {/* Setup */}
      {status === "idle" && (
        <div className="glass rounded-2xl p-6 space-y-5">
          {/* Assignment Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">اختر التكليف</label>
            {assignments.length === 0 ? (
              <div className="text-slate-500 text-sm bg-navy-800/50 rounded-xl p-4">
                لا توجد تكليفات محللة. قم بتحليل تكليفك أولاً من صفحة محلل التكليف.
              </div>
            ) : (
              <select
                value={selectedAssignment}
                onChange={(e) => setSelectedAssignment(e.target.value)}
                className="w-full bg-navy-800/50 border border-purple-900/40 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="">-- اختر تكليف --</option>
                {assignments.map((a) => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">ارفع تقريرك</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
                file ? "border-purple-500/60 bg-purple-900/10" : "border-purple-900/40 hover:border-purple-500/60"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-6 h-6 text-purple-400" />
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-slate-400 text-sm">{formatFileSize(file.size)}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="text-slate-400 hover:text-red-400 mr-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">انقر لرفع تقريرك (PDF أو Word)</p>
                </>
              )}
            </div>
          </div>

          <button
            onClick={handleReview}
            disabled={!file || !selectedAssignment}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all duration-200"
          >
            بدء المراجعة الذكية
          </button>
        </div>
      )}

      {/* Loading */}
      {(status === "uploading" || status === "reviewing") && (
        <div className="glass rounded-2xl p-8 text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">
            {status === "uploading" ? "جارٍ رفع التقرير..." : "جارٍ المراجعة بالذكاء الاصطناعي..."}
          </h3>
          <p className="text-slate-400 text-sm">
            {status === "reviewing" ? "يتم مقارنة تقريرك مع معايير التكليف" : "يتم استخراج النص"}
          </p>
        </div>
      )}

      {/* Results */}
      {status === "done" && reviewResult && (
        <div className="space-y-4 animate-slide-up">
          {/* Summary */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" /> ملخص المراجعة
            </h2>
            <p className="text-slate-300 leading-relaxed">{reviewResult.overall_summary}</p>
          </div>

          {/* Strengths */}
          {reviewResult.strengths?.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h2 className="font-bold mb-3 flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" /> نقاط القوة
              </h2>
              <ul className="space-y-2">
                {reviewResult.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Criteria Coverage */}
          {reviewResult.criteria_coverage?.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" /> تغطية المعايير
              </h2>
              <div className="space-y-3">
                {reviewResult.criteria_coverage.map((item, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-4 rounded-xl border",
                      item.found
                        ? "bg-green-900/10 border-green-700/20"
                        : "bg-red-900/10 border-red-700/20"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div className="flex items-center gap-2">
                        {item.found ? (
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        )}
                        <span className="font-bold text-sm">{item.criteria_code}</span>
                        <span className={cn("text-xs", levelColors[item.level] || "text-slate-400")}>
                          ({item.level})
                        </span>
                      </div>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-lg",
                          item.found
                            ? "bg-green-900/30 text-green-400"
                            : "bg-red-900/30 text-red-400"
                        )}
                      >
                        {item.found ? "موجود" : "غير موجود"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-1">{item.criteria_description}</p>
                    {item.evidence_found && (
                      <p className="text-xs text-slate-500 italic">الدليل: {item.evidence_found}</p>
                    )}
                    {item.feedback && (
                      <p className="text-xs text-slate-400 mt-1">{item.feedback}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Sections */}
          {reviewResult.missing_sections?.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h2 className="font-bold mb-3 flex items-center gap-2 text-amber-400">
                <AlertCircle className="w-5 h-5" /> الأقسام المفقودة أو الناقصة
              </h2>
              <ul className="space-y-2">
                {reviewResult.missing_sections.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {reviewResult.improvement_suggestions?.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h2 className="font-bold mb-3 flex items-center gap-2 text-purple-400">
                <Lightbulb className="w-5 h-5" /> اقتراحات للتحسين
              </h2>
              <ul className="space-y-2">
                {reviewResult.improvement_suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => { setStatus("idle"); setFile(null); setReviewResult(null); }}
            className="glass px-5 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white transition-colors"
          >
            مراجعة تقرير آخر
          </button>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { FileEdit, Send, Loader2, Copy, Check, Lightbulb } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";

interface Props {
  assignments: any[];
  userId: string;
}

export default function ReportBuilder({ assignments, userId }: Props) {
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");
  const [userText, setUserText] = useState("");
  const [improvedText, setImprovedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"improve" | "structure">("improve");
  const [copied, setCopied] = useState(false);

  const selectedAsgn = assignments.find((a) => a.id === selectedAssignment);

  async function handleProcess() {
    if (!userText.trim()) { toast.error("أدخل النص أولاً"); return; }
    setLoading(true);
    setImprovedText("");

    const prompt = mode === "improve"
      ? `حسّن الكتابة الأكاديمية التالية مع الحفاظ على المعنى الأصلي:\n\n${userText}\n\nاشرح التحسينات الرئيسية التي أجريتها.`
      : `ساعدني في هيكلة هذا المحتوى كتقرير BTEC احترافي:\n\n${userText}\n\n${selectedAsgn ? `معايير التكليف:\n${selectedAsgn.assessment_criteria?.map((c: any) => `- ${c.code}: ${c.description}`).join("\n")}` : ""}`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          mode: mode === "improve" ? "improve_writing" : "solve_with_me",
          model: "gpt-4o-mini",
        }),
      });

      if (!res.ok) throw new Error("فشل الطلب");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      let accumulated = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                accumulated += parsed.content;
                setImprovedText(accumulated);
              }
            } catch {}
          }
        }
      }
      toast.success("اكتملت العملية!");
    } catch (err: any) {
      toast.error(err.message || "فشل");
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    await navigator.clipboard.writeText(improvedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("تم النسخ");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold gradient-text mb-1">بناء التقرير</h1>
        <p className="text-slate-400">تحسين وهيكلة كتابتك الأكاديمية</p>
      </div>

      {/* Mode Selection */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex gap-3">
          <button
            onClick={() => setMode("improve")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              mode === "improve"
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                : "glass text-slate-400 hover:text-white"
            }`}
          >
            تحسين الكتابة
          </button>
          <button
            onClick={() => setMode("structure")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              mode === "structure"
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                : "glass text-slate-400 hover:text-white"
            }`}
          >
            هيكلة التقرير
          </button>
        </div>

        {/* Assignment (optional for structure mode) */}
        {mode === "structure" && assignments.length > 0 && (
          <div>
            <label className="block text-sm text-slate-400 mb-2">التكليف (اختياري)</label>
            <select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className="w-full bg-navy-800/50 border border-purple-900/40 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors text-sm"
            >
              <option value="">-- بدون تكليف --</option>
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* Input Text */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">
            {mode === "improve" ? "النص الذي تريد تحسينه" : "المحتوى الذي تريد هيكلته"}
          </label>
          <textarea
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            placeholder={
              mode === "improve"
                ? "الصق نصك هنا لتحسينه أكاديمياً..."
                : "الصق محتوى تقريرك هنا لهيكلته..."
            }
            rows={8}
            className="w-full bg-navy-800/50 border border-purple-900/40 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none leading-relaxed text-sm"
          />
        </div>

        <button
          onClick={handleProcess}
          disabled={loading || !userText.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> جارٍ المعالجة...</>
          ) : (
            <><Send className="w-5 h-5" /> {mode === "improve" ? "تحسين الكتابة" : "هيكلة التقرير"}</>
          )}
        </button>
      </div>

      {/* Result */}
      {improvedText && (
        <div className="glass rounded-2xl p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold flex items-center gap-2">
              <FileEdit className="w-5 h-5 text-purple-400" />
              {mode === "improve" ? "النص المحسَّن" : "التقرير المهيكَل"}
            </h2>
            <button
              onClick={copyResult}
              className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-colors"
            >
              {copied ? <><Check className="w-3.5 h-3.5 text-green-400" /> تم النسخ</> : <><Copy className="w-3.5 h-3.5" /> نسخ</>}
            </button>
          </div>
          <div className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{improvedText}</ReactMarkdown>
            {loading && (
              <span className="inline-block w-2 h-4 bg-purple-400 animate-pulse ml-1 align-middle" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

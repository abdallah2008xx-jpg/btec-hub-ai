"use client";
import { useState } from "react";
import { Search, Loader2, ExternalLink, BookOpen, Lightbulb } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";

interface Props { userId: string; }

export default function ResearchCenter({ userId }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const suggestions = [
    "مفهوم إدارة المشاريع في BTEC",
    "أساليب البحث الكمي والنوعي",
    "نظريات القيادة وأنماطها",
    "مبادئ التسويق الرقمي",
    "أساسيات الشبكات وأمن المعلومات",
    "مفهوم الاستدامة في الأعمال",
  ];

  async function handleSearch() {
    if (!query.trim()) { toast.error("أدخل موضوع البحث"); return; }
    setLoading(true);
    setResults("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `ابحث لي عن معلومات موثوقة حول: "${query}"

أريد:
1. ملخصاً واضحاً للموضوع
2. أهم المفاهيم والمصطلحات
3. اقتراح مصادر أكاديمية موثوقة (كتب، مجلات، مواقع رسمية)
4. كيفية الاستشهاد بالمصادر بأسلوب APA

تذكر: لا تخترع مصادر غير موجودة. إذا لم تكن متأكداً من وجود مصدر، اذكر ذلك.`,
            },
          ],
          mode: "research_assistant",
          model: "gpt-4o-mini",
        }),
      });

      if (!res.ok) throw new Error("فشل البحث");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      let accumulated = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                accumulated += parsed.content;
                setResults(accumulated);
              }
            } catch {}
          }
        }
      }
    } catch (err: any) {
      toast.error(err.message || "فشل البحث");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold gradient-text mb-1">مركز البحث</h1>
        <p className="text-slate-400">ابحث عن معلومات ومصادر أكاديمية موثوقة</p>
      </div>

      {/* Search Input */}
      <div className="glass rounded-2xl p-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="ابحث عن أي موضوع أكاديمي..."
              className="w-full bg-navy-800/50 border border-purple-900/40 rounded-xl px-4 py-3 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            بحث
          </button>
        </div>

        {/* Suggestions */}
        {!results && !loading && (
          <div className="mt-4">
            <p className="text-xs text-slate-500 mb-2">مقترحات:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="text-xs glass px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading && !results && (
        <div className="glass rounded-2xl p-8 text-center">
          <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400">جارٍ البحث...</p>
        </div>
      )}

      {results && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h2 className="font-bold">نتائج البحث</h2>
          </div>
          <div className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{results}</ReactMarkdown>
            {loading && (
              <span className="inline-block w-2 h-4 bg-purple-400 animate-pulse ml-1 align-middle" />
            )}
          </div>
          {!loading && (
            <div className="mt-4 p-3 bg-amber-900/10 border border-amber-700/20 rounded-xl">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300">
                  تحقق دائماً من المصادر المقترحة. الذكاء الاصطناعي قد يقترح مصادر غير دقيقة أحياناً.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

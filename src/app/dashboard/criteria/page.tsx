import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CriteriaPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold gradient-text mb-1">دليل المعايير</h1>
        <p className="text-slate-400">فهم معايير التقييم في BTEC</p>
      </div>

      {/* Overview */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-4">مستويات التقييم</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              level: "Pass – ناجح",
              code: "P",
              color: "green",
              desc: "الحد الأدنى المطلوب لاجتياز التكليف. يتطلب تغطية الأساسيات وإثبات الفهم.",
              keywords: ["Describe – وصف", "Identify – تحديد", "State – ذكر", "Outline – إيجاز"],
            },
            {
              level: "Merit – جيد",
              code: "M",
              color: "blue",
              desc: "يتطلب تحليلاً أعمق وفهماً أكثر شمولاً مع الربط بين الأفكار.",
              keywords: ["Explain – شرح", "Analyse – تحليل", "Compare – مقارنة", "Discuss – نقاش"],
            },
            {
              level: "Distinction – ممتاز",
              code: "D",
              color: "purple",
              desc: "أعلى مستوى. يتطلب تقييماً نقدياً وتبريراً منطقياً وقدرة على الاستنتاج.",
              keywords: ["Evaluate – تقييم", "Justify – تبرير", "Assess – تقدير", "Critique – نقد"],
            },
          ].map((item) => (
            <div
              key={item.level}
              className={`rounded-xl p-5 border ${
                item.color === "green"
                  ? "bg-green-900/10 border-green-700/30"
                  : item.color === "blue"
                  ? "bg-blue-900/10 border-blue-700/30"
                  : "bg-purple-900/10 border-purple-700/30"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    item.color === "green"
                      ? "bg-green-900/40 text-green-400"
                      : item.color === "blue"
                      ? "bg-blue-900/40 text-blue-400"
                      : "bg-purple-900/40 text-purple-400"
                  }`}
                >
                  {item.code}
                </span>
                <span className="font-bold text-sm">{item.level}</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-3">{item.desc}</p>
              <div className="space-y-1">
                {item.keywords.map((kw) => (
                  <div key={kw} className="text-xs text-slate-300 flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-slate-500 flex-shrink-0" />
                    {kw}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Command Words */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-4">كلمات الأوامر (Command Words)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-900/30">
                <th className="text-right py-2 px-3 text-slate-400 font-medium">الكلمة</th>
                <th className="text-right py-2 px-3 text-slate-400 font-medium">المستوى</th>
                <th className="text-right py-2 px-3 text-slate-400 font-medium">المعنى وما يُتوقع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/20">
              {[
                { word: "Describe / صف", level: "Pass", meaning: "اذكر الخصائص والميزات الرئيسية بوضوح" },
                { word: "Identify / حدد", level: "Pass", meaning: "اذكر شيئاً محدداً أو اختر الصواب من بين خيارات" },
                { word: "State / اذكر", level: "Pass", meaning: "أعطِ إجابة موجزة ومحددة" },
                { word: "Outline / أجمل", level: "Pass", meaning: "أعطِ نظرة عامة موجزة على الموضوع" },
                { word: "Explain / اشرح", level: "Merit", meaning: "وضّح السبب والنتيجة مع تفاصيل كافية" },
                { word: "Analyse / حلّل", level: "Merit", meaning: "قسّم الموضوع إلى أجزاء وادرس العلاقات" },
                { word: "Compare / قارن", level: "Merit", meaning: "أوجد أوجه التشابه والاختلاف" },
                { word: "Evaluate / قيّم", level: "Distinction", meaning: "اصدر حكماً مبنياً على أدلة وحجج" },
                { word: "Justify / برّر", level: "Distinction", meaning: "دعّم قرارك أو اقتراحك بحجج منطقية" },
                { word: "Assess / قدّر", level: "Distinction", meaning: "وازن الإيجابيات والسلبيات ثم أعطِ حكماً" },
              ].map((row) => (
                <tr key={row.word} className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-3 font-medium">{row.word}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-lg ${
                        row.level === "Pass"
                          ? "bg-green-900/30 text-green-400"
                          : row.level === "Merit"
                          ? "bg-blue-900/30 text-blue-400"
                          : "bg-purple-900/30 text-purple-400"
                      }`}
                    >
                      {row.level}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{row.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tips */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-4">نصائح للنجاح</h2>
        <div className="space-y-3">
          {[
            "اقرأ كل معيار بعناية وتأكد أنك تجيب على المطلوب بالضبط",
            "لا تنسَ تغطية جميع المعايير — Pass أولاً، ثم Merit، ثم Distinction",
            "استخدم أمثلة واقعية وحقيقية لدعم إجاباتك",
            "ارجع دائماً إلى المصادر الأكاديمية الموثوقة",
            "اقرأ تعليمات التقييم (Assessment Brief) أكثر من مرة",
            "تأكد من تنسيق التقرير وفق متطلبات المؤسسة",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-navy-800/40">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600/40 to-blue-600/40 flex items-center justify-center flex-shrink-0 text-xs font-bold text-purple-300">
                {i + 1}
              </div>
              <p className="text-sm text-slate-300">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

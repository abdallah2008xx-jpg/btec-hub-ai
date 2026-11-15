"use client";
import Link from "next/link";
import { useState } from "react";
import { Brain, BookOpen, FileText, Search, Star, Shield, Zap, Users, ChevronRight, Menu, X } from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    { icon: Brain, title: "ذكاء اصطناعي متخصص", desc: "مدرب خصيصاً على مناهج BTEC ومعايير التقييم", color: "purple" },
    { icon: FileText, title: "محلل التكليفات", desc: "يحلل ملفات PDF وWord ويستخرج المعايير تلقائياً", color: "blue" },
    { icon: BookOpen, title: "7 أوضاع مساعدة", desc: "شرح، حل، مراجعة، بحث، دراسة وأكثر", color: "green" },
    { icon: Search, title: "مساعد البحث", desc: "يقترح مصادر موثوقة وأكاديمية ذات صلة", color: "yellow" },
    { icon: Shield, title: "خصوصية تامة", desc: "بياناتك وملفاتك خاصة بك تماماً", color: "red" },
    { icon: Zap, title: "استجابات فورية", desc: "نتائج دقيقة في ثوانٍ", color: "indigo" },
  ];

  const modes = [
    { id: 1, title: "شرح التكليف", desc: "يشرح التكليف بالعربية بأسلوب واضح ومبسط", icon: "📖" },
    { id: 2, title: "حل معاً", desc: "يساعدك خطوة بخطوة في تطوير إجاباتك", icon: "🤝" },
    { id: 3, title: "شرح المعايير", desc: "يوضح ما المطلوب لكل مستوى Pass / Merit / Distinction", icon: "🎯" },
    { id: 4, title: "تحسين الكتابة", desc: "يحسن أسلوبك الأكاديمي مع الحفاظ على أفكارك", icon: "✍️" },
    { id: 5, title: "مراجعة التقرير", desc: "يقارن تقريرك مع معايير التكليف", icon: "🔍" },
    { id: 6, title: "مساعد البحث", desc: "يجد مصادر موثوقة وذات صلة بموضوعك", icon: "🔬" },
    { id: 7, title: "وضع الدراسة", desc: "يختبر فهمك بأسئلة وتمارين تفاعلية", icon: "📚" },
  ];

  return (
    <div className="min-h-screen bg-navy-950 text-white overflow-x-hidden" dir="rtl">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">BTEC HUB AI</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-slate-400 hover:text-white transition-colors text-sm">المزايا</Link>
              <Link href="#modes" className="text-slate-400 hover:text-white transition-colors text-sm">الأوضاع</Link>
              <Link href="/auth/login" className="text-slate-400 hover:text-white transition-colors text-sm">تسجيل الدخول</Link>
              <Link href="/auth/register" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-purple-900/30">
                ابدأ مجاناً
              </Link>
            </div>
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-navy-900 border-t border-purple-900/30 py-4 px-4 flex flex-col gap-3">
            <Link href="#features" className="text-slate-400 hover:text-white py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>المزايا</Link>
            <Link href="#modes" className="text-slate-400 hover:text-white py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>الأوضاع</Link>
            <Link href="/auth/login" className="text-slate-400 hover:text-white py-2 text-sm">تسجيل الدخول</Link>
            <Link href="/auth/register" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold text-center">ابدأ مجاناً</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-purple-900/30 border border-purple-700/30 rounded-full px-4 py-2 text-sm text-purple-300 mb-8">
            <Zap className="w-4 h-4" />
            <span>المساعد الأكاديمي الذكي لطلاب BTEC في الأردن</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            نجح في <span className="gradient-text">BTEC</span>
            <br />بمساعدة الذكاء الاصطناعي
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            نظام ذكاء اصطناعي متخصص يفهم معايير BTEC، يحلل تكليفاتك، ويساعدك على النجاح بأسلوب واضح وعملي
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-200 shadow-lg shadow-purple-900/40 flex items-center gap-2 justify-center">
              ابدأ مجاناً الآن
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="/auth/login" className="border border-purple-700/50 hover:border-purple-500 text-slate-300 hover:text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-200 flex items-center gap-2 justify-center">
              تسجيل الدخول
            </Link>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[["١٠٠٪","دقة المعايير"],["٧","أوضاع مساعدة"],["آمن","خصوصية تامة"]].map(([num,label])=>(
              <div key={label} className="text-center">
                <div className="text-3xl font-bold gradient-text">{num}</div>
                <div className="text-sm text-slate-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">كل ما تحتاجه للنجاح</h2>
            <p className="text-slate-400 text-lg">منظومة متكاملة لمساعدتك في كل مرحلة من مراحل دراسة BTEC</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="glass rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center mb-4 group-hover:from-purple-600/40 group-hover:to-blue-600/40 transition-all duration-300">
                  <f.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Modes */}
      <section id="modes" className="py-24 px-4 bg-navy-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">٧ أوضاع مساعدة ذكية</h2>
            <p className="text-slate-400 text-lg">كل وضع مصمم لمساعدتك في حالة مختلفة</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {modes.map((m) => (
              <div key={m.id} className="glass rounded-2xl p-5 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group hover:scale-105">
                <div className="text-3xl mb-3">{m.icon}</div>
                <h3 className="font-bold mb-2">{m.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-blue-900/30 pointer-events-none" />
            <div className="relative">
              <h2 className="text-4xl font-bold mb-4">جاهز لتبدأ رحلتك؟</h2>
              <p className="text-slate-400 mb-8 text-lg">سجّل مجاناً وابدأ بتحليل تكليفاتك الآن</p>
              <Link href="/auth/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-200 shadow-lg shadow-purple-900/40">
                ابدأ مجاناً
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-900/30 py-8 px-4 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="text-purple-400 font-bold">BTEC HUB AI</span>
        </div>
        <p>© {new Date().getFullYear()} BTEC HUB AI – المساعد الأكاديمي الذكي لطلاب BTEC في الأردن</p>
      </footer>
    </div>
  );
}

"use client";
import Link from "next/link";
import { MessageSquare, FileText, Upload, Target, TrendingUp, Zap, Plus, ChevronLeft, Brain, Clock } from "lucide-react";
import { formatDate, truncate } from "@/lib/utils";

interface Props {
  user: any;
  profile: any;
  assignments: any[];
  recentConversations: any[];
}

export default function DashboardHome({ user, profile, assignments, recentConversations }: Props) {
  const stats = [
    { label: "التكليفات", value: assignments.length, icon: FileText, href: "/dashboard/assignments" },
    { label: "المحادثات", value: recentConversations.length, icon: MessageSquare, href: "/dashboard/ai-chat" },
    { label: "الاستخدام اليومي", value: `${profile?.ai_usage_today || 0}/${profile?.daily_limit || 50}`, icon: Zap, href: "/dashboard/settings" },
    { label: "الحالة", value: "نشط", icon: TrendingUp, href: "/dashboard/settings" },
  ];

  const quickActions = [
    { href: "/dashboard/ai-chat", icon: MessageSquare, label: "بدء محادثة", desc: "تحدث مع BTEC AI", color: "from-purple-600 to-blue-600" },
    { href: "/dashboard/analyzer", icon: Upload, label: "تحليل تكليف", desc: "ارفع ملف PDF أو Word", color: "from-blue-600 to-cyan-600" },
    { href: "/dashboard/review", icon: Target, label: "مراجعة ذكية", desc: "راجع تقريرك", color: "from-green-600 to-emerald-600" },
    { href: "/dashboard/research", icon: Brain, label: "مركز البحث", desc: "ابحث عن مصادر", color: "from-pink-600 to-rose-600" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="glass rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-blue-900/20 pointer-events-none" />
        <div className="relative">
          <h1 className="text-3xl font-bold mb-2">
            مرحباً، <span className="gradient-text">{profile?.full_name || "الطالب"}</span> 👋
          </h1>
          <p className="text-slate-400 text-lg">ما الذي تريد الإنجاز اليوم؟</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className="glass rounded-2xl p-5 hover:border-purple-500/40 transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-sm">{s.label}</span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center group-hover:from-purple-600/40 group-hover:to-blue-600/40 transition-all">
                <s.icon className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="text-2xl font-bold gradient-text">{s.value}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" /> إجراءات سريعة
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(a => (
            <Link key={a.href} href={a.href} className="glass rounded-2xl p-5 hover:border-purple-500/40 transition-all duration-300 hover:scale-105 group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center mb-3 opacity-80 group-hover:opacity-100 transition-opacity`}>
                <a.icon className="w-5 h-5 text-white" />
              </div>
              <div className="font-bold mb-1">{a.label}</div>
              <div className="text-slate-400 text-xs">{a.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assignments */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2"><FileText className="w-5 h-5 text-purple-400" /> آخر التكليفات</h3>
            <Link href="/dashboard/assignments" className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1">
              عرض الكل <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          {assignments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">لا توجد تكليفات بعد</p>
              <Link href="/dashboard/analyzer" className="mt-3 inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm">
                <Plus className="w-4 h-4" /> إضافة تكليف
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((a: any) => (
                <Link key={a.id} href={`/dashboard/assignments/${a.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate group-hover:text-purple-300 transition-colors">{a.title}</div>
                    <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {formatDate(a.created_at)}
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-lg flex-shrink-0 ${
                    a.status === "completed" ? "bg-green-900/30 text-green-400" :
                    a.status === "in_progress" ? "bg-blue-900/30 text-blue-400" :
                    "bg-slate-700/30 text-slate-400"
                  }`}>
                    {a.status === "completed" ? "مكتمل" : a.status === "in_progress" ? "جارٍ" : "معلق"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Conversations */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2"><MessageSquare className="w-5 h-5 text-blue-400" /> آخر المحادثات</h3>
            <Link href="/dashboard/ai-chat" className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1">
              عرض الكل <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          {recentConversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">لا توجد محادثات بعد</p>
              <Link href="/dashboard/ai-chat" className="mt-3 inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm">
                <Plus className="w-4 h-4" /> محادثة جديدة
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentConversations.map((c: any) => (
                <Link key={c.id} href={`/dashboard/ai-chat?conv=${c.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate group-hover:text-blue-300 transition-colors">{c.title}</div>
                    {c.last_message && (
                      <div className="text-slate-500 text-xs truncate mt-0.5">{truncate(c.last_message, 50)}</div>
                    )}
                    <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {formatDate(c.updated_at)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

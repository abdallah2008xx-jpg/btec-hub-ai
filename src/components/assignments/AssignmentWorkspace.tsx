"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText, MessageSquare, Target, CheckCircle, Circle, ChevronLeft,
  BookOpen, Lightbulb, Search, Clock
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface Props {
  assignment: any;
  conversations: any[];
  userId: string;
}

export default function AssignmentWorkspace({ assignment, conversations, userId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [localCriteria, setLocalCriteria] = useState<any[]>(
    assignment.activities?.flatMap((a: any) => a.assessment_criteria || []) || []
  );

  const totalCriteria = localCriteria.length;
  const completedCriteria = localCriteria.filter((c) => c.is_completed).length;
  const progress =
    totalCriteria > 0 ? Math.round((completedCriteria / totalCriteria) * 100) : 0;

  async function toggleCriteria(criteriaId: string, current: boolean) {
    const { error } = await supabase
      .from("assessment_criteria")
      .update({ is_completed: !current })
      .eq("id", criteriaId)
      .eq("student_id", userId);
    if (!error) {
      setLocalCriteria((prev) =>
        prev.map((c) =>
          c.id === criteriaId ? { ...c, is_completed: !current } : c
        )
      );
    }
  }

  async function openAIForMode(mode: string, label: string) {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${label} – ${assignment.title}`,
          mode,
          assignment_id: assignment.id,
        }),
      });
      const data = await res.json();
      if (data.conversation) {
        router.push(`/dashboard/ai-chat?conv=${data.conversation.id}`);
      }
    } catch {
      toast.error("فشل في فتح المحادثة");
    }
  }

  const levelColors: Record<string, string> = {
    pass: "bg-green-900/30 text-green-400 border-green-700/30",
    merit: "bg-blue-900/30 text-blue-400 border-blue-700/30",
    distinction: "bg-purple-900/30 text-purple-400 border-purple-700/30",
  };
  const levelLabels: Record<string, string> = {
    pass: "ناجح",
    merit: "جيد",
    distinction: "ممتاز",
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Breadcrumb + Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <Link href="/dashboard/assignments" className="hover:text-white transition-colors">
              تكليفاتي
            </Link>
            <ChevronLeft className="w-4 h-4" />
            <span className="text-white truncate max-w-xs">{assignment.title}</span>
          </div>
          <h1 className="text-2xl font-bold">{assignment.title}</h1>
          {assignment.parsed_data?.qualification && (
            <p className="text-slate-400 text-sm mt-1">{assignment.parsed_data.qualification}</p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link
            href={`/dashboard/review?assignment=${assignment.id}`}
            className="glass px-4 py-2 rounded-xl text-sm text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
          >
            <Target className="w-4 h-4" /> مراجعة ذكية
          </Link>
          <button
            onClick={() => openAIForMode("general", "محادثة")}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:from-purple-500 hover:to-blue-500"
          >
            <MessageSquare className="w-4 h-4" /> بدء محادثة
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">تقدم الإنجاز</h3>
          <span className="text-2xl font-bold gradient-text">{progress}%</span>
        </div>
        <div className="h-2.5 bg-navy-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-sm text-slate-400">
          {completedCriteria} من {totalCriteria} معيار مكتمل
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activities & Criteria */}
        <div className="lg:col-span-2 space-y-4">
          {assignment.activities?.map((activity: any) => (
            <div key={activity.id} className="glass rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-purple-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    {activity.activity_number && (
                      <div className="text-xs text-slate-500">النشاط {activity.activity_number}</div>
                    )}
                    <div className="font-bold">{activity.title}</div>
                  </div>
                </div>
                {activity.description && (
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                    {activity.description}
                  </p>
                )}
              </div>
              <div className="p-4 space-y-2">
                {activity.assessment_criteria?.map((criterion: any) => (
                  <div
                    key={criterion.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-navy-800/40 hover:bg-navy-800/60 transition-colors group"
                  >
                    <button
                      onClick={() => toggleCriteria(criterion.id, criterion.is_completed)}
                      className="mt-0.5 flex-shrink-0"
                    >
                      {criterion.is_completed ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">{criterion.code}</span>
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-lg border",
                            levelColors[criterion.level]
                          )}
                        >
                          {levelLabels[criterion.level]}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "text-sm leading-relaxed",
                          criterion.is_completed
                            ? "line-through text-slate-500"
                            : "text-slate-300"
                        )}
                      >
                        {criterion.description}
                      </p>
                    </div>
                    <button
                      onClick={() => openAIForMode("explain_criteria", `شرح ${criterion.code}`)}
                      className="hidden group-hover:flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors flex-shrink-0 px-2 py-1 rounded-lg glass"
                    >
                      <Lightbulb className="w-3 h-3" /> شرح
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-bold mb-4 text-sm">إجراءات سريعة</h3>
            <div className="space-y-2">
              {[
                { icon: BookOpen, label: "شرح التكليف", mode: "explain_assignment" },
                { icon: Lightbulb, label: "مساعدة في الحل", mode: "solve_with_me" },
                { icon: Target, label: "شرح المعايير", mode: "explain_criteria" },
                { icon: Search, label: "مساعد البحث", mode: "research_assistant" },
              ].map((action) => (
                <button
                  key={action.mode}
                  onClick={() => openAIForMode(action.mode, action.label)}
                  className="w-full flex items-center gap-2 p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
                >
                  <action.icon className="w-4 h-4 text-purple-400" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Related Conversations */}
          {conversations.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <h3 className="font-bold mb-4 text-sm">المحادثات المرتبطة</h3>
              <div className="space-y-2">
                {conversations.map((conv: any) => (
                  <Link
                    key={conv.id}
                    href={`/dashboard/ai-chat?conv=${conv.id}`}
                    className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-slate-300 group-hover:text-white truncate transition-colors">
                        {conv.title}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatDate(conv.updated_at)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Info Card */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-bold mb-3 text-sm">معلومات</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">الحالة</span>
                <span
                  className={
                    assignment.status === "completed"
                      ? "text-green-400"
                      : assignment.status === "in_progress"
                      ? "text-blue-400"
                      : "text-slate-400"
                  }
                >
                  {assignment.status === "completed"
                    ? "مكتمل"
                    : assignment.status === "in_progress"
                    ? "جارٍ"
                    : "معلق"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">الأنشطة</span>
                <span>{assignment.activities?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">المعايير</span>
                <span>{totalCriteria}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">تاريخ الإضافة</span>
                <span className="text-xs">{formatDate(assignment.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Plus, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AssignmentsPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  const { data: assignments } = await supabase
    .from("assignments")
    .select("*, assessment_criteria(id, is_completed)")
    .eq("student_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text mb-1">تكليفاتي</h1>
          <p className="text-slate-400">جميع تكليفاتك المحللة</p>
        </div>
        <Link
          href="/dashboard/analyzer"
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
        >
          <Plus className="w-4 h-4" /> تكليف جديد
        </Link>
      </div>

      {!assignments || assignments.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <FileText className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2 text-slate-400">لا توجد تكليفات بعد</h3>
          <p className="text-slate-500 mb-6">ارفع ملف تكليفك لتبدأ التحليل الذكي</p>
          <Link
            href="/dashboard/analyzer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold"
          >
            <Plus className="w-4 h-4" /> إضافة تكليف
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((a: any) => {
            const totalCriteria = a.assessment_criteria?.length || 0;
            const completedCriteria =
              a.assessment_criteria?.filter((c: any) => c.is_completed).length || 0;
            const progress =
              totalCriteria > 0
                ? Math.round((completedCriteria / totalCriteria) * 100)
                : 0;
            return (
              <Link
                key={a.id}
                href={`/dashboard/assignments/${a.id}`}
                className="glass rounded-2xl p-5 hover:border-purple-500/40 transition-all duration-300 group hover:scale-[1.01]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center flex-shrink-0 group-hover:from-purple-600/40 group-hover:to-blue-600/40 transition-all">
                      <FileText className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold mb-1 group-hover:text-purple-300 transition-colors truncate">
                        {a.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(a.created_at)}
                        </span>
                        {totalCriteria > 0 && (
                          <span>
                            {completedCriteria}/{totalCriteria} معيار مكتمل
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-lg flex-shrink-0 ${
                      a.status === "completed"
                        ? "bg-green-900/30 text-green-400"
                        : a.status === "in_progress"
                        ? "bg-blue-900/30 text-blue-400"
                        : "bg-slate-700/30 text-slate-400"
                    }`}
                  >
                    {a.status === "completed"
                      ? "مكتمل"
                      : a.status === "in_progress"
                      ? "جارٍ"
                      : "معلق"}
                  </span>
                </div>
                {totalCriteria > 0 && (
                  <div className="mt-4">
                    <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-500 mt-1 text-left">
                      {progress}% مكتمل
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

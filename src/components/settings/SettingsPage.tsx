"use client";
import { useState } from "react";
import { User, Zap, Shield, Bell, Save, Loader2, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

interface Props {
  user: any;
  profile: any;
  recentUsage: any[];
  specializations: any[];
}

export default function SettingsPage({ user, profile, recentUsage, specializations }: Props) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [studentId, setStudentId] = useState(profile?.student_id || "");
  const [preferredLang, setPreferredLang] = useState<"ar" | "en">(profile?.preferred_language || "ar");
  const [specializationId, setSpecializationId] = useState(profile?.specialization_id || "");

  const totalTokens = recentUsage.reduce(
    (acc: number, u: any) => acc + (u.tokens_input || 0) + (u.tokens_output || 0),
    0
  );

  async function saveProfile() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("student_profiles")
        .update({
          full_name: fullName,
          student_id: studentId || null,
          preferred_language: preferredLang,
          specialization_id: specializationId || null,
        })
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("تم حفظ الإعدادات");
    } catch (err: any) {
      toast.error(err.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  const usagePercent = profile
    ? Math.min(100, Math.round(((profile.ai_usage_today || 0) / (profile.daily_limit || 50)) * 100))
    : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold gradient-text mb-1">الإعدادات</h1>
        <p className="text-slate-400">إدارة حسابك وتفضيلاتك</p>
      </div>

      {/* Profile */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
          <User className="w-5 h-5 text-purple-400" /> الملف الشخصي
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">الاسم الكامل</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-navy-800/50 border border-purple-900/40 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="أدخل اسمك الكامل"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">البريد الإلكتروني</label>
            <input
              value={user?.email || ""}
              disabled
              className="w-full bg-navy-800/30 border border-purple-900/20 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">رقم الطالب (اختياري)</label>
            <input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full bg-navy-800/50 border border-purple-900/40 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="رقم الطالب في مؤسستك"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">التخصص</label>
            <select
              value={specializationId}
              onChange={(e) => setSpecializationId(e.target.value)}
              className="w-full bg-navy-800/50 border border-purple-900/40 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="">-- اختر تخصصك --</option>
              {specializations.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name_ar}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">لغة التفاعل المفضلة</label>
            <div className="flex gap-3">
              <button
                onClick={() => setPreferredLang("ar")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  preferredLang === "ar"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "glass text-slate-400 hover:text-white"
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => setPreferredLang("en")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  preferredLang === "en"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "glass text-slate-400 hover:text-white"
                }`}
              >
                English
              </button>
            </div>
          </div>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-200"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ التغييرات
          </button>
        </div>
      </div>

      {/* AI Usage */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" /> استخدام الذكاء الاصطناعي
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 text-sm">الاستخدام اليومي</span>
            <span className="font-bold">
              {profile?.ai_usage_today || 0} / {profile?.daily_limit || 50} طلب
            </span>
          </div>
          <div className="h-2.5 bg-navy-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                usagePercent > 80
                  ? "bg-gradient-to-r from-red-600 to-red-500"
                  : usagePercent > 60
                  ? "bg-gradient-to-r from-yellow-600 to-yellow-500"
                  : "bg-gradient-to-r from-purple-600 to-blue-600"
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-navy-800/50 rounded-xl p-4">
              <div className="text-slate-400 text-xs mb-1">إجمالي الطلبات</div>
              <div className="text-xl font-bold gradient-text">{profile?.ai_usage_total || 0}</div>
            </div>
            <div className="bg-navy-800/50 rounded-xl p-4">
              <div className="text-slate-400 text-xs mb-1">الرموز المستخدمة (آخر 50)</div>
              <div className="text-xl font-bold gradient-text">
                {totalTokens.toLocaleString("ar")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-400" /> الأمان والخصوصية
        </h2>
        <div className="space-y-3 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            بياناتك محمية ومشفرة بالكامل
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            ملفاتك خاصة ولا يمكن لأي طالب آخر رؤيتها
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            محادثاتك مؤمّنة بسياسات الصفوف (Row Level Security)
          </div>
        </div>
      </div>
    </div>
  );
}

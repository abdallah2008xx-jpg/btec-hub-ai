"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Brain, Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !email || !password) { toast.error("يرجى ملء جميع الحقول"); return; }
    if (password !== confirmPassword) { toast.error("كلمتا المرور غير متطابقتين"); return; }
    if (password.length < 8) { toast.error("يجب أن تكون كلمة المرور 8 أحرف على الأقل"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
      if (error) throw error;
      if (data.user) {
        // Create student profile
        await supabase.from("student_profiles").insert({
          user_id: data.user.id,
          full_name: fullName,
          preferred_language: "ar",
        });
      }
      toast.success("تم إنشاء الحساب بنجاح! يرجى تفقد بريدك الإلكتروني للتحقق.");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message === "User already registered" ? "هذا البريد الإلكتروني مسجّل مسبقاً" : err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 mb-4 shadow-lg shadow-purple-900/40">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">BTEC HUB AI</h1>
          <p className="text-slate-400 mt-2">إنشاء حساب جديد</p>
        </div>
        <div className="glass rounded-3xl p-8">
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">الاسم الكامل</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  className="w-full bg-navy-900/50 border border-purple-900/40 rounded-xl px-4 py-3 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="محمد أحمد" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-navy-900/50 border border-purple-900/40 rounded-xl px-4 py-3 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="student@example.com" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-navy-900/50 border border-purple-900/40 rounded-xl px-4 py-3 pr-10 pl-10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="••••••••" required minLength={8} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">تأكيد كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-navy-900/50 border border-purple-900/40 rounded-xl px-4 py-3 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="••••••••" required />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" />جاري إنشاء الحساب...</> : "إنشاء الحساب"}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-400">
            لديك حساب بالفعل؟{" "}
            <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-semibold">تسجيل الدخول</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

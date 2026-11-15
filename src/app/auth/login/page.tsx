"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Brain, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { toast.error("يرجى ملء جميع الحقول"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("تم تسجيل الدخول بنجاح!");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message === "Invalid login credentials" ? "البريد الإلكتروني أو كلمة المرور غير صحيحة" : err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 mb-4 shadow-lg shadow-purple-900/40">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">BTEC HUB AI</h1>
          <p className="text-slate-400 mt-2">سجّل دخولك للمتابعة</p>
        </div>
        <div className="glass rounded-3xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-navy-900/50 border border-purple-900/40 rounded-xl px-4 py-3 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="student@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-navy-900/50 border border-purple-900/40 rounded-xl px-4 py-3 pr-10 pl-10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" />جاري تسجيل الدخول...</> : "تسجيل الدخول"}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-400">
            ليس لديك حساب؟{" "}
            <Link href="/auth/register" className="text-purple-400 hover:text-purple-300 font-semibold">إنشاء حساب</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

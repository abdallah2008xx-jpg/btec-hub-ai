"use client";
import { useState } from "react";
import { Bell, Moon, Sun, Globe } from "lucide-react";

interface Props { user: any; profile: any; }

export default function DashboardTopBar({ user, profile }: Props) {
  const [darkMode, setDarkMode] = useState(true);
  const [lang, setLang] = useState<"ar" | "en">("ar");

  function toggleDark() {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
    document.documentElement.classList.toggle("light-mode");
  }

  function toggleLang() {
    const newLang = lang === "ar" ? "en" : "ar";
    setLang(newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  }

  return (
    <header className="h-16 bg-navy-900/50 border-b border-purple-900/30 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-slate-400 text-sm">مرحباً،</span>
        <span className="text-white font-semibold text-sm">{profile?.full_name || user?.email?.split("@")[0]}</span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={toggleLang} className="w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white transition-colors" title="تغيير اللغة">
          <Globe className="w-4 h-4" />
        </button>
        <button onClick={toggleDark} className="w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white transition-colors" title="تغيير المظهر">
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button className="w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white transition-colors relative" title="الإشعارات">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full" />
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
          {(profile?.full_name || user?.email || "U")[0].toUpperCase()}
        </div>
      </div>
    </header>
  );
}

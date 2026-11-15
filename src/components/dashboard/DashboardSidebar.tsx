"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Brain, LayoutDashboard, MessageSquare, FileText, Upload, Target,
  FileEdit, Search, Star, Files, Settings, LogOut, ChevronRight, Menu, X
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "لوحة التحكم" },
  { href: "/dashboard/ai-chat", icon: MessageSquare, label: "BTEC AI" },
  { href: "/dashboard/assignments", icon: FileText, label: "تكليفاتي" },
  { href: "/dashboard/analyzer", icon: Upload, label: "محلل التكليف" },
  { href: "/dashboard/criteria", icon: Target, label: "دليل المعايير" },
  { href: "/dashboard/report-builder", icon: FileEdit, label: "بناء التقرير" },
  { href: "/dashboard/research", icon: Search, label: "مركز البحث" },
  { href: "/dashboard/review", icon: Star, label: "المراجعة الذكية" },
  { href: "/dashboard/files", icon: Files, label: "ملفاتي" },
  { href: "/dashboard/settings", icon: Settings, label: "الإعدادات" },
];

interface Props {
  user: any;
  profile: any;
}

export default function DashboardSidebar({ user, profile }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("تم تسجيل الخروج");
    router.push("/auth/login");
    router.refresh();
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn("flex items-center gap-3 p-5 border-b border-purple-900/30", collapsed && "justify-center")}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-900/40">
          <Brain className="w-5 h-5 text-white" />
        </div>
        {!collapsed && <span className="font-bold text-lg gradient-text">BTEC HUB AI</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  active ? "bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border border-purple-500/30" : "text-slate-400 hover:text-white hover:bg-white/5",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0", active ? "text-purple-400" : "text-slate-500 group-hover:text-slate-300")} />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                {!collapsed && active && <ChevronRight className="w-4 h-4 mr-auto text-purple-400" />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User + Sign Out */}
      <div className="p-4 border-t border-purple-900/30">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {(profile?.full_name || user?.email || "U")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-white truncate">{profile?.full_name || "الطالب"}</div>
              <div className="text-xs text-slate-500 truncate">{user?.email}</div>
            </div>
          </div>
        )}
        <button onClick={handleSignOut}
          className={cn("flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors w-full px-3 py-2 rounded-xl hover:bg-red-500/10", collapsed && "justify-center")}>
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="text-sm">تسجيل الخروج</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn("hidden lg:flex flex-col bg-navy-900 border-l border-purple-900/30 transition-all duration-300 flex-shrink-0", collapsed ? "w-16" : "w-64")}>
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute top-5 -left-3 z-10 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white hover:bg-purple-500 transition-colors shadow-lg"
          style={{ right: collapsed ? undefined : undefined }}>
          {collapsed ? <ChevronRight className="w-3 h-3 rotate-180" /> : <ChevronRight className="w-3 h-3" />}
        </button>
        <SidebarContent />
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <button onClick={() => setMobileOpen(true)} className="fixed top-4 right-4 z-50 w-10 h-10 glass rounded-xl flex items-center justify-center text-white">
          <Menu className="w-5 h-5" />
        </button>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <div className="relative w-72 bg-navy-900 border-l border-purple-900/30 flex flex-col">
              <button onClick={() => setMobileOpen(false)} className="absolute top-4 left-4 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

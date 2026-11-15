"use client";
import { useState } from "react";
import { Files, FileText, Trash2, Eye, Download, Search } from "lucide-react";
import { formatDate, formatFileSize } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface Props { files: any[]; }

export default function FilesPage({ files: initialFiles }: Props) {
  const supabase = createClient();
  const [files, setFiles] = useState(initialFiles);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = files.filter((f) =>
    f.file_name.toLowerCase().includes(search.toLowerCase())
  );

  async function deleteFile(fileId: string, storagePath: string) {
    if (!confirm("هل تريد حذف هذا الملف؟")) return;
    setDeleting(fileId);
    try {
      // Delete from storage
      await supabase.storage.from("student-files").remove([storagePath]);
      // Delete from DB
      await supabase.from("uploaded_files").delete().eq("id", fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      toast.success("تم حذف الملف");
    } catch {
      toast.error("فشل في حذف الملف");
    } finally {
      setDeleting(null);
    }
  }

  async function downloadFile(storagePath: string, fileName: string) {
    try {
      const { data } = await supabase.storage
        .from("student-files")
        .createSignedUrl(storagePath, 60);
      if (data?.signedUrl) {
        const a = document.createElement("a");
        a.href = data.signedUrl;
        a.download = fileName;
        a.click();
      }
    } catch {
      toast.error("فشل في تحميل الملف");
    }
  }

  const fileTypeIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("document")) return "📝";
    return "📁";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold gradient-text mb-1">ملفاتي</h1>
        <p className="text-slate-400">جميع الملفات المرفوعة الخاصة بك</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن ملف..."
          className="w-full bg-navy-800/50 border border-purple-900/40 rounded-xl px-4 py-3 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Files className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2 text-slate-400">
            {search ? "لا توجد نتائج" : "لا توجد ملفات بعد"}
          </h3>
          <p className="text-slate-500">
            {search ? "جرب بحثاً مختلفاً" : "ارفع تكليفاً أو تقريراً لتظهر هنا"}
          </p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-0 text-xs text-slate-500 uppercase tracking-wide px-5 py-3 border-b border-purple-900/30">
            <span>الملف</span>
            <span className="text-center px-4">الحجم</span>
            <span className="text-center px-4">التكليف</span>
            <span className="text-center px-4">التاريخ</span>
            <span className="text-center px-4">إجراءات</span>
          </div>
          <div className="divide-y divide-purple-900/20">
            {filtered.map((file) => (
              <div
                key={file.id}
                className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-0 items-center px-5 py-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl flex-shrink-0">{fileTypeIcon(file.file_type)}</span>
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{file.file_name}</div>
                    <div className="text-xs text-slate-500 capitalize">
                      {file.file_type.includes("pdf") ? "PDF" : "Word"}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-slate-400 text-center px-4">
                  {formatFileSize(file.file_size)}
                </div>
                <div className="text-sm text-slate-400 text-center px-4 max-w-[120px] truncate">
                  {file.assignments?.title || "—"}
                </div>
                <div className="text-xs text-slate-500 text-center px-4 whitespace-nowrap">
                  {formatDate(file.created_at)}
                </div>
                <div className="flex items-center gap-1 justify-center px-4">
                  <button
                    onClick={() => downloadFile(file.storage_path, file.file_name)}
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-900/20 flex items-center justify-center transition-colors"
                    title="تحميل"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteFile(file.id, file.storage_path)}
                    disabled={deleting === file.id}
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-900/20 flex items-center justify-center transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-600 text-center">
        الملفات محمية وخاصة بحسابك فقط
      </p>
    </div>
  );
}

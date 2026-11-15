import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, locale = "ar-JO"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(typeof date === "string" ? new Date(date) : date);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function isRTL(text: string): boolean {
  const rtlChars = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  return rtlChars.test(text);
}

export const AI_MODES = [
  { id: "explain_assignment", label_ar: "شرح التكليف", label_en: "Explain Assignment", icon: "BookOpen", color: "purple" },
  { id: "solve_with_me", label_ar: "حل معاً", label_en: "Solve With Me", icon: "Lightbulb", color: "blue" },
  { id: "explain_criteria", label_ar: "شرح المعايير", label_en: "Explain Criteria", icon: "Target", color: "green" },
  { id: "improve_writing", label_ar: "تحسين الكتابة", label_en: "Improve Writing", icon: "Pen", color: "yellow" },
  { id: "review_report", label_ar: "مراجعة التقرير", label_en: "Review Report", icon: "FileCheck", color: "red" },
  { id: "research_assistant", label_ar: "مساعد البحث", label_en: "Research Assistant", icon: "Search", color: "indigo" },
  { id: "study_mode", label_ar: "وضع الدراسة", label_en: "Study Mode", icon: "GraduationCap", color: "pink" },
] as const;

export const CRITERIA_LEVELS = {
  pass: { label_ar: "ناجح", label_en: "Pass", color: "green" },
  merit: { label_ar: "جيد", label_en: "Merit", color: "blue" },
  distinction: { label_ar: "ممتاز", label_en: "Distinction", color: "purple" },
} as const;

"use client";
import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus, Send, Loader2, Copy, Trash2, Edit2, Check, X,
  MessageSquare, BookOpen, Lightbulb, Target, Pen, FileCheck, Search, GraduationCap,
  Upload, ChevronDown, Bot, User, Paperclip
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";
import { cn, truncate, AI_MODES } from "@/lib/utils";
import type { Conversation, ChatMessage, AIMode } from "@/types";

const MODE_ICONS: Record<string, React.ComponentType<any>> = {
  general: MessageSquare,
  explain_assignment: BookOpen,
  solve_with_me: Lightbulb,
  explain_criteria: Target,
  improve_writing: Pen,
  review_report: FileCheck,
  research_assistant: Search,
  study_mode: GraduationCap,
};

interface Props {
  userId: string;
  initialConversations: Conversation[];
  assignments: { id: string; title: string }[];
}

export default function AIChatInterface({ userId, initialConversations, assignments }: Props) {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConvId, setActiveConvId] = useState<string | null>(searchParams.get("conv"));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentMode, setCurrentMode] = useState<AIMode>("general");
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [assignmentContext, setAssignmentContext] = useState<string | null>(null);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [showAssignmentMenu, setShowAssignmentMenu] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (activeConvId) loadMessages(activeConvId);
  }, [activeConvId]);

  async function loadMessages(convId: string) {
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`);
      const data = await res.json();
      if (data.messages) {
        setMessages(
          data.messages.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.created_at),
          }))
        );
      }
    } catch {
      toast.error("فشل في تحميل الرسائل");
    }
  }

  async function createNewConversation(mode: AIMode = "general") {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "محادثة جديدة", mode }),
      });
      const data = await res.json();
      if (data.conversation) {
        setConversations((prev) => [data.conversation, ...prev]);
        setActiveConvId(data.conversation.id);
        setMessages([]);
        setCurrentMode(mode);
      }
    } catch {
      toast.error("فشل في إنشاء محادثة");
    }
  }

  async function sendMessage() {
    if (!input.trim() || isLoading) return;
    if (!activeConvId) {
      await createNewConversation(currentMode);
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    const sentInput = input.trim();
    setInput("");
    setIsLoading(true);
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();

    try {
      const allMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: sentInput },
      ];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages,
          conversationId: activeConvId,
          mode: currentMode,
          assignmentContext,
          model: "gpt-4o-mini",
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Request failed");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      let accumulated = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                accumulated += parsed.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessage.id
                      ? { ...m, content: accumulated }
                      : m
                  )
                );
              }
            } catch {}
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id ? { ...m, isStreaming: false } : m
        )
      );

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? { ...c, updated_at: new Date().toISOString(), last_message: accumulated.slice(0, 100) }
            : c
        )
      );
    } catch (err: any) {
      if (err.name === "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, content: m.content + "\n\n*[توقفت الاستجابة]*", isStreaming: false }
              : m
          )
        );
      } else {
        toast.error(err.message || "فشل في إرسال الرسالة");
        setMessages((prev) => prev.filter((m) => m.id !== assistantMessage.id));
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }

  async function deleteConversation(convId: string) {
    if (!confirm("هل تريد حذف هذه المحادثة؟")) return;
    await fetch(`/api/conversations?id=${convId}`, { method: "DELETE" });
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    if (activeConvId === convId) {
      setActiveConvId(null);
      setMessages([]);
    }
    toast.success("تم حذف المحادثة");
  }

  async function renameConversation(convId: string, title: string) {
    if (!title.trim()) return;
    await fetch("/api/conversations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: convId, title }),
    });
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, title } : c))
    );
    setEditingConvId(null);
  }

  async function copyMessage(content: string, id: string) {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("تم النسخ");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function stopStreaming() {
    abortControllerRef.current?.abort();
  }

  async function loadAssignmentContext(assignmentId: string) {
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/context`);
      const data = await res.json();
      if (data.context) {
        setAssignmentContext(data.context);
        setSelectedAssignment(assignmentId);
        toast.success("تم تحميل سياق التكليف");
      }
    } catch {
      toast.error("فشل في تحميل التكليف");
    }
  }

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const ActiveModeIcon = MODE_ICONS[currentMode] || MessageSquare;

  const quickActions = [
    { mode: "explain_assignment" as AIMode, label: "اشرح التكليف", icon: BookOpen },
    { mode: "solve_with_me" as AIMode, label: "ساعدني في الحل", icon: Lightbulb },
    { mode: "explain_criteria" as AIMode, label: "اشرح المعيار", icon: Target },
    { mode: "review_report" as AIMode, label: "راجع تقريري", icon: FileCheck },
    { mode: "research_assistant" as AIMode, label: "ابحث لي", icon: Search },
  ];

  return (
    <div className="flex h-full gap-0 -m-6 overflow-hidden" dir="rtl">
      {/* Conversations Sidebar */}
      <div
        className={cn(
          "flex flex-col bg-navy-900/80 border-l border-purple-900/30 transition-all duration-300 flex-shrink-0",
          sidebarOpen ? "w-72" : "w-0 overflow-hidden"
        )}
      >
        <div className="p-4 border-b border-purple-900/30 flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-300">المحادثات</h2>
          <button
            onClick={() => createNewConversation()}
            className="w-8 h-8 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 flex items-center justify-center text-purple-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-700" />
              لا توجد محادثات
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "group flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all duration-200",
                  activeConvId === conv.id
                    ? "bg-purple-600/20 border border-purple-500/30"
                    : "hover:bg-white/5"
                )}
                onClick={() => {
                  setActiveConvId(conv.id);
                  setCurrentMode(conv.mode as AIMode);
                }}
              >
                {editingConvId === conv.id ? (
                  <div
                    className="flex-1 flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 bg-navy-800 text-white text-xs px-2 py-1 rounded-lg border border-purple-500/50 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") renameConversation(conv.id, editTitle);
                        if (e.key === "Escape") setEditingConvId(null);
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => renameConversation(conv.id, editTitle)}
                      className="text-green-400 hover:text-green-300"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setEditingConvId(null)}
                      className="text-slate-400 hover:text-slate-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-7 h-7 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                      {(() => {
                        const Icon = MODE_ICONS[conv.mode] || MessageSquare;
                        return <Icon className="w-3.5 h-3.5 text-purple-400" />;
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white truncate">{conv.title}</div>
                      <div className="text-xs text-slate-500 truncate">
                        {conv.last_message ? truncate(conv.last_message, 30) : "محادثة جديدة"}
                      </div>
                    </div>
                    <div className="hidden group-hover:flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingConvId(conv.id);
                          setEditTitle(conv.title);
                        }}
                        className="w-5 h-5 text-slate-400 hover:text-white"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        className="w-5 h-5 text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="h-14 bg-navy-900/50 border-b border-purple-900/30 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-8 h-8 glass rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            {activeConv && (
              <span className="text-sm font-medium text-white">{activeConv.title}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Assignment selector */}
            {assignments.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowAssignmentMenu(!showAssignmentMenu)}
                  className="flex items-center gap-2 glass rounded-xl px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  {selectedAssignment
                    ? truncate(assignments.find((a) => a.id === selectedAssignment)?.title || "", 20)
                    : "اختر تكليف"}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showAssignmentMenu && (
                  <div className="absolute top-full mt-2 left-0 w-56 glass rounded-xl border border-purple-900/30 shadow-xl z-50 py-1">
                    <button
                      onClick={() => {
                        setSelectedAssignment(null);
                        setAssignmentContext(null);
                        setShowAssignmentMenu(false);
                      }}
                      className="w-full text-right px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      بدون تكليف
                    </button>
                    {assignments.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          loadAssignmentContext(a.id);
                          setShowAssignmentMenu(false);
                        }}
                        className="w-full text-right px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors truncate"
                      >
                        {a.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Mode selector */}
            <div className="relative">
              <button
                onClick={() => setShowModeMenu(!showModeMenu)}
                className="flex items-center gap-2 glass rounded-xl px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
              >
                <ActiveModeIcon className="w-3.5 h-3.5 text-purple-400" />
                {AI_MODES.find((m) => m.id === currentMode)?.label_ar || "عام"}
                <ChevronDown className="w-3 h-3" />
              </button>
              {showModeMenu && (
                <div className="absolute top-full mt-2 left-0 w-56 glass rounded-xl border border-purple-900/30 shadow-xl z-50 py-1">
                  <button
                    onClick={() => { setCurrentMode("general"); setShowModeMenu(false); }}
                    className="w-full text-right px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> عام
                  </button>
                  {AI_MODES.map((m) => {
                    const Icon = MODE_ICONS[m.id] || MessageSquare;
                    return (
                      <button
                        key={m.id}
                        onClick={() => { setCurrentMode(m.id as AIMode); setShowModeMenu(false); }}
                        className={cn(
                          "w-full text-right px-3 py-2 text-xs hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors",
                          currentMode === m.id ? "text-purple-300" : "text-slate-300"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5 text-purple-400" /> {m.label_ar}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!activeConvId ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-900/40">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-3 gradient-text">BTEC AI</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                مرحباً! أنا مساعدك الأكاديمي المتخصص في BTEC. كيف يمكنني مساعدتك اليوم؟
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                {quickActions.map((a) => (
                  <button
                    key={a.mode}
                    onClick={() => createNewConversation(a.mode)}
                    className="glass rounded-xl p-4 hover:border-purple-500/50 transition-all duration-200 hover:scale-105 group text-right"
                  >
                    <a.icon className="w-6 h-6 text-purple-400 mb-2 group-hover:text-purple-300" />
                    <div className="text-sm font-medium">{a.label}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Bot className="w-10 h-10 text-slate-600 mb-3" />
              <p className="text-slate-500">ابدأ المحادثة بكتابة رسالتك...</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 animate-fade-in",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                    msg.role === "user"
                      ? "bg-gradient-to-br from-purple-600 to-blue-600"
                      : "bg-gradient-to-br from-slate-700 to-slate-600"
                  )}
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-purple-300" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 relative group",
                    msg.role === "user"
                      ? "bg-gradient-to-br from-purple-600/30 to-blue-600/20 border border-purple-500/30"
                      : "bg-navy-800/80 border border-purple-900/20"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                      {msg.isStreaming && (
                        <span className="inline-block w-2 h-4 bg-purple-400 animate-pulse ml-1 align-middle" />
                      )}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-slate-500">
                      {msg.timestamp.toLocaleTimeString("ar-JO", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {msg.role === "assistant" && !msg.isStreaming && (
                      <button
                        onClick={() => copyMessage(msg.content, msg.id)}
                        className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-purple-900/30 bg-navy-900/50">
          {activeConvId && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
              {quickActions.map((a) => (
                <button
                  key={a.mode}
                  onClick={() => setCurrentMode(a.mode)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all duration-200 flex-shrink-0",
                    currentMode === a.mode
                      ? "bg-purple-600/40 text-purple-200 border border-purple-500/50"
                      : "glass text-slate-400 hover:text-white"
                  )}
                >
                  <a.icon className="w-3.5 h-3.5" />
                  {a.label}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب رسالتك... (Enter للإرسال، Shift+Enter لسطر جديد)"
                rows={1}
                className="w-full bg-navy-800/80 border border-purple-900/40 rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none max-h-32 leading-relaxed text-sm"
                style={{ minHeight: "52px" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 128) + "px";
                }}
              />
            </div>
            {isStreaming ? (
              <button
                onClick={stopStreaming}
                className="w-12 h-12 rounded-2xl bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 flex items-center justify-center text-red-400 transition-all duration-200 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 flex items-center justify-center text-white transition-all duration-200 flex-shrink-0 shadow-lg shadow-purple-900/30"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-2 text-center">
            BTEC AI قد يرتكب أخطاء. تحقق دائماً من المعلومات المهمة.
          </p>
        </div>
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { openai, getModeSystemPrompt } from "@/lib/openai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      messages,
      conversationId,
      mode = "general",
      assignmentContext,
      model = "gpt-4o-mini",
    } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    // Check daily usage limit
    const { data: profile } = await supabase
      .from("student_profiles")
      .select("ai_usage_today, daily_limit, ai_usage_total")
      .eq("user_id", session.user.id)
      .single();

    if (profile && (profile.ai_usage_today || 0) >= (profile.daily_limit || 50)) {
      return NextResponse.json(
        { error: "لقد وصلت إلى حد الاستخدام اليومي. يتجدد الحد يومياً." },
        { status: 429 }
      );
    }

    const systemPrompt = getModeSystemPrompt(mode);
    const fullSystemPrompt = assignmentContext
      ? `${systemPrompt}\n\n## سياق التكليف المرفوع:\n${assignmentContext}\n\nاستخدم هذا السياق عند الإجابة على الأسئلة المتعلقة بالتكليف.`
      : systemPrompt;

    const openaiMessages = [
      { role: "system" as const, content: fullSystemPrompt },
      ...messages.map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const stream = await openai.chat.completions.create({
      model,
      messages: openaiMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2000,
    });

    const encoder = new TextEncoder();
    let fullContent = "";
    let inputTokens = 0;
    let outputTokens = 0;

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content || "";
            if (delta) {
              fullContent += delta;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`)
              );
            }
            if (chunk.usage) {
              inputTokens = chunk.usage.prompt_tokens || 0;
              outputTokens = chunk.usage.completion_tokens || 0;
            }
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();

          // Post-stream: save messages to DB
          if (conversationId) {
            const userMessage = messages[messages.length - 1];
            if (userMessage?.role === "user") {
              await supabase.from("messages").insert([
                {
                  conversation_id: conversationId,
                  student_id: session.user.id,
                  role: "user",
                  content: userMessage.content,
                },
                {
                  conversation_id: conversationId,
                  student_id: session.user.id,
                  role: "assistant",
                  content: fullContent,
                  tokens_used: outputTokens,
                },
              ]);

              await supabase
                .from("conversations")
                .update({
                  updated_at: new Date().toISOString(),
                  last_message: fullContent.slice(0, 200),
                })
                .eq("id", conversationId);
            }
          }

          // Log AI usage
          await supabase.from("ai_usage").insert({
            student_id: session.user.id,
            conversation_id: conversationId || null,
            mode,
            tokens_input: inputTokens,
            tokens_output: outputTokens,
            model,
          });

          // Increment daily + total usage
          await supabase
            .from("student_profiles")
            .update({
              ai_usage_today: (profile?.ai_usage_today || 0) + 1,
              ai_usage_total: (profile?.ai_usage_total || 0) + 1,
            })
            .eq("user_id", session.user.id);
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

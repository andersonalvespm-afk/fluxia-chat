import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Nome da tabela no Supabase (crie conforme o SQL no README)
const TABLE = "messages";

const SYSTEM_PROMPT =
  "Você é o assistente da Fluxia Chat, uma empresa que cria plataformas de " +
  "chat personalizadas para outras empresas. Responda de forma cordial, " +
  "objetiva e em português do Brasil.";

// ─────────────────────────────────────────────────────────────
// Resposta local (fallback) — usada quando não há chave de IA.
// ─────────────────────────────────────────────────────────────
function generateLocalReply(message) {
  const text = message.toLowerCase();

  if (/(oi|ol[aá]|bom dia|boa tarde|boa noite|hey|hi)/.test(text))
    return "Olá! Como posso ajudar você hoje? 😊";
  if (/(pre[cç]o|valor|quanto custa|or[cç]amento)/.test(text))
    return "A Fluxia cria plataformas de chat personalizadas para cada empresa. Me conte um pouco sobre o seu projeto e eu te ajudo a dimensionar!";
  if (/(obrigad|valeu|thanks|agradeç)/.test(text))
    return "Por nada! Estou aqui sempre que precisar. 🙌";
  if (/(tchau|at[eé] logo|bye|adeus)/.test(text))
    return "Até logo! Volte quando quiser. 👋";
  if (/(quem (é|e) você|seu nome|o que voc[eê] faz)/.test(text))
    return "Sou o assistente da Fluxia Chat, criado para ajudar sua empresa com atendimento e comunicação em tempo real.";

  return "Entendi! Anotei sua mensagem. Em breve um especialista da Fluxia vai continuar essa conversa. 😉";
}

// ─────────────────────────────────────────────────────────────
// IA real via OpenAI (Chat Completions)
// ─────────────────────────────────────────────────────────────
async function generateAIReply(history) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.7,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`OpenAI ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  return (
    data.choices?.[0]?.message?.content?.trim() ||
    generateLocalReply(history.at(-1)?.content ?? "")
  );
}

export async function POST(request) {
  try {
    const { message, history = [] } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Campo 'message' é obrigatório." },
        { status: 400 }
      );
    }

    // Normaliza o histórico para o formato aceito pela OpenAI
    const cleanHistory = history
      .filter((m) => m && m.role && m.content)
      .map((m) => ({
        role: m.role === "bot" ? "assistant" : m.role,
        content: String(m.content),
      }));

    // Garante que o histórico termina com a mensagem atual
    if (cleanHistory.at(-1)?.content !== message) {
      cleanHistory.push({ role: "user", content: message });
    }

    let reply;
    let source = "local";

    if (process.env.OPENAI_API_KEY) {
      try {
        reply = await generateAIReply(cleanHistory);
        source = "openai";
      } catch (aiErr) {
        console.error("Falha na IA, usando fallback local:", aiErr.message);
        reply = generateLocalReply(message);
      }
    } else {
      reply = generateLocalReply(message);
    }

    // 💾 Persiste a conversa no Supabase (service_role no servidor).
    try {
      await supabaseAdmin.from(TABLE).insert([
        { role: "user", content: message },
        { role: "assistant", content: reply },
      ]);
    } catch (dbErr) {
      console.warn("Não foi possível salvar no Supabase:", dbErr?.message);
    }

    return NextResponse.json({ reply, source });
  } catch (err) {
    console.error("Erro em /api/chat:", err);
    return NextResponse.json(
      { error: "Erro interno ao processar a mensagem." },
      { status: 500 }
    );
  }
}

"use client";

import { useEffect, useRef, useState } from "react";

const WELCOME = {
  id: "welcome",
  role: "bot",
  content: "Olá! 👋 Sou o assistente da Fluxia Chat. Como posso ajudar?",
  createdAt: new Date().toISOString(),
};

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Chat() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll sempre que chegar mensagem nova
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: nextMessages
            .filter((m) => m.id !== "welcome")
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("Falha na resposta do servidor");

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "bot",
          content: data.reply ?? "Desculpe, não consegui responder agora.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "bot",
          content: "⚠️ Ocorreu um erro ao conectar. Tente novamente.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <section className="chat">
      <header className="chat__header">
        <div className="chat__avatar">F</div>
        <div>
          <div className="chat__title">Fluxia Chat</div>
          <div className="chat__status">
            <span className="dot" /> Online
          </div>
        </div>
      </header>

      <div className="chat__body" ref={bodyRef}>
        {messages.map((m) => (
          <div
            key={m.id}
            className={`msg ${m.role === "user" ? "msg--user" : "msg--bot"}`}
          >
            <div className="bubble">
              {m.content}
              <span className="msg__time">{formatTime(m.createdAt)}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="msg msg--bot">
            <div className="bubble">
              <span className="typing">
                <span />
                <span />
                <span />
              </span>
            </div>
          </div>
        )}
      </div>

      <footer className="chat__footer">
        <textarea
          ref={textareaRef}
          className="chat__input"
          rows={1}
          placeholder="Digite uma mensagem... (Enter envia, Shift+Enter quebra linha)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className="chat__send"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          Enviar
        </button>
      </footer>
    </section>
  );
}

"use client";

import { useState, useRef, useEffect, Fragment } from "react";

import { AirplayIcon, SendIcon } from "lucide-react";
import { Menu, Transition } from "@headlessui/react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import MarkdownRenderer from "./markdown-renderer";

type ChatMessage = {
  message: string;
  direction: "incoming" | "outgoing";
  sender: string;
};

export default function ChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      message: `¡Hola! Soy Dara, tu asistente en ffontana.dev 💜
Estoy acá para ayudarte con todo lo que necesites sobre nuestras soluciones digitales: desde landing pages que convierten, hasta asistentes con inteligencia artificial que impulsan tus ventas.

¿Tenés alguna duda o idea en mente? Estoy para ayudarte 🫡`,
      direction: "incoming",
      sender: "Dara | Atencion al Cliente",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  marked.setOptions({ async: false });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      message: text,
      direction: "outgoing",
      sender: "Usuario",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const apiMessages = [
        {
          role: "system",
          content: `Eres Dara, la asistente virtual de atención al cliente de ffontana.dev, el estudio digital independiente de Felipe Fontana, diseñador y desarrollador uruguayo. Felipe trabaja de forma directa con cada cliente, creando soluciones digitales a medida que ayudan a vender más y mejor.

Tu rol es brindar una primera respuesta rápida, clara y cercana a través de WhatsApp o email. Respondés como si fueras parte real del equipo, con un tono directo, empático y humano. No uses un lenguaje robótico ni excesivamente formal. Sé breve y amable, con naturalidad, como alguien que trabaja junto a Felipe.

🔹 Si una consulta no la podés resolver, ofrecé escalarla directamente a Felipe.
🔹 Nunca digas que sos una inteligencia artificial, a menos que te lo pregunten.
🔹 Siempre que puedas, resaltá que Felipe trabaja personalmente en cada proyecto.

Servicios de ffontana.dev que podés ofrecer:

Landing pages personalizadas enfocadas en conversión

Asistentes virtuales con inteligencia artificial entrenados para vender

Soluciones digitales a medida según las necesidades del cliente

💰 Las landing pages tienen promociones desde 5.000 pesos, más el costo de mantenimiento (hosting, dominio y actualizaciones).

Firma opcional para usar en mensajes escritos:
ffontana.dev — Soluciones digitales personalizadas para tu negocio. Landing pages que convierten. Bots con IA que venden.

`,
        },
        ...messages.map((m) => ({
          role: m.direction === "outgoing" ? "user" : "assistant",
          content: m.message,
        })),
        { role: "user", content: text },
      ];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();

      if (res.ok && data.reply?.content) {
        setMessages((prev) => [
          ...prev,
          {
            message: data.reply.content,
            direction: "incoming",
            sender: "Asistente",
          },
        ]);
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="flex flex-col w-full h-full max-h-full overflow-hidden">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 sm:px-6 sm:py-4">
        {messages.map((msg, i) => (
          <ChatMessageBubble
            key={i}
            message={msg.message}
            sender={msg.sender}
            direction={msg.direction}
            timestamp="11:46"
            avatarUrl={
              msg.direction === "incoming"
                ? "/dara-avatar.png"
                : "/user-avatar.png"
            }
          />
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start pl-2">
            <div className="flex items-center gap-1 px-3 py-2 bg-white rounded-2xl text-sm shadow">
              <span
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0s" }}
              />
              <span
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
              <span
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className=" flex items-center gap-2 mb-5  sm:p-4 sm:mb-6 px-3 py-2 bg-gray-800/20 rounded-full shadow-lg">
        <input
          type="text"
          className="flex-1 rounded-full px-2 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#B13BFF]/40 bg-transparent text-[16px]"
          placeholder="Escribe tu mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSend}
          className=" hover:bg-[#B13BFF]/40 text-white p-3 rounded-full transition-transform cursor-none active:scale-95"
        >
          <SendIcon className="h-7 w-7 flex items-center justify-center -rotate-45" />
        </button>
      </div>
    </div>
  );
}

type ChatBubbleProps = {
  message: string;
  sender: string;
  direction: "incoming" | "outgoing";
  timestamp?: string;
  status?: "Enviado" | "Visto";
  avatarUrl?: string;
};

export function ChatMessageBubble({
  message,
  sender,
  direction,
  timestamp = "Ahora",
  status = "Enviado",
  avatarUrl,
}: ChatBubbleProps) {
  const isIncoming = direction === "incoming";

  return (
    <div
      className={`flex items-start gap-2.5 ${
        isIncoming ? "" : "flex-row-reverse"
      }`}
    >
      <div
        className={`flex flex-col w-full max-w-[320px] leading-1.5 p-4 ${
          isIncoming
            ? "bg-transparent text-white/80"
            : "bg-[#471396] text-white"
        } rounded-e-xl rounded-es-xl`}
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm text-white font-semibold">{sender}</span>
        </div>

        <div className="py-2.5 font-sans">
          {isIncoming ? (
            <MarkdownRenderer content={message} />
          ) : (
            <p className="text-sm font-normal">{message}</p>
          )}
        </div>

        <span className="text-sm font-normal text-gray-500">{status}</span>
      </div>
    </div>
  );
}

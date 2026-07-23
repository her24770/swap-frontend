"use client";

import { useState } from "react";
import { Smile, Paperclip, Send } from "lucide-react";
import "./ChatInput.css";

interface ChatInputProps {
  onEnviar: (texto: string) => void;
}

export default function ChatInput({ onEnviar }: ChatInputProps) {
  const [texto, setTexto] = useState("");

  const handleEnviar = () => {
    if (!texto.trim()) return;
    onEnviar(texto.trim());
    setTexto("");
  };

  return (
    <div className="chat-input">
      <button type="button" className="chat-input__icon-btn" aria-label="Emoji">
        <Smile size={18} />
      </button>
      <input
        type="text"
        className="chat-input__field"
        placeholder="Escribe un mensaje"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleEnviar()}
      />
      <button type="button" className="chat-input__icon-btn" aria-label="Adjuntar">
        <Paperclip size={18} />
      </button>
      <button
        type="button"
        className="chat-input__icon-btn chat-input__icon-btn--send"
        aria-label="Enviar"
        onClick={handleEnviar}
        disabled={!texto.trim()}
      >
        <Send size={16} />
      </button>
    </div>
  );
}
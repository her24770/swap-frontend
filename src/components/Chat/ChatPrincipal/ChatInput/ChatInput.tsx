"use client";

import { useRef, useState } from "react";
import { Smile, Paperclip, Send } from "lucide-react";
import "./ChatInput.css";

interface ChatInputProps {
  onEnviar: (texto: string) => void;
  onEnviarImagen?: (archivo: File) => void;
}

const EMOJIS = ["😀", "😂", "😍", "🥳", "🤔", "😭", "👍", "👌", "❤️", "👏"];

export default function ChatInput({ onEnviar, onEnviarImagen }: ChatInputProps) {
  const [texto, setTexto] = useState("");
  const [mostrarEmojis, setMostrarEmojis] = useState(false);

  const handleEnviar = () => {
    if (!texto.trim()) return;
    onEnviar(texto.trim());
    setTexto("");
    setMostrarEmojis(false);
  };

  return (
    <div className="chat-input">
      <div className="chat-input__emoji-picker">
        <button
          type="button"
          className="chat-input__icon-btn"
          aria-label="Emoji"
          aria-expanded={mostrarEmojis}
          onClick={() => setMostrarEmojis((prev) => !prev)}
        >
          <Smile size={18} />
        </button>
        {mostrarEmojis && (
          <div className="chat-input__emoji-menu">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="chat-input__emoji-item"
                onClick={() => {
                  setTexto((prev) => `${prev}${emoji}`);
                  setMostrarEmojis(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
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
import { Moon, Sun } from "lucide-react";
import "./ThemeToggle.css";

interface ThemeToggleProps {
  theme: "light" | "dark";
  onToggle: () => void;
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={`theme-toggle${isDark ? " theme-toggle--dark" : ""}`}
      onClick={onToggle}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__thumb">
          {isDark
            ? <Moon size={12} strokeWidth={2} />
            : <Sun size={12} strokeWidth={2} />
          }
        </span>
        <span className="theme-toggle__icon theme-toggle__icon--sun">
          <Sun size={11} strokeWidth={2} />
        </span>
        <span className="theme-toggle__icon theme-toggle__icon--moon">
          <Moon size={11} strokeWidth={2} />
        </span>
      </span>
    </button>
  );
}
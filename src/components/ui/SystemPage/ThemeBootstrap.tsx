"use client";

import { useEffect } from "react";

export default function ThemeBootstrap() {
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("theme");
      const theme = saved === "dark" || saved === "light"
        ? saved
        : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", theme);
    } catch {
      // El esquema claro de :root sigue disponible cuando localStorage no existe.
    }
  }, []);
  return null;
}

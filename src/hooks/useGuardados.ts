"use client";

import { useContext } from "react";
import { GuardadosContext } from "../context/GuardadosContext";

export function useGuardados() {
  const context = useContext(GuardadosContext);

  if (!context) {
    throw new Error("useGuardados debe usarse dentro de GuardadosProvider");
  }

  return context;
}

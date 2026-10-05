import type { NivelModerador } from "../types/moderador";

// Espeja del lado del cliente la jerarquía de autenticacion/permisosModerador.ts
// del backend (soloModerador vs soloSuperadmin), para evaluar permisos antes
// de llamar al endpoint en vez de depender de un 403 generico.
export function tienePermiso(
  nivelActual: NivelModerador | null,
  nivelRequerido: NivelModerador
): boolean {
  if (nivelActual === null) return false;
  if (nivelRequerido === "moderador") return true;
  return nivelActual === "superadmin";
}

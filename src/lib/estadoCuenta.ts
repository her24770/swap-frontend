/**
 * Interpreta el campo `tiempo_suspendido` de Usuario/Moderador (misma
 * convencion que servicioEstadoCuenta.ts en el backend):
 *   0  -> cuenta activa
 *  -1  -> cuenta bloqueada indefinidamente
 *  >0  -> timestamp Unix (segundos) hasta el cual esta suspendida
 *
 * Si el timestamp ya paso, se trata como activa en la UI (el backend la
 * resetea sola en el proximo login de ese usuario).
 */

export interface EstadoCuentaInterpretado {
  bloqueada: boolean;
  suspendidaHasta: Date | null;
  activa: boolean;
}

export function interpretarEstadoCuenta(tiempoSuspendido: number): EstadoCuentaInterpretado {
  if (tiempoSuspendido === -1) {
    return { bloqueada: true, suspendidaHasta: null, activa: false };
  }

  if (tiempoSuspendido === 0) {
    return { bloqueada: false, suspendidaHasta: null, activa: true };
  }

  const ahora = Math.floor(Date.now() / 1000);
  if (tiempoSuspendido > ahora) {
    return { bloqueada: false, suspendidaHasta: new Date(tiempoSuspendido * 1000), activa: false };
  }

  // La suspension ya paso su fecha: se trata como activa en la UI.
  return { bloqueada: false, suspendidaHasta: null, activa: true };
}

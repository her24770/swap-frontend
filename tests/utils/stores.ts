import { useAuthStore } from "../../src/store/authStore";
import { useUIStore } from "../../src/store/uiStore";

export function resetStores() {
  useUIStore.setState({
    cargando: false,
    notificaciones: [],
    confirm: { isOpen: false, titulo: "", mensaje: "", onConfirm: () => {} },
  });

  useAuthStore.setState({
    usuario: null,
    rol: null,
  });

  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("theme");
}

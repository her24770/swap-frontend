"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import SearchBar from "../../ui/SearchBar/SearchBar";
import { palabraService } from "../../../services/palabraService";
import { useToast } from "../../../hooks/useToast";
import { useUIStore } from "../../../store/uiStore";
import type { PalabraRestringida } from "../../../types/palabra";
import "../../../components/ui/Button/Button.css";
import "../../../components/ui/Modal/Modal.css";
import "./PalabrasModeracion.css";

interface PalabraFormModalProps {
  isOpen: boolean;
  inicial?: PalabraRestringida | null;
  enviando: boolean;
  onClose: () => void;
  onSubmit: (palabra: string) => Promise<void> | void;
}

function PalabraFormModal({ isOpen, inicial, enviando, onClose, onSubmit }: PalabraFormModalProps) {
  const t = useTranslations("moderacion.palabras");
  const [valor, setValor] = useState("");

  useEffect(() => {
    if (isOpen) setValor(inicial?.palabra ?? "");
  }, [isOpen, inicial]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const limpio = valor.trim();
    if (!limpio || enviando) return;
    await onSubmit(limpio);
  };

  return (
    <div className="modal-overlay palabras-moderacion__overlay" onClick={onClose}>
      <form
        className="palabras-moderacion__modal"
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="palabras-moderacion__modal-header">
          <h2>{inicial ? t("modal.tituloEditar") : t("modal.tituloCrear")}</h2>
          <button type="button" className="palabras-moderacion__close" onClick={onClose} aria-label={t("modal.cerrar")}>
            <X size={18} />
          </button>
        </div>

        <label className="palabras-moderacion__label" htmlFor="palabra-input">
          {t("modal.label")}
        </label>
        <input
          id="palabra-input"
          className="palabras-moderacion__input"
          value={valor}
          onChange={(event) => setValor(event.target.value)}
          maxLength={100}
          autoFocus
          placeholder={t("modal.placeholder")}
        />

        <div className="palabras-moderacion__modal-actions">
          <button type="button" className="button button--medium" onClick={onClose} disabled={enviando}>
            {t("modal.cancelar")}
          </button>
          <button type="submit" className="button button--medium" disabled={enviando || !valor.trim()}>
            {enviando ? <Loader2 size={16} className="palabras-moderacion__spinner" /> : t("modal.guardar")}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function PalabrasModeracion() {
  const t = useTranslations("moderacion.palabras");
  const toast = useToast();
  const mostrarConfirm = useUIStore((state) => state.mostrarConfirm);

  const [palabras, setPalabras] = useState<PalabraRestringida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [palabraEditando, setPalabraEditando] = useState<PalabraRestringida | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const cargarPalabras = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await palabraService.listar();
      setPalabras(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorCarga"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarPalabras();
  }, []);

  const palabrasFiltradas = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return palabras;
    return palabras.filter((p) => p.palabra.toLowerCase().includes(query));
  }, [palabras, q]);

  const abrirCrear = () => {
    setPalabraEditando(null);
    setModalAbierto(true);
  };

  const abrirEditar = (palabra: PalabraRestringida) => {
    setPalabraEditando(palabra);
    setModalAbierto(true);
  };

  const guardarPalabra = async (valor: string) => {
    try {
      setEnviando(true);
      if (palabraEditando) {
        const actualizada = await palabraService.editar(palabraEditando.id_palabra, { palabra: valor });
        setPalabras((prev) => prev.map((p) => (p.id_palabra === actualizada.id_palabra ? actualizada : p)));
        toast.success(t("toasts.editadaSuccess"));
      } else {
        const nueva = await palabraService.crear({ palabra: valor });
        setPalabras((prev) => [...prev, nueva].sort((a, b) => a.palabra.localeCompare(b.palabra)));
        toast.success(t("toasts.creadaSuccess"));
      }
      setModalAbierto(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("errorAccion"));
    } finally {
      setEnviando(false);
    }
  };

  const eliminarPalabra = (palabra: PalabraRestringida) => {
    mostrarConfirm({
      titulo: t("confirmar.titulo"),
      mensaje: t("confirmar.mensaje", { palabra: palabra.palabra }),
      onConfirm: async () => {
        try {
          setBusyId(palabra.id_palabra);
          await palabraService.eliminar(palabra.id_palabra);
          setPalabras((prev) => prev.filter((p) => p.id_palabra !== palabra.id_palabra));
          toast.success(t("toasts.eliminadaSuccess"));
        } catch (err) {
          toast.error(err instanceof Error ? err.message : t("errorAccion"));
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  return (
    <main className="palabras-moderacion">
      <div className="palabras-moderacion__header">
        <div>
          <h1 className="palabras-moderacion__title">{t("title")}</h1>
          <p className="palabras-moderacion__subtitle">{t("subtitle")}</p>
        </div>
        <button type="button" className="button button--medium" onClick={abrirCrear}>
          <Plus size={16} />
          {t("acciones.agregar")}
        </button>
      </div>

      <SearchBar value={q} onChange={setQ} placeholder={t("searchPlaceholder")} />

      {error && <p className="palabras-moderacion__error">{error}</p>}

      {loading ? (
        <div className="palabras-moderacion__loading">
          <Loader2 className="palabras-moderacion__spinner" size={24} />
          {t("loading")}
        </div>
      ) : palabrasFiltradas.length === 0 ? (
        <div className="palabras-moderacion__empty">{t("empty")}</div>
      ) : (
        <table className="palabras-moderacion__table">
          <thead>
            <tr>
              <th>{t("tabla.palabra")}</th>
              <th className="palabras-moderacion__col-acciones">{t("tabla.acciones")}</th>
            </tr>
          </thead>
          <tbody>
            {palabrasFiltradas.map((palabra) => {
              const busy = busyId === palabra.id_palabra;
              return (
                <tr key={palabra.id_palabra}>
                  <td>{palabra.palabra}</td>
                  <td className="palabras-moderacion__col-acciones">
                    <button
                      type="button"
                      className="palabras-moderacion__icon-btn"
                      onClick={() => abrirEditar(palabra)}
                      disabled={busy}
                      aria-label={t("acciones.editar")}
                      title={t("acciones.editar")}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className="palabras-moderacion__icon-btn palabras-moderacion__icon-btn--danger"
                      onClick={() => eliminarPalabra(palabra)}
                      disabled={busy}
                      aria-label={t("acciones.eliminar")}
                      title={t("acciones.eliminar")}
                    >
                      {busy ? <Loader2 size={16} className="palabras-moderacion__spinner" /> : <Trash2 size={16} />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <PalabraFormModal
        isOpen={modalAbierto}
        inicial={palabraEditando}
        enviando={enviando}
        onClose={() => setModalAbierto(false)}
        onSubmit={guardarPalabra}
      />
    </main>
  );
}
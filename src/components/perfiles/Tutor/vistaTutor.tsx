"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil, Save, SquarePlus, X } from "lucide-react";
import PostCard from "../../posts/PostCard/PostCard";
import HorizontalCarousel from "../../ui/HorizontalCarousel/HorizontalCarousel";
import CrearPublicacionForm from "../../ui/Modal/CrearPublicacionForm/CrearPublicacionForm";
import HorarioSemanal from "./Horario/Horario";
import { usePerspectivaInterna } from "../../../context/PerspectivaInternaContext";
import { apiClient, type ApiError } from "../../../lib/apiClient";
import { TAG_TUTORIA } from "../../../lib/tags";
import { useEstados } from "../../../hooks/useEstados";
import { useAuthStore } from "../../../store/authStore";
import { useUIStore } from "../../../store/uiStore";
import { guardarHorarioUsuario, obtenerHorarioUsuario } from "../../../services/horarioService";
import "../../ui/Modal/Modal.css";
import DetallePublicacion from "../../ui/Modal/DetallePuclicacion/DetallePublicacion";
import type { DiaHorario, EspacioHorario, EstadoHorario } from "../../../types/horario";
import type { Publicacion, PublicacionesResponse } from "../../../types/publicacion";
import type { Tag } from "../../../types/tag";

interface CatalogPost {
  id: number;
  title: string;
  price: number;
  description: string;
  tags: Tag[];
  estado: string;
  images: string[];
  categorias: number[];
}

interface VistaTutorProps {
  userId?: number;
  userName?: string;
  userRating?: number;
  userImageUrl?: string;
}

export default function VistaTutor({
  userId,
  userName = "Usuario de SWAP",
  userRating = 0,
  userImageUrl,
}: VistaTutorProps = {}) {
  const t = useTranslations("perfil");
  const authUserId = useAuthStore((s) => s.usuario?.id_usuario);
  const { mostrarConfirm, agregarNotificacion } = useUIStore();
  const idUsuario = userId ?? authUserId;
  const { canCreatePublication, canEditCards } = usePerspectivaInterna();
  const estadosTutoria = useEstados("tutoria");

  const [catalogTutorias, setCatalogTutorias] = useState<CatalogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crearOpen, setCrearOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [postEditando, setPostEditando] = useState<CatalogPost | null>(null);
  const [selectedPost, setSelectedPost] = useState<CatalogPost | null>(null);
  const [horarioSlots, setHorarioSlots] = useState<EspacioHorario[]>([]);
  const [horarioOriginal, setHorarioOriginal] = useState<EspacioHorario[]>([]);
  const [horarioLoading, setHorarioLoading] = useState(true);
  const [horarioError, setHorarioError] = useState<string | null>(null);
  const [horarioEditando, setHorarioEditando] = useState(false);
  const [horarioGuardando, setHorarioGuardando] = useState(false);
  const [cambiosPendientes, setCambiosPendientes] = useState<Set<string>>(new Set());

  const fetchPublicaciones = useCallback(async () => {
    if (!idUsuario) {
      setCatalogTutorias([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const resTutorias = await apiClient.get<PublicacionesResponse>(
        `/api/publicacion/user/${idUsuario}?tipo=tutoria&all=true`
      );

      const mapPublicaciones = (data: Publicacion[]): CatalogPost[] =>
        data.map((pub) => ({
          id: pub.id_publicacion,
          title: pub.titulo,
          price: typeof pub.precio === "string" ? parseFloat(pub.precio) : pub.precio,
          description: pub.descripcion,
          tags: [{ ...TAG_TUTORIA, name: "Tutoría" }],
          estado: pub.estadoRel?.estado ?? "activo",
          images: pub.imagenes?.map((img) => img.url_imagen) || [],
          categorias: pub.etiquetas?.map((e) => e.id_etiqueta) || [],
        }));

      setCatalogTutorias(mapPublicaciones(resTutorias.data));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "No fue posible obtener las tutorías");
    } finally {
      setLoading(false);
    }
  }, [idUsuario]);

  const fetchHorario = useCallback(async () => {
    if (!idUsuario) {
      setHorarioSlots([]);
      setHorarioOriginal([]);
      setHorarioLoading(false);
      return;
    }

    try {
      setHorarioLoading(true);
      setHorarioError(null);
      const slots = await obtenerHorarioUsuario(idUsuario);
      setHorarioSlots(slots);
      setHorarioOriginal(slots);
      setCambiosPendientes(new Set());
      setHorarioEditando(false);
    } catch (err) {
      const apiError = err as ApiError;
      setHorarioError(apiError.message || "No fue posible obtener el horario");
    } finally {
      setHorarioLoading(false);
    }
  }, [idUsuario]);

  const handleEliminar = useCallback((id: number) => {
    mostrarConfirm({
      titulo: "Eliminar publicación",
      mensaje: "¿Seguro que deseas eliminar esta publicación? Esta acción no se puede deshacer.",
      onConfirm: async () => {
        try {
          await apiClient.delete(`/api/publicacion/${id}`);
          agregarNotificacion({
            tipo: "success",
            mensaje: "Publicación eliminada exitosamente.",
          });
          fetchPublicaciones();
        } catch (err) {
          const apiError = err as ApiError;
          agregarNotificacion({
            tipo: "error",
            mensaje: apiError.message || "No fue posible eliminar la publicación.",
          });
        }
      },
    });
  }, [agregarNotificacion, fetchPublicaciones, mostrarConfirm]);

  useEffect(() => {
    fetchPublicaciones();
  }, [fetchPublicaciones]);

  useEffect(() => {
    fetchHorario();
  }, [fetchHorario]);

  const handleToggleHorario = useCallback((dia: DiaHorario, hora: number) => {
    const key = horarioSlotKey(dia, hora);

    setHorarioSlots((prev) => {
      const actual = obtenerEstadoSlot(prev, dia, hora);
      if (actual === "ocupado") return prev;

      const siguienteEstado: EstadoHorario =
        actual === "disponible" ? "no_disponible" : "disponible";
      const sinSlot = prev.filter((slot) => slotKeyFromSlot(slot) !== key);
      const siguiente =
        siguienteEstado === "disponible"
          ? [...sinSlot, { dia, hora, estado: siguienteEstado }]
          : sinSlot;

      setCambiosPendientes((actuales) => {
        const next = new Set(actuales);
        const estadoOriginal = obtenerEstadoSlot(horarioOriginal, dia, hora);
        if (estadoOriginal === siguienteEstado) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });

      return siguiente;
    });
  }, [horarioOriginal]);

  const handleCancelarHorario = useCallback(() => {
    setHorarioSlots(horarioOriginal);
    setCambiosPendientes(new Set());
    setHorarioEditando(false);
  }, [horarioOriginal]);

  const guardarHorarioConfirmado = useCallback(async () => {
    if (!idUsuario) return;

    try {
      setHorarioGuardando(true);
      const slots = await guardarHorarioUsuario(idUsuario, horarioSlots);
      setHorarioSlots(slots);
      setHorarioOriginal(slots);
      setCambiosPendientes(new Set());
      setHorarioEditando(false);
      agregarNotificacion({
        tipo: "success",
        mensaje: "Horario actualizado correctamente.",
      });
    } catch (err) {
      const apiError = err as ApiError;
      agregarNotificacion({
        tipo: "error",
        mensaje: apiError.message || "No fue posible guardar el horario.",
      });
    } finally {
      setHorarioGuardando(false);
    }
  }, [agregarNotificacion, horarioSlots, idUsuario]);

  const handleGuardarHorario = useCallback(() => {
    mostrarConfirm({
      titulo: "Guardar cambios de horario",
      mensaje: `Se guardarán ${cambiosPendientes.size} cambios en tu disponibilidad semanal. ¿Deseas continuar?`,
      onConfirm: () => {
        void guardarHorarioConfirmado();
      },
    });
  }, [cambiosPendientes.size, guardarHorarioConfirmado, mostrarConfirm]);

  return (
    <>
      {/* Catalogo de tutorias con carrusel de cards */}
      <section className="perfil-page__section">
        <div className="perfil-page__catalog-bar">
          <h2 className="perfil-page__catalog-bar-title">{t("sections.catalog")}</h2>
          {canCreatePublication && (
            <button
              type="button"
              className="perfil-page__new-publication-btn"
              onClick={() => setCrearOpen(true)}
            >
              <SquarePlus size={18} strokeWidth={1.8} aria-hidden />
              {t("actions.newPublication")}
            </button>
          )}
        </div>

        {loading && (
          <p className="perfil-page__coming-soon">Cargando tutorías...</p>
        )}

        {error && (
          <p className="perfil-page__coming-soon" style={{ color: "var(--swap-danger-color)" }}>
            {error}
          </p>
        )}

        {!loading && !error && catalogTutorias.length === 0 && (
          <p className="perfil-page__coming-soon">
            Aún no tienes tutorías publicadas.
          </p>
        )}

        {!loading && !error && catalogTutorias.length > 0 && (
          <HorizontalCarousel>
            {catalogTutorias.map((pub) => (
              <div key={pub.id} className="h-carousel__item">
                <PostCard
                  publicacionId={pub.id}
                  tags={pub.tags}
                  title={pub.title}
                  price={pub.price}
                  description={pub.description}
                  images={pub.images}
                  estado={pub.estado}
                  estadosDisponibles={estadosTutoria}
                  onEditClick={() => {
                    setPostEditando(pub);
                    setEditOpen(true);
                  }}
                  onDeleteClick={() => handleEliminar(pub.id)}
                  onImageUpdate={(newUrl) => {
                    setCatalogTutorias((prev) =>
                      prev.map((p) =>
                        p.id === pub.id ? { ...p, images: [newUrl, ...p.images.slice(1)] } : p
                      )
                    );
                  }}
                  onEstadoChange={async (nuevoEstado) => {
                    try {
                      await apiClient.put(`/api/publicacion/${pub.id}`, {
                        estado: nuevoEstado,
                        etiquetas: pub.categorias,
                      });
                      setCatalogTutorias((prev) =>
                        prev.map((p) => p.id === pub.id ? { ...p, estado: nuevoEstado } : p)
                      );
                    } catch (err) {
                      const apiError = err as ApiError;
                      alert(apiError.message || "No fue posible cambiar el estado.");
                    }
                  }}
                  onDetallesClick={() => setSelectedPost(pub)}
                />
              </div>
            ))}
          </HorizontalCarousel>
        )}
      </section>

      <hr className="perfil-page__divider" />

      {/* modal de crear publicaiciones  */}
      {canCreatePublication && crearOpen && (
        <div className="modal-overlay" onClick={() => setCrearOpen(false)}>
          <div
            className="perfil-page__crear-pub-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("modal.createPublicationAria")}
          >
            <div className="perfil-page__crear-pub-modal-content">
              <CrearPublicacionForm
                mode="crear"
                onCancel={() => setCrearOpen(false)}
                onSuccess={() => {
                  setCrearOpen(false);
                  fetchPublicaciones();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal editar publicacion */}
      {canEditCards && editOpen && postEditando && (
        <div className="modal-overlay" onClick={() => setEditOpen(false)}>
          <div
            className="perfil-page__crear-pub-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("modal.editPublicationAria")}
          >
            <div className="perfil-page__crear-pub-modal-content">
              <CrearPublicacionForm
                mode="editar"
                publicacionId={postEditando.id}
                defaultValues={{
                  titulo:           postEditando.title,
                  descripcion:      postEditando.description,
                  precio:           String(postEditando.price),
                  tipo_publicacion: "tutoria",
                  categorias:       postEditando.categorias,
                  destacado:        false,
                  estado:           postEditando.estado as "disponible" | "vendido" | "reservado",
                }}
                onCancel={() => { setEditOpen(false); setPostEditando(null); }}
                onSuccess={() => {
                  setEditOpen(false);
                  setPostEditando(null);
                  fetchPublicaciones();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Horario semanal */}
      <section className="perfil-page__section">
        <div className="perfil-page__catalog-bar">
          <h2 className="perfil-page__catalog-bar-title">{t("sections.schedule")}</h2>
          {canCreatePublication && !horarioEditando && (
            <button
              type="button"
              className="perfil-page__new-publication-btn"
              onClick={() => setHorarioEditando(true)}
            >
              <Pencil size={18} strokeWidth={1.8} aria-hidden />
              {t('actions.editSchedule')}
            </button>
          )}
          {canCreatePublication && horarioEditando && (
            <div className="perfil-page__schedule-actions">
              <button
                type="button"
                className="perfil-page__secondary-btn"
                onClick={handleCancelarHorario}
                disabled={horarioGuardando}
              >
                <X size={18} strokeWidth={1.8} aria-hidden />
                Cancelar
              </button>
              <button
                type="button"
                className="perfil-page__new-publication-btn"
                onClick={handleGuardarHorario}
                disabled={horarioGuardando || cambiosPendientes.size === 0}
              >
                <Save size={18} strokeWidth={1.8} aria-hidden />
                {horarioGuardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          )}
        </div>
        {horarioLoading && (
          <p className="perfil-page__coming-soon">Cargando horario...</p>
        )}
        {horarioError && (
          <p className="perfil-page__coming-soon" style={{ color: "var(--swap-danger-color)" }}>
            {horarioError}
          </p>
        )}
        {!horarioLoading && !horarioError && (
          <HorarioSemanal
            slots={horarioSlots}
            editable={horarioEditando}
            disabled={horarioGuardando}
            pendingKeys={cambiosPendientes}
            onToggleSlot={handleToggleHorario}
          />
        )}
      </section>

      {selectedPost && (
        <DetallePublicacion
          isOpen={true}
          onClose={() => setSelectedPost(null)}
          type="tutoria"
          title={selectedPost.title}
          price={selectedPost.price}
          description={selectedPost.description}
          imageUrl={selectedPost.images[0] ?? ""}
          likes={0}
          publicacionId={selectedPost.id}
          sellerName={userName}
          sellerRating={userRating}
          sellerImageUrl={userImageUrl}
          onSolicitarTutoria={() => console.log("Solicitar tutoría")}
          estado={selectedPost.estado}
        />
      )}
    </>
  );
}

function horarioSlotKey(dia: DiaHorario, hora: number): string {
  return `${dia}-${hora}`;
}

function slotKeyFromSlot(slot: EspacioHorario): string {
  return horarioSlotKey(slot.dia, slot.hora);
}

function obtenerEstadoSlot(
  slots: EspacioHorario[],
  dia: DiaHorario,
  hora: number
): EstadoHorario {
  return slots.find((slot) => slot.dia === dia && slot.hora === hora)?.estado ?? "no_disponible";
}

"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import DetallePublicacion from "../../ui/Modal/DetallePuclicacion/DetallePublicacion";
import JustificanteModeracionModal from "../../ui/Modal/Reporte/JustificanteModeracionModal";
import type { Publicacion } from "../../../types/publicacion";
import type { Tag } from "../../../types/tag";
import AccionesPublicacion from "./AccionesPublicacion";
import FiltrosPublicaciones from "./FiltrosPublicaciones";
import PublicacionModeracionCard from "./PublicacionModeracionCard";
import { usePublicacionesModeracion } from "./usePublicacionesModeracion";
import "../../ui/Button/Button.css";
import "./PublicacionesModeracion.css";

function tagsFromPublicacion(publicacion: Publicacion): Tag[] {
  return publicacion.etiquetas?.map((rel) => ({
    id: rel.etiqueta.id_etiqueta,
    name: rel.etiqueta.nombre,
    parentId: rel.etiqueta.id_etiqueta_padre,
  })) ?? [];
}

export default function PublicacionesModeracion() {
  const t = useTranslations("moderacion.publicaciones");
  const {
    publicaciones,
    total,
    page,
    setPage,
    pageCount,
    loading,
    error,
    selected,
    setSelected,
    busyId,
    filtros,
    justificantePendiente,
    setJustificantePendiente,
    motivosReactivacion,
    tituloJustificante,
    preguntaJustificante,
    abrirJustificante,
    ejecutarAccionModeracion,
  } = usePublicacionesModeracion();

  return (
    <main className="moderacion-publicaciones">
      <div className="moderacion-publicaciones__header">
        <div>
          <h1 className="moderacion-publicaciones__title">{t("title")}</h1>
          <p className="moderacion-publicaciones__subtitle">
            {t("subtitle")}
          </p>
        </div>
        <span className="moderacion-publicaciones__count">{t("resultsCount", { count: total })}</span>
      </div>

      <FiltrosPublicaciones filtros={filtros} />

      {error && <p className="moderacion-publicaciones__error">{error}</p>}

      {loading ? (
        <div className="moderacion-publicaciones__loading">
          <Loader2 className="moderacion-publicaciones__spinner" size={24} />
          {t("loading")}
        </div>
      ) : publicaciones.length === 0 ? (
        <div className="moderacion-publicaciones__empty">{t("empty")}</div>
      ) : (
        <div className="moderacion-publicaciones__grid">
          {publicaciones.map((publicacion) => (
            <PublicacionModeracionCard
              key={publicacion.id_publicacion}
              publicacion={publicacion}
              busy={busyId === publicacion.id_publicacion}
              onDetalle={setSelected}
              onBajar={(pub) => abrirJustificante("bajar", pub)}
              onReactivar={(pub) => abrirJustificante("reactivar", pub)}
              onEliminar={(pub) => abrirJustificante("eliminar", pub)}
            />
          ))}
        </div>
      )}

      <div className="moderacion-publicaciones__pagination">
        <button
          type="button"
          className="button button--small"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page <= 1 || loading}
        >
          <ChevronLeft size={14} />
          {t("pagination.anterior")}
        </button>
        <span>{t("pagination.paginaInfo", { page, pageCount })}</span>
        <button
          type="button"
          className="button button--small"
          onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
          disabled={page >= pageCount || loading}
        >
          {t("pagination.siguiente")}
          <ChevronRight size={14} />
        </button>
      </div>

      {selected && (
        <DetallePublicacion
          isOpen
          onClose={() => setSelected(null)}
          type={selected.tipoPerfil?.tipo_perfil === "tutoria" ? "tutoria" : "venta"}
          title={selected.titulo}
          price={Number(selected.precio)}
          description={selected.descripcion}
          imagenes={selected.imagenes}
          tags={tagsFromPublicacion(selected)}
          likes={selected.me_gusta}
          publicacionId={selected.id_publicacion}
          sellerName={selected.usuario?.nombre ?? t("card.usuarioDesconocido")}
          sellerRating={selected.usuario?.calificacion ?? 0}
          sellerId={selected.usuario?.id_usuario}
          sellerImageUrl={selected.usuario?.url_foto_perfil}
          estado={selected.estadoRel?.estado ?? selected.estado}
          soloLectura
          showActions={false}
          actionsSlot={(
            <AccionesPublicacion
              publicacion={selected}
              onBajar={(pub) => abrirJustificante("bajar", pub)}
              onReactivar={(pub) => abrirJustificante("reactivar", pub)}
              onEliminar={(pub) => abrirJustificante("eliminar", pub)}
              busy={busyId === selected.id_publicacion}
            />
          )}
        />
      )}

      {justificantePendiente && (
        <JustificanteModeracionModal
          isOpen
          tipoObjetivo="publicacion"
          titulo={tituloJustificante}
          pregunta={preguntaJustificante}
          motivosPersonalizados={justificantePendiente.accion === "reactivar" ? motivosReactivacion : undefined}
          enviando={busyId === justificantePendiente.publicacion.id_publicacion}
          onClose={() => setJustificantePendiente(null)}
          onSubmit={ejecutarAccionModeracion}
        />
      )}
    </main>
  );
}

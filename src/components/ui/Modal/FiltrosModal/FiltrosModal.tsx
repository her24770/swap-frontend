"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { EtiquetaBD } from "../../../../hooks/useTodasEtiquetas";
import type { PublicacionFilters } from "../../../../types/publicacion";
import type { DiaHorario } from "../../../../types/horario";
import "../../Button/Button.css";
import "./FiltrosModal.css";
import RangoSlider from "./Sliders/Rango/RangoSlider";
import EstrellaSlider from "./Sliders/Estrellas/EstrellaSlider";
import ToggleOpciones from "./ToggleOpciones";
import EtiquetasFiltro from "./EtiquetasFiltro";
import HorarioDiasFiltro from "./HorarioDiasFiltro";

export type TipoFiltro = NonNullable<PublicacionFilters["tipo"]>;

export interface FiltroValues {
  etiquetas: number[];
  precioMin: number;
  precioMax: number;
  calificacionMin: number;
  calificacionMax: number;
  // Para tutorías
  modalidad?: ("virtual" | "presencial")[];
  horaDesde?: string;
  horaHasta?: string;
  dias?: DiaHorario[];
  // Para materiales
  tipoMaterial?: ("compra" | "alquiler")[];
  // Para negocios
  tipoNegocio?: ("producto" | "servicio")[];
}

interface FiltrosPanelProps {
  tipo: TipoFiltro;
  etiquetas: EtiquetaBD[];
  etiquetasLoading?: boolean;
  precioMax?: number;
  onAplicar: (values: FiltroValues) => void;
  onLimpiar?: () => void;
  onClose?: () => void;
}

const alternar = <T,>(lista: T[], valor: T): T[] =>
  lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor];

export default function FiltrosModal({
  tipo,
  etiquetas,
  etiquetasLoading = false,
  precioMax = 500,
  onAplicar,
  onLimpiar,
  onClose,
}: FiltrosPanelProps) {
  const t = useTranslations("common.filtros");
  const [selectedEtiquetas, setSelectedEtiquetas] = useState<number[]>([]);
  const [precioMin, setPrecioMin] = useState(0);
  const [precio, setPrecioMax] = useState(precioMax);
  const [calMin, setCalMin] = useState(0);
  const [calMax, setCalMax] = useState(5);

  // Tutorías
  const [modalidad, setModalidad] = useState<("virtual" | "presencial")[]>([]);
  const [horaDesde, setHoraDesde] = useState("07:00");
  const [horaHasta, setHoraHasta] = useState("20:00");
  const [dias, setDias] = useState<DiaHorario[]>([]);

  // Materiales
  const [tipoMaterial, setTipoMaterial] = useState<("compra" | "alquiler")[]>([]);

  // Negocios
  const [tipoNegocio, setTipoNegocio] = useState<("producto" | "servicio")[]>([]);

  const handleLimpiar = () => {
    setSelectedEtiquetas([]);
    setPrecioMin(0);
    setPrecioMax(precioMax);
    setCalMin(0);
    setCalMax(5);
    setModalidad([]);
    setHoraDesde("07:00");
    setHoraHasta("20:00");
    setDias([]);
    setTipoMaterial([]);
    setTipoNegocio([]);
    onLimpiar?.();
  };

  const handleAplicar = () => {
    onAplicar({
      etiquetas: selectedEtiquetas,
      precioMin,
      precioMax: precio,
      calificacionMin: calMin,
      calificacionMax: calMax,
      modalidad,
      horaDesde,
      horaHasta,
      dias,
      tipoMaterial,
      tipoNegocio,
    });
    onClose?.();
  };

  return (
    <div className="filtros-panel filtros-panel--dropdown" role="dialog" aria-label={t("ariaLabel")}>
      <div className="filtros-panel__header">
        <h2 className="filtros-panel__title">{t("title")}</h2>
        {onClose && (
          <button
            type="button"
            className="filtros-panel__close"
            onClick={onClose}
            aria-label={t("close")}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="filtros-panel__body">
        {/* ── Opciones según tipo ── */}
        {tipo === "tutoria" && (
          <ToggleOpciones
            label={t("modalidad")}
            options={["virtual", "presencial"] as const}
            selected={modalidad}
            onToggle={(op) => setModalidad((prev) => alternar(prev, op))}
            optionLabel={(op) => t(`modalidadOptions.${op}`)}
          />
        )}

        {tipo === "material" && (
          <ToggleOpciones
            label={t("tipo")}
            options={["compra", "alquiler"] as const}
            selected={tipoMaterial}
            onToggle={(op) => setTipoMaterial((prev) => alternar(prev, op))}
            optionLabel={(op) => t(`materialOptions.${op}`)}
          />
        )}

        {tipo === "negocio" && (
          <ToggleOpciones
            label={t("tipo")}
            options={["producto", "servicio"] as const}
            selected={tipoNegocio}
            onToggle={(op) => setTipoNegocio((prev) => alternar(prev, op))}
            optionLabel={(op) => t(`negocioOptions.${op}`)}
          />
        )}

        <EtiquetasFiltro
          etiquetas={etiquetas}
          loading={etiquetasLoading}
          selected={selectedEtiquetas}
          onToggle={(id) => setSelectedEtiquetas((prev) => alternar(prev, id))}
        />

        {/* ── Precio ── */}
        <div className="filtros-panel__section">
          <span className="filtros-panel__label">{t("precio")}</span>
          <RangoSlider
            min={0}
            max={precioMax}
            valueMin={precioMin}
            valueMax={precio}
            onChange={(mn, mx) => { setPrecioMin(mn); setPrecioMax(mx); }}
            formatLabel={(v) => `Q${v}`}
          />
        </div>

        {tipo === "tutoria" && (
          <HorarioDiasFiltro
            horaDesde={horaDesde}
            horaHasta={horaHasta}
            dias={dias}
            onHoraDesdeChange={setHoraDesde}
            onHoraHastaChange={setHoraHasta}
            onToggleDia={(dia) => setDias((prev) => alternar(prev, dia))}
          />
        )}

        {/* ── Calificación ── */}
        <div className="filtros-panel__section">
          <span className="filtros-panel__label">{t("calificacion")}</span>
          <div className="filtros-panel__stars">
            <EstrellaSlider
              valueMin={calMin}
              valueMax={calMax}
              onChange={(mn, mx) => { setCalMin(mn); setCalMax(mx); }}
            />
          </div>
        </div>
      </div>

      <div className="filtros-panel__actions">
        <button
          type="button"
          className="button button--large button--full-width"
          onClick={handleAplicar}
        >
          {t("aplicar")}
        </button>
        <button
          type="button"
          className="filtros-panel__btn-clear"
          onClick={handleLimpiar}
        >
          {t("limpiar")}
        </button>
      </div>
    </div>
  );
}

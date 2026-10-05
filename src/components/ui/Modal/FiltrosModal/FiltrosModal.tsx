"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Check, X} from "lucide-react";
import type { EtiquetaBD } from "../../../../hooks/useTodasEtiquetas";
import type { PublicacionFilters } from "../../../../types/publicacion";
import type { DiaHorario } from "../../../../types/horario";
import "../../Button/Button.css";
import "./FiltrosModal.css";
import RangoSlider from "./Sliders/Rango/RangoSlider";
import EstrellaSlider from "./Sliders/Estrellas/EstrellaSlider";

export type TipoFiltro = NonNullable<PublicacionFilters["tipo"]>;

const DIAS_FULL: DiaHorario[] = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [calificacion, setCalificacion] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
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

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleEtiqueta = (id: number) => {
    setSelectedEtiquetas((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const toggleModalidad = (val: "virtual" | "presencial") => {
    setModalidad((prev) =>
      prev.includes(val) ? prev.filter((m) => m !== val) : [...prev, val]
    );
  };

  const toggleTipoMaterial = (val: "compra" | "alquiler") => {
    setTipoMaterial((prev) =>
      prev.includes(val) ? prev.filter((t) => t !== val) : [...prev, val]
    );
  };

  const toggleTipoNegocio = (val: "producto" | "servicio") => {
    setTipoNegocio((prev) =>
      prev.includes(val) ? prev.filter((t) => t !== val) : [...prev, val]
    );
  };

  const toggleDia = (dia: DiaHorario) => {
    setDias((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  const handleLimpiar = () => {
    setSelectedEtiquetas([]);
    setPrecioMax(precioMax);
    setCalificacion(0);
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

  const triggerLabel = etiquetasLoading
    ? t("loading")
    : selectedEtiquetas.length === 0
      ? t("categoriesEmpty")
      : selectedEtiquetas.length === 1
        ? t("categoriesOne")
        : t("categoriesMany", { count: selectedEtiquetas.length });

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
        <div className="filtros-panel__section">
          <span className="filtros-panel__label">{t("modalidad")}</span>
          <div className="filtros-panel__toggle-row">
            {(["virtual", "presencial"] as const).map((op) => (
              <button
                key={op}
                type="button"
                className={`filtros-panel__toggle-btn${modalidad.includes(op) ? " filtros-panel__toggle-btn--active" : ""}`}
                onClick={() => toggleModalidad(op)}
              >
                <span className="filtros-panel__check-box">
                  {modalidad.includes(op) && <Check size={10} strokeWidth={3} color="white" />}
                </span>
                {t(`modalidadOptions.${op}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      {tipo === "material" && (
        <div className="filtros-panel__section">
          <span className="filtros-panel__label">{t("tipo")}</span>
          <div className="filtros-panel__toggle-row">
            {(["compra", "alquiler"] as const).map((op) => (
              <button
                key={op}
                type="button"
                className={`filtros-panel__toggle-btn${tipoMaterial.includes(op) ? " filtros-panel__toggle-btn--active" : ""}`}
                onClick={() => toggleTipoMaterial(op)}
              >
                <span className="filtros-panel__check-box">
                  {tipoMaterial.includes(op) && <Check size={10} strokeWidth={3} color="white" />}
                </span>
                {t(`materialOptions.${op}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      {tipo === "negocio" && (
        <div className="filtros-panel__section">
          <span className="filtros-panel__label">{t("tipo")}</span>
          <div className="filtros-panel__toggle-row">
            {(["producto", "servicio"] as const).map((op) => (
              <button
                key={op}
                type="button"
                className={`filtros-panel__toggle-btn${tipoNegocio.includes(op) ? " filtros-panel__toggle-btn--active" : ""}`}
                onClick={() => toggleTipoNegocio(op)}
              >
                <span className="filtros-panel__check-box">
                  {tipoNegocio.includes(op) && <Check size={10} strokeWidth={3} color="white" />}
                </span>
                {t(`negocioOptions.${op}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Etiquetas ── */}
      <div className="filtros-panel__section">
        <span className="filtros-panel__label">{t("etiquetas")}</span>
        <div className="filtros-panel__dropdown" ref={dropdownRef}>
          <button
            type="button"
            disabled={etiquetasLoading}
            onClick={() => setDropdownOpen((prev) => !prev)}
            className={`filtros-panel__tags-trigger${selectedEtiquetas.length > 0 ? " filtros-panel__tags-trigger--has-value" : ""}${dropdownOpen ? " filtros-panel__tags-trigger--open" : ""}`}
          >
            <span>{triggerLabel}</span>
            <ChevronDown
              size={14}
              className={`filtros-panel__chevron${dropdownOpen ? " filtros-panel__chevron--open" : ""}`}
            />
          </button>

          {dropdownOpen && !etiquetasLoading && (
            <div className="filtros-panel__tags-menu">
              {etiquetas.map((e) => {
                const selected = selectedEtiquetas.includes(e.id_etiqueta);
                return (
                  <button
                    key={e.id_etiqueta}
                    type="button"
                    onClick={() => toggleEtiqueta(e.id_etiqueta)}
                    className={`filtros-panel__tags-option${selected ? " filtros-panel__tags-option--selected" : ""}`}
                  >
                    <span className={`filtros-panel__tags-checkbox${selected ? " filtros-panel__tags-checkbox--checked" : ""}`}>
                      {selected && <Check size={9} strokeWidth={3} color="white" />}
                    </span>
                    {e.nombre}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selectedEtiquetas.length > 0 && (
          <div className="filtros-panel__tags-list">
            {selectedEtiquetas.map((id) => {
              const e = etiquetas.find((et) => et.id_etiqueta === id);
              return e ? (
                <span key={id} className="filtros-panel__tag-pill">
                  {e.nombre}
                  <button
                    type="button"
                    onClick={() => toggleEtiqueta(id)}
                    className="filtros-panel__tag-remove"
                    aria-label={t("removeTagAria", { name: e.nombre })}
                  >
                    <X size={10} strokeWidth={2.5} />
                  </button>
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

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

        {/* ── Horario y días solo tutorías ── */}
        {tipo === "tutoria" && (
        <>
            <div className="filtros-panel__section">
            <span className="filtros-panel__label">{t("horario")}</span>
            <div className="filtros-panel__time-row">
                <div className="filtros-panel__time-group">
                <span className="filtros-panel__time-label">{t("timeFrom")}</span>
                <input
                    type="time"
                    value={horaDesde}
                    onChange={(e) => setHoraDesde(e.target.value)}
                    className="filtros-panel__time-input"
                />
                </div>
                <div className="filtros-panel__time-group">
                <span className="filtros-panel__time-label">{t("timeTo")}</span>
                <input
                    type="time"
                    value={horaHasta}
                    onChange={(e) => setHoraHasta(e.target.value)}
                    className="filtros-panel__time-input"
                />
                </div>
            </div>
            </div>

            <div className="filtros-panel__section">
            <span className="filtros-panel__label">{t("dias")}</span>
            <div className="filtros-panel__days-row">
                {DIAS_FULL.map((dia) => (
                <button
                    key={dia}
                    type="button"
                    className={`filtros-panel__day-btn${dias.includes(dia) ? " filtros-panel__day-btn--active" : ""}`}
                    onClick={() => toggleDia(dia)}
                    aria-label={t(`daysAria.${dia}`)}
                >
                    {t(`daysShort.${dia}`)}
                </button>
                ))}
            </div>
            </div>
        </>
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
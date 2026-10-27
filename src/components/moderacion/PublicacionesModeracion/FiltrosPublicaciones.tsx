import { useTranslations } from "next-intl";
import SearchBar from "../../ui/SearchBar/SearchBar";
import type { FiltrosModeracion } from "./usePublicacionesModeracion";

const TIPOS = [
  { value: "", labelKey: "tipos.todos" },
  { value: "negocio", labelKey: "tipos.negocio" },
  { value: "material", labelKey: "tipos.material" },
  { value: "tutoria", labelKey: "tipos.tutoria" },
] as const;

const ESTADOS = [
  { value: "", labelKey: "estados.todos" },
  { value: "pendiente", labelKey: "estados.pendiente" },
  { value: "activo", labelKey: "estados.activo" },
  { value: "inactivo", labelKey: "estados.inactivo" },
  { value: "disponible", labelKey: "estados.disponible" },
  { value: "reservado", labelKey: "estados.reservado" },
  { value: "vendido", labelKey: "estados.vendido" },
] as const;

export default function FiltrosPublicaciones({ filtros }: { filtros: FiltrosModeracion }) {
  const t = useTranslations("moderacion.publicaciones");
  const { qDraft, setQDraft, tipo, setTipo, estado, setEstado, sort, order, setSortOrder } = filtros;

  return (
    <div className="moderacion-publicaciones__filters">
      <SearchBar
        value={qDraft}
        onChange={setQDraft}
        placeholder={t("searchPlaceholder")}
      />
      <select
        className="moderacion-publicaciones__select"
        value={tipo}
        onChange={(event) => setTipo(event.target.value as typeof tipo)}
      >
        {TIPOS.map((option) => (
          <option key={option.value} value={option.value}>{t(option.labelKey)}</option>
        ))}
      </select>
      <select
        className="moderacion-publicaciones__select"
        value={estado}
        onChange={(event) => setEstado(event.target.value)}
      >
        {ESTADOS.map((option) => (
          <option key={option.value} value={option.value}>{t(option.labelKey)}</option>
        ))}
      </select>
      <select
        className="moderacion-publicaciones__select"
        value={`${sort}:${order}`}
        onChange={(event) => {
          const [nextSort, nextOrder] = event.target.value.split(":");
          setSortOrder(nextSort as typeof sort, nextOrder as typeof order);
        }}
      >
        <option value="fecha:desc">{t("sort.fechaDesc")}</option>
        <option value="fecha:asc">{t("sort.fechaAsc")}</option>
        <option value="me_gusta:desc">{t("sort.meGustaDesc")}</option>
        <option value="precio:desc">{t("sort.precioDesc")}</option>
        <option value="precio:asc">{t("sort.precioAsc")}</option>
      </select>
    </div>
  );
}

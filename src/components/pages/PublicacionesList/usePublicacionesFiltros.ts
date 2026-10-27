import { useCallback, useState } from "react";
import { useTodasEtiquetas } from "../../../hooks/useTodasEtiquetas";
import { useServices } from "../../../services/context/ServiceContext";
import type { FiltroValues, TipoFiltro } from "../../ui/Modal/FiltrosModal/FiltrosModal";
import type { FiltroPublicacionBody, FiltroTutorBody, Publicacion, TutorFiltrado } from "../../../types/publicacion";

const FILTER_LIMIT = 100;
const TUTORIA_PRECIO_MAX = 200;
const PUBLICACION_PRECIO_MAX = 1000;

export const getPrecioMax = (tipo: TipoFiltro) =>
    tipo === "tutoria" ? TUTORIA_PRECIO_MAX : PUBLICACION_PRECIO_MAX;

function buildTutorBody(values: FiltroValues, etiquetasIds: number[]): FiltroTutorBody {
    return {
        etiquetas: etiquetasIds.length > 0 ? etiquetasIds : undefined,
        precio_min: values.precioMin > 0 ? values.precioMin : undefined,
        precio_max: values.precioMax < TUTORIA_PRECIO_MAX ? values.precioMax : undefined,
        calificacion_min: values.calificacionMin > 0 ? values.calificacionMin : undefined,
        calificacion_max: values.calificacionMax < 5 ? values.calificacionMax : undefined,
        dias: values.dias && values.dias.length > 0 ? values.dias : undefined,
        hora_inicio: values.horaDesde !== "07:00" ? values.horaDesde : undefined,
        hora_final: values.horaHasta !== "20:00" ? values.horaHasta : undefined,
        limit: FILTER_LIMIT,
    };
}

function buildPublicacionBody(
    tipo: Exclude<TipoFiltro, "tutoria">,
    values: FiltroValues,
    etiquetasIds: number[],
): FiltroPublicacionBody {
    return {
        tipo,
        etiquetas: etiquetasIds.length > 0 ? etiquetasIds : undefined,
        precio_min: values.precioMin > 0 ? values.precioMin : undefined,
        precio_max: values.precioMax < PUBLICACION_PRECIO_MAX ? values.precioMax : undefined,
        calificacion_min: values.calificacionMin > 0 ? values.calificacionMin : undefined,
        calificacion_max: values.calificacionMax < 5 ? values.calificacionMax : undefined,
        limit: FILTER_LIMIT,
    };
}

// Estado y lógica de filtrado de PublicacionesList, con la parte específica de cada tipo.
export function usePublicacionesFiltros(tipo?: TipoFiltro) {
    const { publicacion: service } = useServices();
    const { etiquetas, loading: etiquetasLoading } = useTodasEtiquetas();
    const [filteredResults, setFilteredResults] = useState<Publicacion[] | null>(null);
    const [filteredTutores, setFilteredTutores] = useState<TutorFiltrado[] | null>(null);
    const [filterLoading, setFilterLoading] = useState(false);
    const [activeFilters, setActiveFilters] = useState<FiltroValues | null>(null);

    const findEtiquetaId = useCallback(
        (nombre: string) =>
            etiquetas.find((e) => e.nombre.toLowerCase() === nombre.toLowerCase())?.id_etiqueta,
        [etiquetas],
    );

    const aplicarFiltros = useCallback(
        async (values: FiltroValues) => {
            if (!tipo) return;
            setActiveFilters(values);
            setFilterLoading(true);
            const etiquetasIds = [...values.etiquetas];
            if (tipo === "negocio" && values.tipoNegocio?.length === 1) {
                const id = findEtiquetaId(values.tipoNegocio[0] === "producto" ? "Producto" : "Servicio");
                if (id) etiquetasIds.push(id);
            }
            if (tipo === "material" && values.tipoMaterial?.length === 1) {
                const id = findEtiquetaId(values.tipoMaterial[0] === "compra" ? "Compra" : "Alquiler");
                if (id) etiquetasIds.push(id);
            }
            if (tipo === "tutoria") {
                try {
                    setFilteredTutores(await service.getFiltradasTutorias(buildTutorBody(values, etiquetasIds)));
                } catch {
                    setFilteredTutores([]);
                } finally {
                    setFilterLoading(false);
                }
                return;
            }

            const body = buildPublicacionBody(tipo, values, etiquetasIds);
            try {
                const result =
                    tipo === "negocio"
                        ? await service.getFiltradasNegocios(body)
                        : await service.getFiltradasMateriales(body);
                setFilteredResults(result);
            } catch {
                setFilteredResults([]);
            } finally {
                setFilterLoading(false);
            }
        },
        [tipo, findEtiquetaId, service],
    );

    const limpiarFiltros = useCallback(() => {
        setFilteredResults(null);
        setFilteredTutores(null);
        setActiveFilters(null);
    }, []);

    return {
        etiquetas,
        etiquetasLoading,
        filteredResults,
        filteredTutores,
        filterLoading,
        activeFilters,
        aplicarFiltros,
        limpiarFiltros,
    };
}

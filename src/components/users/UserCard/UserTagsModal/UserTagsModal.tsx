"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Check } from "lucide-react";
import { apiClient } from "../../../../lib/apiClient";
import { useTodasEtiquetas, type EtiquetaBD } from "../../../../hooks/useTodasEtiquetas";
import type { Tag } from "../../../../types/tag";
import "./UserTagsModal.css";

interface UserTagsModalProps {
    isOpen: boolean;
    userId: number;
    currentTags: Tag[];
    onClose: () => void;
    onSaved?: (tags: Tag[]) => void;
}

export default function UserTagsModal({
    isOpen,
    userId,
    currentTags,
    onClose,
    onSaved,
    }: UserTagsModalProps) {
    const { etiquetas, loading, error } = useTodasEtiquetas();
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        setSelectedIds(currentTags.map((tag) => tag.id));
        setSaveError(null);
    }, [currentTags, isOpen]);

    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    const toggleTag = (id: number) => {
        setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((tagId) => tagId !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        try {
        setSaving(true);
        setSaveError(null);

        const response = await apiClient.post<{ data?: unknown }>(`/api/etiqueta/user/${userId}`, {
            ids: selectedIds,
        });

        const nextTags: Tag[] = etiquetas
            .filter((tag: EtiquetaBD) => selectedSet.has(tag.id_etiqueta))
            .map((tag: EtiquetaBD) => ({
            id: tag.id_etiqueta,
            name: tag.nombre,
            parentId: tag.id_etiqueta_padre,
            }));

        onSaved?.(nextTags);
        onClose();
        return response;
        } catch (err: any) {
        setSaveError(err.message || "No fue posible guardar las etiquetas.");
        } finally {
        setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="user-tags-modal__overlay" role="presentation" onClick={onClose}>
        <div
            className="user-tags-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-label="Administrar etiquetas"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="user-tags-modal__header">
            <div>
                <h2 className="user-tags-modal__title">Administrar etiquetas del perfil</h2>
            </div>
            <button type="button" className="user-tags-modal__close" onClick={onClose} aria-label="Cerrar">
                <X size={18} />
            </button>
            </div>

            <p className="user-tags-modal__subtitle">
            Selecciona las etiquetas que quieres mantener. Las que no estén marcadas se eliminarán al guardar.
            </p>

            {error && <p className="user-tags-modal__message user-tags-modal__message--error">{error}</p>}
            {saveError && <p className="user-tags-modal__message user-tags-modal__message--error">{saveError}</p>}

            <div className="user-tags-modal__content">
            {loading ? (
                <p className="user-tags-modal__empty">Cargando etiquetas...</p>
            ) : etiquetas.length === 0 ? (
                <p className="user-tags-modal__empty">No hay etiquetas disponibles.</p>
            ) : (
                <div className="user-tags-modal__grid">
                {etiquetas.map((tag: EtiquetaBD) => {
                    const active = selectedSet.has(tag.id_etiqueta);
                    return (
                    <button
                        key={tag.id_etiqueta}
                        type="button"
                        className={`user-tags-modal__tag${active ? " user-tags-modal__tag--active" : ""}`}
                        onClick={() => toggleTag(tag.id_etiqueta)}
                    >
                        <span className="user-tags-modal__tag-check">
                        {active && <Check size={12} strokeWidth={3} />}
                        </span>
                        <span>{tag.nombre}</span>
                    </button>
                    );
                })}
                </div>
            )}
            </div>

            <div className="user-tags-modal__footer">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={saving}>
                Cancelar
            </button>
            <button type="button" className="button button--medium" onClick={handleSave} disabled={saving || loading}>
                {saving ? "Guardando..." : "Guardar cambios"}
            </button>
            </div>
        </div>
        </div>
    );
}
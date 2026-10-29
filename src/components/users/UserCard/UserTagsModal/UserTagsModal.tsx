"use client";

import { useMemo, useState } from "react";
import { X, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { apiClient, type ApiError } from "../../../../lib/apiClient";
import { useTodasEtiquetas, type EtiquetaBD } from "../../../../hooks/useTodasEtiquetas";
import SearchBar from "../../../ui/SearchBar/SearchBar";
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
    const t = useTranslations("userTagsModal");
    const { etiquetas, loading, error } = useTodasEtiquetas();
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const [previo, setPrevio] = useState({ isOpen, currentTags });

    // Al abrir el modal se reinicia el formulario durante el render, sin efecto.
    if (previo.isOpen !== isOpen || previo.currentTags !== currentTags) {
        setPrevio({ isOpen, currentTags });
        if (isOpen) {
            setSelectedIds(currentTags.map((tag) => tag.id));
            setSearchQuery("");
            setSaveError(null);
        }
    }

    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    const filteredEtiquetas = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        if (!normalizedQuery) {
            return etiquetas;
        }

        const normalizeText = (value: string) =>
            value
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");

        return etiquetas.filter((tag: EtiquetaBD) =>
            normalizeText(tag.nombre).includes(normalizeText(normalizedQuery))
        );
    }, [etiquetas, searchQuery]);

    const toggleTag = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((tagId) => tagId !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        // validate number of tags
        if (selectedIds.length < 3) {
            setSaveError(t("errors.min"));
            return;
        }
        if (selectedIds.length > 20) {
            setSaveError(t("errors.max"));
            return;
        }

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
        } catch (err) {
            setSaveError((err as ApiError).message || t("errors.fallback"));
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
                aria-label={t("ariaLabel")}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="user-tags-modal__header">
                    <div>
                        <h2 className="user-tags-modal__title">{t("title")}</h2>
                    </div>
                    <button type="button" className="user-tags-modal__close" onClick={onClose} aria-label={t("closeAria")}>
                        <X size={18} />
                    </button>
                </div>

                <p className="user-tags-modal__subtitle">
                    {t("subtitle")}
                </p>

                <div className="user-tags-modal__search">
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder={t("searchPlaceholder")}
                    />
                </div>

                {error && <p className="user-tags-modal__message user-tags-modal__message--error">{error}</p>}
                {saveError && <p className="user-tags-modal__message user-tags-modal__message--error">{saveError}</p>}

                <div className="user-tags-modal__content">
                    {loading ? (
                        <p className="user-tags-modal__empty">{t("loading")}</p>
                    ) : etiquetas.length === 0 ? (
                        <p className="user-tags-modal__empty">{t("empty")}</p>
                    ) : filteredEtiquetas.length === 0 ? (
                        <p className="user-tags-modal__empty">{t("emptySearch")}</p>
                    ) : (
                        <div className="user-tags-modal__grid">
                            {filteredEtiquetas.map((tag: EtiquetaBD) => {
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
                        {t("cancel")}
                    </button>
                    <button
                        type="button"
                        className="button button--medium"
                        onClick={handleSave}
                        disabled={saving || loading || selectedIds.length < 3 || selectedIds.length > 20}
                    >
                        {saving ? t("saving") : t("save")}
                    </button>
                </div>
            </div>
        </div>
    );
}
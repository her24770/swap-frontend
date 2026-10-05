"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResenaUpdateInput, schemaResenaUpdate } from "../../../../../src/schemas/schemaResenas";
import { Star, X } from "lucide-react";
import { useTranslations } from "next-intl";
import "../../../users/UserCard/Comments/CommentForm/CommentForm.css";
import "../../Button/Button.css";
import "../Modal.css";
import "./EditCommentModal.css";

export type ResenaAction = "delete" | "edit";

export interface EditCommentData {
  contenido: string;
  calificacion: number;
}

interface EditCommentModalProps {
  isOpen: boolean;
  action: ResenaAction;
  comment: string;
  initialRating: number;
  loading?: boolean;
  error?: string | null;
  onAction: (data?: EditCommentData) => void | Promise<void>;
  onClose: () => void;
}

export default function EditCommentModal({
  isOpen,
  action,
  comment,
  initialRating,
  loading = false,
  error,
  onAction,
  onClose,
}: EditCommentModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const t = useTranslations("comments.actions");
  const tForm = useTranslations("comments.form");
  const tActions = useTranslations("common.actions");

  const [hoverRating, setHoverRating] = useState(0);
  const isEdit = action === "edit";

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<ResenaUpdateInput>({
    resolver: zodResolver(schemaResenaUpdate),
    mode: "onChange",
    defaultValues: {
      calificacion: initialRating,
      contenido: comment,
    },
  });

  const currentContent = watch("contenido") || "";

  useEffect(() => {
    if (isOpen) {
      reset({
        calificacion: initialRating,
        contenido: comment,
      });
      setHoverRating(0);
    }
  }, [comment, initialRating, isOpen, reset]);

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog?.open) dialog?.showModal?.();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const onSubmit = (data: ResenaUpdateInput) => {
    if (isEdit) {
      onAction({
        contenido: data.contenido.trim(),
        calificacion: data.calificacion,
      });
    } else {
      onAction();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="modal-overlay edit-comment-modal-overlay"
      onCancel={(event) => {
        event.preventDefault();
        if (!loading) onClose();
      }}
      onClick={loading ? undefined : onClose}
    >
      <form
        className="edit-comment-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-comment-modal-title"
        onSubmit={handleSubmit(onSubmit)}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="edit-comment-modal__header">
          <h2 id="edit-comment-modal-title" className="edit-comment-modal__title">
            {t(action)}
          </h2>
          <button
            type="button"
            className="edit-comment-modal__close"
            onClick={onClose}
            disabled={loading}
            aria-label={tActions("cancel")}
          >
            <X size={20} />
          </button>
        </div>

        {isEdit ? (
          <div className="edit-comment-modal__field">
            <Controller
              name="calificacion"
              control={control}
              render={({ field: { value, onChange } }) => (
                <div className="comment-form__stars-container">
                  <div className="comment-form__stars">
                    {Array.from({ length: 5 }).map((_, index) => {
                      const starValue = index + 1;
                      const isActive = (hoverRating || value) >= starValue;

                      return (
                        <button
                          key={starValue}
                          type="button"
                          className={`comment-form__star${isActive ? " comment-form__star--active" : ""}`}
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => onChange(starValue)}
                          disabled={loading}
                          aria-label={tForm("starsAria", { count: starValue })}
                        >
                          <Star size={24} fill={isActive ? "currentColor" : "none"} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            />

            <label className="edit-comment-modal__label" htmlFor="edit-comment-textarea">
              {t("editPrompt")}
            </label>
            <textarea
              id="edit-comment-textarea"
              className="edit-comment-modal__textarea"
              rows={5}
              disabled={loading}
              autoFocus
              {...register("contenido")}
            />
            <span className="edit-comment-modal__counter">{currentContent.length}/500</span>

            {errors.contenido && (
              <p className="edit-comment-modal__error" role="alert">
                {errors.contenido.message}
              </p>
            )}
            {errors.calificacion && (
              <p className="edit-comment-modal__error" role="alert">
                {errors.calificacion.message}
              </p>
            )}
          </div>
        ) : (
          <p className="edit-comment-modal__message">{t("deleteConfirm")}</p>
        )}

        {error && (
          <p className="edit-comment-modal__error" role="alert">
            {error}
          </p>
        )}

        <div className="edit-comment-modal__footer">
          <button
            type="button"
            className="button button--medium button--outline"
            onClick={onClose}
            disabled={loading}
          >
            {tActions("cancel")}
          </button>
          <button
            type="submit"
            className={`button button--medium${isEdit ? "" : " button--danger"}`}
            disabled={loading || (isEdit && (!isDirty || !isValid))}
          >
            {isEdit ? (loading ? tActions("saving") : tActions("save")) : t("delete")}
          </button>
        </div>
      </form>
    </dialog>
  );
}

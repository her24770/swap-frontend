"use client";

import { useTranslations } from "next-intl";
import { useUIStore } from "../../../store/uiStore";
import "./ConfirmDialog.css";

export default function ConfirmDialog() {
  const { confirm, cerrarConfirm } = useUIStore();
  const t = useTranslations("common.actions");

  if (!confirm.isOpen) return null;

  const handleConfirm = () => {
    confirm.onConfirm();
    cerrarConfirm();
  };

  return (
    <div className="confirm-dialog-overlay" onClick={cerrarConfirm}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="confirm-dialog__title">{confirm.titulo}</h3>
        <p className="confirm-dialog__message">{confirm.mensaje}</p>
        <div className="confirm-dialog__footer">
          <button type="button" className="confirm-dialog__btn-cancel" onClick={cerrarConfirm}>
            {t("cancel")}
          </button>
          <button type="button" className="confirm-dialog__btn-confirm button button--medium" onClick={handleConfirm}>
            {t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useTranslations } from "next-intl";
import { Pencil, Save, X, MousePointerClick, Eye } from "lucide-react";
import { InfoHint } from "../../ui/InfoHint/InfoHint";
import HorarioSemanal from "./Horario/Horario";
import { HorarioSkeleton } from "./Horario/HorarioSkeleton/HorarioSkeleton";
import type { useHorarioTutor } from "./useHorarioTutor";

interface HorarioSectionProps {
  horario: ReturnType<typeof useHorarioTutor>;
  canEdit: boolean;
}

// Sección del horario semanal del tutor.
export default function HorarioSection({ horario, canEdit }: HorarioSectionProps) {
  const t = useTranslations("perfil");
  const tCommon = useTranslations("common.actions");
  const {
    horarioSlots,
    horarioLoading,
    horarioError,
    horarioEditando,
    setHorarioEditando,
    horarioGuardando,
    cambiosPendientes,
    handleToggleHorario,
    handleCancelarHorario,
    handleGuardarHorario,
  } = horario;

  const horarioInfoItems = [
    { icon: <Pencil size={16} strokeWidth={2} />, label: t("hints.schedule.edit") },
    { icon: <MousePointerClick size={16} strokeWidth={2} />, label: t("hints.schedule.toggle") },
    { icon: <Save size={16} strokeWidth={2} />, label: t("hints.schedule.save") },
    { icon: <Eye size={16} strokeWidth={2} />, label: t("hints.schedule.visible") },
  ];

  return (
    <section className="perfil-page__section">
      <div className="perfil-page__catalog-bar">
        <h2 className="perfil-page__catalog-bar-title">{t("sections.schedule")}</h2>
        {canEdit && (
          <div className="perfil-page__catalog-bar-actions">
            {!horarioEditando && (
              <button
                type="button"
                className="perfil-page__new-publication-btn"
                onClick={() => setHorarioEditando(true)}
              >
                <Pencil size={18} strokeWidth={1.8} aria-hidden />
                {t('actions.editSchedule')}
              </button>
            )}
            {horarioEditando && (
              <div className="perfil-page__schedule-actions">
                <button
                  type="button"
                  className="perfil-page__secondary-btn"
                  onClick={handleCancelarHorario}
                  disabled={horarioGuardando}
                >
                  <X size={18} strokeWidth={1.8} aria-hidden />
                  {tCommon("cancel")}
                </button>
                <button
                  type="button"
                  className="perfil-page__new-publication-btn"
                  onClick={handleGuardarHorario}
                  disabled={horarioGuardando || cambiosPendientes.size === 0}
                >
                  <Save size={18} strokeWidth={1.8} aria-hidden />
                  {horarioGuardando ? tCommon("saving") : tCommon("saveChanges")}
                </button>
              </div>
            )}
            <InfoHint ariaLabel={t("hints.scheduleAria")} items={horarioInfoItems} />
          </div>
        )}
      </div>
      {horarioLoading && <HorarioSkeleton />}
      {horarioError && (
        <p className="perfil-page__coming-soon perfil-page__coming-soon--error">
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
  );
}

"use client";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Usuario } from "../../../types/usuario";
import "./TourBienvenida.css";

interface TourBienvenidaProps {
  usuario: Usuario | null;
  onSidebarNeedOpen: (need: boolean) => void;
}

type Placement = "right" | "bottom" | "bottom-end" | "left";

interface Step {
  target: string | null;
  placement?: Placement;
  titleKey: string;
  bodyKey: string;
}

const STEPS: Step[] = [
  { target: null, titleKey: "welcome.title", bodyKey: "welcome.body" },
  { target: "sidebar-descubre", placement: "right", titleKey: "sidebar.descubre.title", bodyKey: "sidebar.descubre.body" },
  { target: "sidebar-tutorias", placement: "right", titleKey: "sidebar.tutorias.title", bodyKey: "sidebar.tutorias.body" },
  { target: "sidebar-materiales", placement: "right", titleKey: "sidebar.materiales.title", bodyKey: "sidebar.materiales.body" },
  { target: "sidebar-negocios", placement: "right", titleKey: "sidebar.negocios.title", bodyKey: "sidebar.negocios.body" },
  { target: "sidebar-mensajes", placement: "right", titleKey: "sidebar.mensajes.title", bodyKey: "sidebar.mensajes.body" },
  { target: "navbar-menu", placement: "bottom", titleKey: "navbar.menu.title", bodyKey: "navbar.menu.body" },
  { target: "navbar-settings", placement: "bottom", titleKey: "navbar.settings.title", bodyKey: "navbar.settings.body" },
  { target: "navbar-notif", placement: "bottom", titleKey: "navbar.notifications.title", bodyKey: "navbar.notifications.body" },
  { target: "navbar-profile", placement: "bottom-end", titleKey: "navbar.profile.title", bodyKey: "navbar.profile.body" },
  { target: "fab-crear", placement: "left", titleKey: "fab.title", bodyKey: "fab.body" },
];

const STORAGE_PREFIX = "swap-onboarding-seen-";
const PAD = 8;

const MOSTRAR_TAMBIEN_EN_LOGIN_PARA_PRUEBAS = false; // true para desarrollo, false para producción

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function computePosition(rect: DOMRect, placement: Placement, size: { width: number; height: number }) {
  const margin = 18;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let top = 0;
  let left = 0;

  if (placement === "right") {
    left = rect.right + margin;
    top = rect.top + rect.height / 2 - size.height / 2;
  } else if (placement === "left") {
    left = rect.left - margin - size.width;
    top = rect.top + rect.height / 2 - size.height / 2;
  } else if (placement === "bottom-end") {
    top = rect.bottom + margin;
    left = rect.right - size.width;
  } else {
    top = rect.bottom + margin;
    left = rect.left + rect.width / 2 - size.width / 2;
  }

  return {
    top: clamp(top, 12, vh - size.height - 12),
    left: clamp(left, 12, vw - size.width - 12),
  };
}

export default function TourBienvenida({ usuario, onSidebarNeedOpen }: TourBienvenidaProps) {
  const t = useTranslations("onboarding");
  const searchParams = useSearchParams();
  const recienRegistrado = searchParams.get("registered") === "true";
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [tooltipSize, setTooltipSize] = useState({ width: 300, height: 160 });
  const cardRef = useRef<HTMLDivElement>(null);

  const step = STEPS[stepIndex];

  // Solo se muestra cuando esta recien registrado
  const puedeMostrarse = recienRegistrado || MOSTRAR_TAMBIEN_EN_LOGIN_PARA_PRUEBAS;

  useEffect(() => {
    if (!usuario || !puedeMostrarse) return;
    try {
      const seen = window.localStorage.getItem(`${STORAGE_PREFIX}${usuario.id_usuario}`);
      if (!seen) setActive(true);
    } catch {
    }
  }, [usuario, recienRegistrado]);

  useEffect(() => {
    if (!active) return;
    onSidebarNeedOpen(!!step.target?.startsWith("sidebar-"));
    return () => onSidebarNeedOpen(false);
  }, [active, step, onSidebarNeedOpen]);

  useEffect(() => {
    if (!active) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") finish();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useLayoutEffect(() => {
    if (!active || !step.target) {
      setRect(null);
      return;
    }
    function update() {
      const el = document.querySelector(`[data-tour="${step.target}"]`);//Busca el elemento del paso actual
      if (el) setRect(el.getBoundingClientRect());
    }
    update();
    const timeout = window.setTimeout(update, 320);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [active, stepIndex, step]);

  useLayoutEffect(() => {
    if (cardRef.current) {
      const box = cardRef.current.getBoundingClientRect();
      setTooltipSize({ width: box.width, height: box.height });
    }
  }, [stepIndex, active, rect]);

  if (!active || !usuario) return null;

  function finish() {
    try {
      window.localStorage.setItem(`${STORAGE_PREFIX}${usuario!.id_usuario}`, "1");
    } catch {
    }
    onSidebarNeedOpen(false);
    setActive(false);
  }

  function goNext() {
    if (stepIndex === STEPS.length - 1) {
      finish();
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  function goBack() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  const isWelcome = step.target === null;
  const isLast = stepIndex === STEPS.length - 1;
  const placement = step.placement ?? "bottom";
  const pos = !isWelcome && rect ? computePosition(rect, placement, tooltipSize) : null;

  let arrowSide: "left" | "right" | "top" = "top";
  let arrowStyle: CSSProperties = {};
  if (pos && rect) {
    if (placement === "right") {
      arrowSide = "left";
      arrowStyle = { top: clamp(rect.top + rect.height / 2 - pos.top, 20, tooltipSize.height - 20) };
    } else if (placement === "left") {
      arrowSide = "right";
      arrowStyle = { top: clamp(rect.top + rect.height / 2 - pos.top, 20, tooltipSize.height - 20) };
    } else {
      arrowSide = "top";
      arrowStyle = { left: clamp(rect.left + rect.width / 2 - pos.left, 20, tooltipSize.width - 20) };
    }
  }

  const card = (
    <div
      ref={cardRef}
      className={`onboarding-card ${isWelcome ? "onboarding-card--welcome" : "onboarding-card--floating"}`}
      style={!isWelcome && pos ? { top: pos.top, left: pos.left } : undefined}
    >
      {!isWelcome && pos && (
        <div className={`onboarding-card__arrow onboarding-card__arrow--${arrowSide}`} style={arrowStyle} />
      )}
      <button type="button" className="onboarding-card__close" onClick={finish} aria-label={t("controls.close")}>
        <X size={16} />
      </button>
      <h3 className="onboarding-card__title">
        {isWelcome ? t("welcome.title", { nombre: usuario.nombre }) : t(step.titleKey)}
      </h3>
      <p className="onboarding-card__body">{isWelcome ? t("welcome.body") : t(step.bodyKey)}</p>
      <div className="onboarding-card__footer">
        {isWelcome ? (
          <>
            <button type="button" className="onboarding-btn onboarding-btn--ghost" onClick={finish}>
              {t("welcome.skip")}
            </button>
            <button type="button" className="onboarding-btn onboarding-btn--primary" onClick={goNext}>
              {t("welcome.start")}
            </button>
          </>
        ) : (
          <>
            <span className="onboarding-card__progress">
              {t("controls.stepOf", { current: stepIndex, total: STEPS.length - 1 })}
            </span>
            <div className="onboarding-card__actions">
              {stepIndex > 1 && (
                <button type="button" className="onboarding-btn onboarding-btn--ghost" onClick={goBack}>
                  {t("controls.back")}
                </button>
              )}
              <button type="button" className="onboarding-btn onboarding-btn--primary" onClick={goNext}>
                {isLast ? t("controls.finish") : t("controls.next")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="onboarding-root" role="dialog" aria-modal="true">
      {isWelcome && <div className="onboarding-veil onboarding-veil--full onboarding-veil--center">{card}</div>}

      {!isWelcome && (
        <>
          {rect ? (
            <>
              <div
                className="onboarding-veil"
                style={{ top: 0, left: 0, right: 0, height: Math.max(rect.top - PAD, 0) }}
              />
              <div
                className="onboarding-veil"
                style={{ top: rect.bottom + PAD, left: 0, right: 0, bottom: 0 }}
              />
              <div
                className="onboarding-veil"
                style={{
                  top: Math.max(rect.top - PAD, 0),
                  left: 0,
                  width: Math.max(rect.left - PAD, 0),
                  height: rect.height + PAD * 2,
                }}
              />
              <div
                className="onboarding-veil"
                style={{
                  top: Math.max(rect.top - PAD, 0),
                  left: rect.right + PAD,
                  right: 0,
                  height: rect.height + PAD * 2,
                }}
              />
              <div
                className="onboarding-highlight"
                style={{
                  top: rect.top - PAD,
                  left: rect.left - PAD,
                  width: rect.width + PAD * 2,
                  height: rect.height + PAD * 2,
                }}
              />
            </>
          ) : (
            <div className="onboarding-veil onboarding-veil--full" />
          )}
          {card}
        </>
      )}
    </div>
  );
}

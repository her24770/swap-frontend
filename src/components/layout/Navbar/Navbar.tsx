"use client";
import { useState, useRef, useEffect } from "react";
import { Menu, UserCircle2, LogOut, Settings, Bell } from "lucide-react";
import { useTranslations, useLocale } from 'next-intl';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AUTH_ROUTES } from "../../../lib/authRoutes";
import { stripLocalePrefix } from '../../../i18n/pathname';
import { useAuth } from "../../../hooks/useAuth";
import {LogoCompleto} from "../../ui/Icono/Logo";
import SettingsModal from "../../ui/Modal/Settings/SettingsModal";
import NotificacionModal from "../../ui/Modal/NotificacionModal/NotificacionModal";
import type { NotificacionData } from "../../ui/Modal/NotificacionModal/Notificacion/Notificacion";
import { notificacionService, mapNotificacion, type NotificacionApi } from "../../../services/notificacionService";
import { useSocket } from "../../../hooks/useSocket";
import { MOCK_SOLICITUDES_TUTORIA } from "../../../mocks/solicitudesTutoria";
import "./Navbar.css";

interface NavbarProps {
  onMenuToggle: () => void;
  menuButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

export default function Navbar({ onMenuToggle, menuButtonRef }: NavbarProps) {
  const t = useTranslations('layout.navbar');
  const locale = useLocale();

  const [profileOpen, setProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifWrapperRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const bellRef = useRef<HTMLButtonElement>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState<NotificacionData[]>([]);
  const socket = useSocket();
  const [solicitudesTutoria, setSolicitudesTutoria] = useState(MOCK_SOLICITUDES_TUTORIA);

  useEffect(() => {
    if (!notifOpen) return;
    notificacionService.getAll()
      .then(setNotificaciones)
      .catch(() => {});
  }, [notifOpen]);

  // Notificaciones en tiempo real (SWAP-334): el backend emite "notificacion:nueva"
  // cuando llega un mensaje nuevo (ver crearMensajeYNotificar en el backend).
  useEffect(() => {
    function alRecibirNotificacion(notificacion: NotificacionApi) {
      setNotificaciones((prev) => {
        if (prev.some((n) => n.id === notificacion.id_notificacion)) return prev;
        return [mapNotificacion(notificacion), ...prev];
      });
    }

    socket.on("notificacion:nueva", alRecibirNotificacion);
    return () => {
      socket.off("notificacion:nueva", alRecibirNotificacion);
    };
  }, [socket]);

  const pathnameWithoutLocale = stripLocalePrefix(pathname);
  const isAuthRoute = AUTH_ROUTES.includes(pathnameWithoutLocale);

  const unreadCount =
    notificaciones.filter((n) => !n.leida).length + solicitudesTutoria.length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (dropdownRef.current?.contains(target)) return;
      setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setNotifOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const toggleNotificaciones = () => {
    setProfileOpen(false);
    setNotifOpen((open) => !open);
  };

  return (
    <header className="navbar">
      <div className="navbar__left">
        {!isAuthRoute && (
          <button
            ref={menuButtonRef}
            onClick={onMenuToggle}
            aria-label={t('ariaToggleMenu')}
            type="button"
            data-tour="navbar-menu"
            className="navbar__menu-btn"
          >
            <Menu size={28} strokeWidth={2} />
          </button>
        )}
        <Link href="/" className="navbar__logo-link" aria-label="Ir a descubre" title="Ir a descubre">
          <LogoCompleto className="navbar__logo"/>
        </Link>
      </div>

      <div className="navbar__right">
        {!isAuthRoute && (
          <>
            <button
              onClick={() => {
                setNotifOpen(false);
                setIsSettingsOpen(true);
              }}
              aria-label="Abrir configuraciones"
              type="button"
              title="Configuraciones"
              data-tour="navbar-settings"
              className="navbar__menu-btn"
            >
              <Settings size={25} strokeWidth={2} />
            </button>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            <div ref={notifWrapperRef} className="navbar__notif">
              <button
                ref={bellRef}
                onClick={toggleNotificaciones}
                aria-label="Abrir notificaciones"
                aria-expanded={notifOpen}
                type="button"
                title="Notificaciones"
                data-tour="navbar-notif"
                className="navbar__menu-btn navbar__menu-btn--bell"
              >
                <Bell size={25} strokeWidth={2} />
                {unreadCount > 0 && (
                  <span className="navbar__notif-badge" aria-hidden>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              <NotificacionModal
                isOpen={notifOpen}
                onClose={() => setNotifOpen(false)}
                anchorRef={bellRef}
                notificaciones={notificaciones}
                solicitudesTutoria={solicitudesTutoria}
                onDismiss={(id) =>
                  setNotificaciones((prev) => prev.filter((n) => n.id !== id))
                }
                onAceptarSolicitud={(id) =>
                  setSolicitudesTutoria((prev) => prev.filter((solicitud) => solicitud.id !== id))
                }
                onRechazarSolicitud={(id) =>
                  setSolicitudesTutoria((prev) => prev.filter((solicitud) => solicitud.id !== id))
                }
                onMarcarLeida={(id) => {
                  setNotificaciones((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, leida: true } : n)),
                  );
                  notificacionService.marcarLeida(id).catch(() => {});
                }}
                onAbrirChat={() => {
                  setNotifOpen(false);
                  router.push(`/${locale}/Chat`);
                }}
                onMarcarTodasLeidas={() => {
                  const idsNoLeidas = notificaciones.filter((n) => !n.leida).map((n) => n.id);
                  setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
                  notificacionService.marcarVariasLeidas(idsNoLeidas).catch(() => {});
                }}
              />
            </div>

            <div ref={dropdownRef} className="navbar__profile">
              <button
                aria-label={t('ariaUserProfile')}
                type="button"
                title= "Perfil"
                onClick={() => {
                  setNotifOpen(false);
                  setProfileOpen((prev) => !prev);
                }}
                data-tour="navbar-profile"
                className="navbar__profile-btn"
              >
                <UserCircle2 size={28} strokeWidth={1.5} />
              </button>

              {profileOpen && (
                <div className="navbar__dropdown">
                  <Link
                    href="/perfil"
                    onClick={() => setProfileOpen(false)}
                    title={t('viewProfile')}
                    className="navbar__dropdown-item"
                  >
                    <UserCircle2 size={16} className="navbar__dropdown-icon" />
                    {t('viewProfile')}
                  </Link>
                  <div className="navbar__dropdown-divider" />
                  <button
                    type="button"
                    title="Cerrar sesión"
                    onClick={logout}
                    className="navbar__dropdown-item navbar__dropdown-item--danger"
                  >
                    <LogOut size={16} />
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}

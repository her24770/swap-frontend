"use client";
import { useRef, useState, useEffect } from "react";
import { Menu, UserCircle2, LogOut, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "../../../i18n/routing";
import { useModeradorSesion } from "../../../hooks/useModeradorSesion";
import { LogoCompleto } from "../../ui/Icono/Logo";
import SettingsModal from "../../ui/Modal/Settings/SettingsModal";
import "./Navbar.css";

interface NavbarModeradorProps {
  onMenuToggle: () => void;
  menuButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

export default function NavbarModerador({ onMenuToggle, menuButtonRef }: NavbarModeradorProps) {
  const t = useTranslations("layout.navbar");
  const tPanel = useTranslations("moderacion.panel");

  const [profileOpen, setProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { moderador, logout } = useModeradorSesion();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (dropdownRef.current?.contains(target)) return;
      setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    router.replace("/moderacion/login");
  };

  return (
    <header className="navbar">
      <div className="navbar__left">
        <button
          ref={menuButtonRef}
          onClick={onMenuToggle}
          aria-label={t("ariaToggleMenu")}
          type="button"
          className="navbar__menu-btn"
        >
          <Menu size={28} strokeWidth={2} />
        </button>
        <Link href="/moderacion" className="navbar__logo-link" aria-label="Ir al panel de moderación" title="Ir al panel de moderación">
          <LogoCompleto className="navbar__logo" />
        </Link>
      </div>

      <div className="navbar__right">
        <button
          onClick={() => setIsSettingsOpen(true)}
          aria-label="Abrir configuraciones"
          type="button"
          title="Configuraciones"
          className="navbar__menu-btn"
        >
          <Settings size={25} strokeWidth={2} />
        </button>

        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

        {moderador && (
          <div ref={dropdownRef} className="navbar__profile">
            <button
              aria-label={t("ariaUserProfile")}
              type="button"
              title={moderador.usuario}
              onClick={() => setProfileOpen((prev) => !prev)}
              className="navbar__profile-btn"
            >
              <UserCircle2 size={28} strokeWidth={1.5} />
            </button>

            {profileOpen && (
              <div className="navbar__dropdown">
                <div className="navbar__dropdown-header">
                  <span className="navbar__dropdown-usuario">{moderador.usuario}</span>
                  <span className={`navbar__dropdown-nivel navbar__dropdown-nivel--${moderador.nivel}`}>
                    {moderador.nivel === "superadmin" ? tPanel("nivelSuperadmin") : tPanel("nivelModerador")}
                  </span>
                </div>
                <div className="navbar__dropdown-divider" />
                <button
                  type="button"
                  title={tPanel("logout")}
                  onClick={handleLogout}
                  className="navbar__dropdown-item navbar__dropdown-item--danger"
                >
                  <LogOut size={16} />
                  {tPanel("logout")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

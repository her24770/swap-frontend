"use client";
import { useState, useRef, useEffect } from "react";
import { Menu, UserCircle2, LogOut, Settings } from "lucide-react";
import { useTranslations } from 'next-intl';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AUTH_ROUTES } from "../../../lib/authRoutes";
import { stripLocalePrefix } from '../../../i18n/pathname';
import { useAuth } from "../../../hooks/useAuth";
import {LogoCompleto} from "../../ui/Icono/Logo";
import SettingsModal from "../../ui/Modal/Settings/SettingsModal";
import "./Navbar.css";

interface NavbarProps {
  onMenuToggle: () => void;
  menuButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

export default function Navbar({ onMenuToggle, menuButtonRef }: NavbarProps) {
  const t = useTranslations('layout.navbar');

  const [profileOpen, setProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { logout, usuario } = useAuth();
  
  const pathnameWithoutLocale = stripLocalePrefix(pathname);
  const isAuthRoute = AUTH_ROUTES.includes(pathnameWithoutLocale);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="navbar">
      <div className="navbar__left">
        {/* Botón de menú SOLO si NO es auth route */}
        {!isAuthRoute && (
          <button
            ref={menuButtonRef}
            onClick={onMenuToggle}
            aria-label={t('ariaToggleMenu')}
            type="button"
            className="navbar__menu-btn"
          >
            <Menu size={28} strokeWidth={2} />
          </button>
        )}
        <Link href="/" className="navbar__logo-link" aria-label="Ir a descubre">
          <LogoCompleto className="navbar__logo"/>
        </Link>
      </div>
      <div className="navbar__left">
        {!isAuthRoute && (
          <>
            <button
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Abrir configuraciones"
              type="button"
              className="navbar__menu-btn"
            >
              <Settings size={25} strokeWidth={2} />
            </button>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
          </>
        )}
        {/* Perfil/USER SOLO si NO es auth route */}
        {!isAuthRoute && (
          <div ref={dropdownRef} className="navbar__profile">
            <button
              aria-label={t('ariaUserProfile')}
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="navbar__profile-btn"
            >
              <UserCircle2 size={28} strokeWidth={1.5} />
            </button>

            {profileOpen && (
              <div className="navbar__dropdown">
                <Link
                  href="/perfil"
                  onClick={() => setProfileOpen(false)}
                  className="navbar__dropdown-item"
                >
                  <UserCircle2 size={16} className="navbar__dropdown-icon" />
                  {t('viewProfile')}
                </Link>
                <div className="navbar__dropdown-divider" />
                <button
                  type="button"
                  onClick={logout}
                  className="navbar__dropdown-item navbar__dropdown-item--danger"
                >
                  <LogOut size={16} />
                  {t('logout')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

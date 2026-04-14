"use client";
import { useState, useRef, useEffect } from "react";
import { Menu, UserCircle2, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AUTH_ROUTES } from "../../../lib/authRoutes";
import "./Navbar.css";

interface NavbarProps {
  onMenuToggle: () => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isAuthRoute = AUTH_ROUTES.includes(pathname);

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
            onClick={onMenuToggle}
            aria-label="Toggle menu"
            type="button"
            className="navbar__menu-btn"
          >
            <Menu size={20} strokeWidth={2} />
          </button>
        )}
        <span className="navbar__logo">SWAP</span>
      </div>

      {/* Perfil/USER SOLO si NO es auth route */}
      {!isAuthRoute && (
        <div ref={dropdownRef} className="navbar__profile">
          <button
            aria-label="User profile"
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="navbar__profile-btn"
          >
            <UserCircle2 size={28} strokeWidth={1.5} />
          </button>

          {profileOpen && (
            <div className="navbar__dropdown">
              <Link
                href="/profile"
                onClick={() => setProfileOpen(false)}
                className="navbar__dropdown-item"
              >
                <UserCircle2 size={16} className="navbar__dropdown-icon" />
                Ver perfil
              </Link>
              <div className="navbar__dropdown-divider" />
              <button
                type="button"
                className="navbar__dropdown-item navbar__dropdown-item--danger"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
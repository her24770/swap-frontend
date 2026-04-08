"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, UserCircle2, LogOut } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
  onMenuToggle: () => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cierra el dropdown si se hace click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    // TODO: lógica de cierre de sesión
    console.log("Cerrar sesión");
  };

  return (
    <header className="py-3 bg-[#006b2d] flex items-center justify-between px-3 shrink-0 relative">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuToggle}
          aria-label="Toggle menu"
          type="button"
          className="flex items-center justify-center text-white p-1 rounded-md hover:bg-white/10 transition-colors"
        >
          <Menu size={20} strokeWidth={2} />
        </button>
        <span className="text-white font-bold text-3xl tracking-wide">
          SWAP
        </span>
      </div>

      {/* Button y dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          aria-label="User profile"
          type="button"
          onClick={() => setProfileOpen((prev) => !prev)}
          className="flex items-center justify-center text-white p-0.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <UserCircle2 size={28} strokeWidth={1.5} />
        </button>

        {/* Dropdown */}
        {profileOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50">
            <Link
              href="/profile"
              onClick={() => setProfileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <UserCircle2 size={16} className="text-[#006b2d]" />
              Ver perfil
            </Link>

            <div className="border-t border-gray-100" />

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
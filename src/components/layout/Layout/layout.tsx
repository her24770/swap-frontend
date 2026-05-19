"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import { AUTH_ROUTES } from "../../../lib/authRoutes";
import { stripLocalePrefix } from '../../../i18n/pathname';
import "./layout.css";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const pathnameWithoutLocale = stripLocalePrefix(pathname);

  const isAuthRoute = AUTH_ROUTES.includes(pathnameWithoutLocale);

  useEffect(() => {
    if (!sidebarOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedSidebar = sidebarRef.current?.contains(target);
      const clickedMenuButton = menuButtonRef.current?.contains(target);

      if (!clickedSidebar && !clickedMenuButton) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="layout">
      {/* Navbar*/}
      <Navbar
        menuButtonRef={menuButtonRef}
        onMenuToggle={() => setSidebarOpen((prev) => !prev)}
      />
      
      <div className="layout__body">
        {/* Sidebar solo visible en rutas no auth */}
        {!isAuthRoute && <Sidebar ref={sidebarRef} isOpen={sidebarOpen} />}
        
        {/* Main content con clase condicional */}
        <main className={isAuthRoute ? "layout__main--auth" : "layout__main"}>
          {children}
        </main>
      </div>
    </div>
  );
}

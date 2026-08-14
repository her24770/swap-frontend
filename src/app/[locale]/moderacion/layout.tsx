"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "../../../i18n/routing";
import { stripLocalePrefix } from "../../../i18n/pathname";
import { useModeradorSesion } from "../../../hooks/useModeradorSesion";
import NavbarModerador from "../../../components/layout/Navbar/NavbarModerador";
import Sidebar from "../../../components/layout/Sidebar/Sidebar";
import "../../../components/layout/Layout/layout.css";
import "./ModeracionLayout.css";

interface ModeracionLayoutProps {
  children: React.ReactNode;
}

export default function ModeracionLayout({ children }: ModeracionLayoutProps) {
  const t = useTranslations("moderacion.panel");
  const pathname = usePathname();
  const pathnameWithoutLocale = stripLocalePrefix(pathname);
  const esLogin = pathnameWithoutLocale === "/moderacion/login";

  const { moderador, error, cargando } = useModeradorSesion({ enabled: !esLogin });
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!esLogin && !cargando && !moderador) {
      router.replace("/moderacion/login");
    }
  }, [esLogin, cargando, moderador, router]);

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

  if (esLogin) {
    return <>{children}</>;
  }

  if (cargando) {
    return <div className="moderacion-layout__loading">{t("loading")}</div>;
  }

  if (!moderador) {
    return null;
  }

  return (
    <div className="layout">
      <NavbarModerador
        menuButtonRef={menuButtonRef}
        onMenuToggle={() => setSidebarOpen((prev) => !prev)}
      />
      <div className="layout__body">
        <Sidebar ref={sidebarRef} isOpen={sidebarOpen} variant="moderador" moderadorNivel={moderador.nivel} />
        <main className="layout__main">
          {error && <p className="moderacion-layout__error">{error}</p>}
          {children}
        </main>
      </div>
    </div>
  );
}

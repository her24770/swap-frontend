"use client";
import { useState } from "react";
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
  const pathname = usePathname();
  const pathnameWithoutLocale = stripLocalePrefix(pathname);

  const isAuthRoute = AUTH_ROUTES.includes(pathnameWithoutLocale);

  return (
    <div className="layout">
      {/* Navbar*/}
      <Navbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
      
      <div className="layout__body">
        {/* Sidebar solo visible en rutas no auth */}
        {!isAuthRoute && <Sidebar isOpen={sidebarOpen} />}
        
        {/* Main content con clase condicional */}
        <main className={isAuthRoute ? "layout__main--auth" : "layout__main"}>
          {children}
        </main>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // si es pagina login, no mostrar navbar ni sidebar
  const isLoginPage = pathname === "/login";
  if (isLoginPage) {
    return <main>{children}</main>;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Navbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />
        <main className="flex-1 bg-white overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
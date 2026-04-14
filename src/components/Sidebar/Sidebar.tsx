"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, BookOpen, Package, Briefcase } from "lucide-react";
import { AUTH_ROUTES } from "../../lib/authRoutes";
import "./Sidebar.css";

const NAV_ITEMS = [
  { icon: Compass,   label: "Descubre",   href: "/descubre"   },
  { icon: BookOpen,  label: "Tutorías",   href: "/tutorias"   },
  { icon: Package,   label: "Materiales", href: "/materiales" },
  { icon: Briefcase, label: "Negocios",   href: "/negocios"   },
] as const;

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();

  if (AUTH_ROUTES.includes(pathname)) return null;

  return (
    <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar__link ${isActive ? "sidebar__link--active" : ""}`}
            >
              <span className="sidebar__icon">
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <span className="sidebar__label">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
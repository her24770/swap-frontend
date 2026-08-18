"use client";
import { forwardRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, BookOpen, Package, Briefcase, MessageCircle, Newspaper, ShieldAlert, Users } from "lucide-react";
import { useTranslations } from 'next-intl';
import { AUTH_ROUTES } from "../../../lib/authRoutes";
import { stripLocalePrefix } from '../../../i18n/pathname';
import { tienePermiso } from "../../../lib/moderadorPermisos";
import type { NivelModerador } from "../../../types/moderador";
import "./Sidebar.css";

interface SidebarProps {
  isOpen: boolean;
  variant?: "usuario" | "moderador";
  moderadorNivel?: NivelModerador;
}

const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  { isOpen, variant = "usuario", moderadorNivel },
  ref
) {
  const t = useTranslations('layout.sidebar');
  const tPanel = useTranslations('moderacion.panel');
  const pathname = usePathname();
  const pathnameWithoutLocale = stripLocalePrefix(pathname);

  if (variant === "usuario" && AUTH_ROUTES.includes(pathnameWithoutLocale)) return null;

  const navItems = variant === "moderador"
    ? [
        { icon: Compass, label: t('descubre'), href: '/moderacion/descubre', tour: undefined as string | undefined },
        { icon: Newspaper, label: tPanel('sections.publicaciones.title'), href: '/moderacion/publicaciones', tour: undefined as string | undefined },
        { icon: ShieldAlert, label: tPanel('sections.reportes.title'), href: '/moderacion/reportes', tour: undefined as string | undefined },
        ...(tienePermiso(moderadorNivel ?? null, "superadmin")
          ? [{ icon: Users, label: tPanel('sections.moderadores.title'), href: '/moderacion/moderadores', tour: undefined as string | undefined }]
          : []),
      ]
    : [
        { icon: Compass, label: t('descubre'), href: '/', tour: 'sidebar-descubre' },
        { icon: BookOpen, label: t('tutorias'), href: '/tutorias', tour: 'sidebar-tutorias' },
        { icon: Package, label: t('materiales'), href: '/materiales', tour: 'sidebar-materiales' },
        { icon: Briefcase, label: t('negocios'), href: '/negocios', tour: 'sidebar-negocios' },
        { icon: MessageCircle, label: t('mensajes'), href: '/Chat', tour: 'sidebar-mensajes' },
      ];

  return (
    <aside ref={ref} className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
      <nav className="sidebar__nav">
        {/* Grupo superior de links */}
        <div className="sidebar__menu">
          {navItems.map(({ icon: Icon, label, href, tour }) => {
            const isActive = href === '/' ? pathnameWithoutLocale === '/' : pathnameWithoutLocale.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                data-tour={tour}
                className={`sidebar__link ${isActive ? "sidebar__link--active" : ""}`}
              >
                <span className="sidebar__icon">
                  <Icon size={18} strokeWidth={1.8} />
                </span>
                <span className="sidebar__label">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
});

export default Sidebar;

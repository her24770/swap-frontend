"use client";
import { forwardRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Compass, BookOpen, Package, Briefcase, MessageCircle } from "lucide-react";
import { useTranslations } from 'next-intl';
import { AUTH_ROUTES } from "../../../lib/authRoutes";
import { stripLocalePrefix } from '../../../i18n/pathname';
import "./Sidebar.css";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar({ isOpen }, ref) {  
  const t = useTranslations('layout.sidebar');
  const pathname = usePathname();
  const pathnameWithoutLocale = stripLocalePrefix(pathname);

  if (AUTH_ROUTES.includes(pathnameWithoutLocale)) return null;

  const navItems = [
    { icon: Compass, label: t('descubre'), href: '/' },
    { icon: BookOpen, label: t('tutorias'), href: '/tutorias' },
    { icon: Package, label: t('materiales'), href: '/materiales' },
    { icon: Briefcase, label: t('negocios'), href: '/negocios' },
    { icon: MessageCircle, label: t('mensajes'), href: '/Chat' },
  ] as const;

  return (
    <aside ref={ref} className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
      <nav className="sidebar__nav">
        {/* Grupo superior de links */}
        <div className="sidebar__menu">
          {navItems.map(({ icon: Icon, label, href }) => {
            const isActive = href === '/' ? pathnameWithoutLocale === '/' : pathnameWithoutLocale.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={label}
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

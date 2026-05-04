"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, BookOpen, Package, Briefcase } from "lucide-react";
import { useTranslations } from 'next-intl';
import { AUTH_ROUTES } from "../../../lib/authRoutes";
import { stripLocalePrefix } from '../../../i18n/pathname';
import "./Sidebar.css";

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const t = useTranslations('layout.sidebar');
  const pathname = usePathname();
  const pathnameWithoutLocale = stripLocalePrefix(pathname);

  if (AUTH_ROUTES.includes(pathnameWithoutLocale)) return null;

  const navItems = [
    { icon: Compass, label: t('descubre'), href: '/' },
    { icon: BookOpen, label: t('tutorias'), href: '/tutorias' },
    { icon: Package, label: t('materiales'), href: '/materiales' },
    { icon: Briefcase, label: t('negocios'), href: '/negocios' },
  ] as const;

  return (
    <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
      <nav className="sidebar__nav">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = href === '/' ? pathnameWithoutLocale === '/' : pathnameWithoutLocale.startsWith(href);
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
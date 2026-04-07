import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, BookOpen, Package, Briefcase } from "lucide-react";
import clsx from "clsx";
import styles from "./Sidebar.module.css";

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

  return (
    <aside
      className={clsx(
        styles.sidebar,
        "bg-[#006b2d] flex flex-col h-full shrink-0 overflow-hidden transition-all duration-300 ease-in-out",
        isOpen ? ["w-44", styles.open] : "w-14"
      )}
    >
      <nav className="flex flex-col gap-1 px-2 pt-3">
        {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-2 py-2 rounded-md text-white text-sm font-medium whitespace-nowrap transition-colors hover:bg-white/10",
                isActive && "underline underline-offset-2"
              )}
            >
              <span className="shrink-0 w-[18px] h-[18px] flex items-center justify-center">
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <span
                className={clsx(
                  styles.label,
                  "overflow-hidden max-w-0 opacity-0 transition-all duration-300"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
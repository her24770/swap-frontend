import { Menu, UserCircle2 } from "lucide-react";

interface NavbarProps {
  onMenuToggle: () => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  return (
    <header className="py-3 bg-[#006b2d] flex items-center justify-between px-3 shrink-0">
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

      <button
        aria-label="User profile"
        type="button"
        className="flex items-center justify-center text-white p-0.5 rounded-full hover:bg-white/10 transition-colors"
      >
        <UserCircle2 size={28} strokeWidth={1.5} />
      </button>
    </header>
  );
}
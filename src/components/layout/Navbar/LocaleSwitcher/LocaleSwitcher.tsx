'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from '../../../../i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { Check, ChevronDown } from 'lucide-react';

import './LocaleSwitcher.css';

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('locales');

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleSelect = (nextLocale: string) => {
    setOpen(false);
    if (nextLocale !== locale) router.replace(pathname, { locale: nextLocale });
  };

  const renderOption = (code: string) => {
    const selected = code === locale;
    return (
      <li key={code} role="option" aria-selected={selected}>
        <button
          type="button"
          className={`locale-switcher__option${selected ? ' locale-switcher__option--selected' : ''}`}
          onClick={() => handleSelect(code)}
        >
          <span>{t(code)}</span>
          {selected && <Check size={15} className="locale-switcher__check" />}
        </button>
      </li>
    );
  };

  return (
    <div className="locale-switcher" ref={wrapperRef}>
      <button
        type="button"
        className={`locale-switcher__trigger${open ? ' locale-switcher__trigger--open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="locale-switcher__value">{t(locale)}</span>
        <ChevronDown
          size={16}
          className={`locale-switcher__chevron${open ? ' locale-switcher__chevron--open' : ''}`}
        />
      </button>

      {open && (
        <ul className="locale-switcher__menu" role="listbox">
          {renderOption('es')}
          {renderOption('en')}
          {renderOption('fr')}
        </ul>
      )}
    </div>
  );
}

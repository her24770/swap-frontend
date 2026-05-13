'use client';

import { useRouter, usePathname } from '../../../../i18n/routing'; 
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';

import './LocaleSwitcher.css';

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('locales');

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value;
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <div className="locale-switcher">
      <select
        id="language-select"
        defaultValue={locale}
        onChange={handleLanguageChange}
        className="locale-switcher__select"
      >
        <option value="es">{t('es')}</option>
        <option value="en">{t('en')}</option>
        <option value="fr">{t('fr')}</option>
      </select>
    </div>
  );
}
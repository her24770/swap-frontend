"use client";
import { useTranslations } from 'next-intl';
import "./SearchBar.css";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder,
}: SearchBarProps) {
  const t = useTranslations('common.search');
  const resolvedPlaceholder = placeholder ?? t('placeholder');

  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-bar__input"
        placeholder={resolvedPlaceholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
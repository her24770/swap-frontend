"use client"

import { useTranslations } from "next-intl"
import { Search } from "lucide-react"
import "./SearchContactsBar.css"

export interface SearchContactsBarProps {
    onSearch?: (query: string) => void
    placeholder?: string
}

export default function SearchContactsBar({ onSearch, placeholder }: SearchContactsBarProps) {
    const t = useTranslations("common.search")

    return (
        <div className="search-contacts-bar">
            <div className="search-contacts-bar__field">
                <input
                    type="text"
                    className="search-contacts-bar__input"
                    placeholder={placeholder ?? t("placeholder")}
                    onChange={(event) => onSearch?.(event.target.value)}
                />
                <Search size={18} className="search-contacts-bar__icon" />
            </div>
        </div>
    )
}

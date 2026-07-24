"use client"

import { useTranslations } from "next-intl"
import "./SearchContactsBar.css"
import { Search } from "lucide-react"



export default function SearchContactsBar() {
    const t = useTranslations("common.search")

    return (
        <div className="search-contacts-bar">
        <div className="search-contacts-bar__field">
            <input
            type="text"
            className="search-contacts-bar__input"
            placeholder={t("placeholder")}
            />
            <Search size={18} className="search-contacts-bar__icon" />
        </div>
        </div>
    );
}

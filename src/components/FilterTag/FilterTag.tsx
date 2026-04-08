"use client";

interface FilterTagProps {
    label: string;
    onClick: () => void;
}

export default function FilterTag({ label, onClick }: FilterTagProps) {
    return (
        <button type="button" className="filter-tag" onClick={onClick}>
            <span className="filter-tag__label">{label}</span>
        </button>
    );
}
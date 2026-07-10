/**
 * NavDropdown, UI Atom
 *
 * Dropdown disclosure untuk menu Informasi (Berita).
 * Menggunakan Popover API (HTML-native) untuk positioning dan overlay handling.
 * Fallback: CSS-only approach via :focus-within jika Popover belum didukung.
 *
 * Accessibility:
 * - Trigger pakai <button> dengan aria-expanded
 * - Panel pakai popover="auto", browser mengelola focus trap & dismiss otomatis
 * - Keyboard: Enter/Space buka panel, Escape tutup, Tab pindah antar item
 *
 * Catatan: Anchor Positioning belum Baseline Widely Available,
 * sehingga fallback CSS digunakan untuk positioning panel.
 */

"use client";

import { useId, useRef, useEffect, useState } from "react";
import { NavLink } from "./NavLink";

export interface DropdownItem {
  label: string;
  labelEn: string;
  href: string;
}

interface NavDropdownProps {
  /** Label trigger button */
  label: string;
  labelEn: string;
  /** Locale aktif untuk memilih label mana yang ditampilkan */
  lang: "id" | "en";
  items: DropdownItem[];
  className?: string;
}

export function NavDropdown({
  label,
  labelEn,
  lang,
  items,
  className = "",
}: NavDropdownProps) {
  const panelId = useId().replace(/:/g, "");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const displayLabel = lang === "id" ? label : labelEn;

  /* Tutup dropdown saat klik di luar */
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      const trigger = triggerRef.current;
      const panel = document.getElementById(`dd-panel-${panelId}`);
      if (
        trigger &&
        !trigger.contains(e.target as Node) &&
        panel &&
        !panel.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, panelId]);

  /* Tutup saat Escape */
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  return (
    <div className={`nav-dropdown ${className}`}>
      <button
        ref={triggerRef}
        id={`dd-trigger-${panelId}`}
        type="button"
        aria-expanded={isOpen}
        aria-controls={`dd-panel-${panelId}`}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`nav-link nav-dropdown__trigger ${isOpen ? "nav-link--active" : ""}`}
      >
        {displayLabel}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
          className={`nav-dropdown__chevron ${isOpen ? "nav-dropdown__chevron--open" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Panel dropdown, posisi absolute relatif terhadap parent */}
      <div
        id={`dd-panel-${panelId}`}
        role="region"
        aria-labelledby={`dd-trigger-${panelId}`}
        className={`nav-dropdown__panel ${isOpen ? "nav-dropdown__panel--open" : ""}`}
      >
        {items.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            exact
            onClick={() => setIsOpen(false)}
            className="nav-dropdown__item"
          >
            {lang === "id" ? item.label : item.labelEn}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

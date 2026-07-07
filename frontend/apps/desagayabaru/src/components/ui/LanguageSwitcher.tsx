"use client";

import { useId } from "react";

export type Locale = "id" | "en";

interface LanguageSwitcherProps {
  lang: Locale;
  onChange: (lang: Locale) => void;
  className?: string;
}

const LOCALES: { value: Locale; label: string }[] = [
  { value: "id", label: "ID" },
  { value: "en", label: "EN" },
];

export function LanguageSwitcher({
  lang,
  onChange,
  className = "",
}: LanguageSwitcherProps) {
  const groupId = useId();

  return (
    <fieldset
      aria-label="Pilih bahasa / Select language"
      className={`inline-flex items-center gap-0.5 rounded-full border border-outline-variant bg-surface-container-low p-[3px] ${className}`}
    >
      <legend className="sr-only">Bahasa</legend>
      {LOCALES.map(({ value, label }) => {
        const active = lang === value;
        return (
          <label
            key={value}
            htmlFor={`${groupId}-${value}`}
            className={`inline-flex min-w-8 cursor-pointer select-none items-center justify-center rounded-full px-2.5 py-0.5 font-body text-[0.6875rem] font-bold tracking-wide leading-6 motion-safe:transition-colors motion-safe:duration-150 ${
              active
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <input
              id={`${groupId}-${value}`}
              type="radio"
              name={`${groupId}-lang`}
              value={value}
              checked={active}
              onChange={() => onChange(value)}
              className="sr-only"
            />
            {label}
          </label>
        );
      })}
    </fieldset>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Locale } from "@/components/ui/LanguageSwitcher";
import { ProfileIcon } from "@/components/ui/ProfileIcon";

/* ─────────────────────────────────────────────
   Data navigasi
   ───────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: "Beranda", labelEn: "Home", href: "/", exact: true },
  { label: "Wisata", labelEn: "Tourism", href: "/wisata", exact: false },
  { label: "Profil", labelEn: "Profile", href: "/profil", exact: false },
  { label: "Peta", labelEn: "Map", href: "/peta", exact: false },
  { label: "Galeri", labelEn: "Gallery", href: "/galeri", exact: false },
] as const;

const INFORMASI_ITEMS = [
  { label: "Berita", labelEn: "News", href: "/informasi/berita" },
  { label: "UMKM", labelEn: "SMEs", href: "/informasi/umkm" },
];

/* ─────────────────────────────────────────────
   Hooks
   ───────────────────────────────────────────── */
function useLang() {
  const [lang] = useState<Locale>("id");
  return { lang };
}

/* ─────────────────────────────────────────────
   NavItem — slide-up hover animation
   Two spans: primary keluar ke atas, ghost masuk dari bawah.
   ───────────────────────────────────────────── */
interface NavItemProps {
  href: string;
  label: string;
  exact?: boolean;
  onClick?: () => void;
  /** varian mobile: teks lebih besar, block full-width */
  mobile?: boolean;
}

function NavItem({
  href,
  label,
  exact = false,
  onClick,
  mobile = false,
}: NavItemProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  const size = mobile
    ? "h-8 text-xl leading-8 px-4 w-full justify-center"
    : "h-6 text-sm leading-6 px-2.5";

  const state = isActive
    ? "text-primary! font-bold"
    : "text-on-surface-variant font-medium hover:text-on-surface";

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`group relative inline-flex items-start overflow-hidden rounded whitespace-nowrap no-underline motion-safe:transition-colors motion-safe:duration-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${size} ${state}`}
    >
      {/* Teks utama — keluar ke atas saat hover */}
      <span
        aria-hidden={isActive}
        className={`pointer-events-none block motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:-translate-y-full ${
          mobile ? "leading-8" : "leading-6"
        }`}
      >
        {label}
      </span>
      {/* Teks bayangan — masuk dari bawah */}
      <span
        aria-hidden
        className={`pointer-events-none absolute top-full block motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:-translate-y-full ${
          mobile ? "left-4 leading-8" : "left-2.5 leading-6"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

/* ─────────────────────────────────────────────
   DropdownNav — menu Informasi
   ───────────────────────────────────────────── */
interface DropdownNavProps {
  label: string;
  items: { label: string; labelEn: string; href: string }[];
  lang: Locale;
}

function DropdownNav({ label, items, lang }: DropdownNavProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isActive = items.some((i) => pathname.startsWith(i.href));

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const triggerState =
    isActive || open
      ? "text-primary! font-bold"
      : "text-on-surface-variant font-medium hover:text-on-surface";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`group relative inline-flex items-start overflow-hidden rounded whitespace-nowrap h-6 px-2.5 text-sm leading-6 cursor-pointer bg-transparent border-0 motion-safe:transition-colors motion-safe:duration-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${triggerState}`}
      >
        <span className="pointer-events-none flex items-center gap-1 leading-6 motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:-translate-y-full">
          {label}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={12}
            height={12}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className={`inline-block shrink-0 align-middle motion-safe:transition-transform motion-safe:duration-200 ${
              open ? "rotate-180 text-primary" : "text-outline"
            }`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute top-full left-2.5 block leading-6 motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:-translate-y-full"
        >
          {label}
        </span>
      </button>

      {/* Panel dropdown */}
      <div
        role="region"
        aria-label={label}
        className={`absolute left-1/2 top-[calc(100%+10px)] z-[200] flex min-w-[168px] flex-col gap-0.5 rounded-md bg-[rgba(255,255,255,0.72)] p-1.5 shadow-glass [backdrop-filter:blur(8px)_url(#liquid-glass)_saturate(1.5)] [-webkit-backdrop-filter:blur(8px)_saturate(1.5)] motion-safe:transition-[opacity,transform,visibility] motion-safe:duration-200 ${
          open
            ? "visible pointer-events-auto -translate-x-1/2 translate-y-0 opacity-100"
            : "invisible pointer-events-none -translate-x-1/2 -translate-y-1.5 opacity-0"
        }`}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className="block whitespace-nowrap rounded-[8px] px-3.5 py-2 text-sm font-semibold text-on-surface-variant no-underline motion-safe:transition-colors motion-safe:duration-150 hover:bg-primary-container hover:text-on-primary-container focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2"
          >
            {lang === "id" ? item.label : item.labelEn}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Icons
   ───────────────────────────────────────────── */
function HamburgerIcon() {
  return (
    <svg
      width={22}
      height={22}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width={22}
      height={22}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Komponen Navbar utama
   ───────────────────────────────────────────── */
export function Navbar() {
  const { lang } = useLang();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Skip nav */}
      <a
        href="#main-content"
        className="absolute -top-24 left-4 z-[9999] rounded-b-xl bg-primary px-5 py-2 font-body text-sm font-semibold text-on-primary no-underlisene motion-safe:transition-[top] motion-safe:duration-150 focus-visible:top-0"
      >
        {lang === "id" ? "Langsung ke konten" : "Skip to content"}
      </a>

      {/* Filter refraksi liquid-glass — dipakai oleh backdrop-filter navbar.
          feTurbulence bikin noise, feDisplacementMap membiaskan konten di belakang. */}
      <svg aria-hidden className="pointer-events-none absolute h-0 w-0">
        <defs>
          <filter
            id="liquid-glass"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01 0.014"
              numOctaves={2}
              seed={92}
              result="noise"
            />
            <feGaussianBlur in="noise" stdDeviation={2} result="blurredNoise" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="blurredNoise"
              scale={65}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Wrapper fixed — pointer-events off, pill sendiri yang on */}
      <div
        role="banner"
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] w-full px-3 py-6"
      >
        <nav
          aria-label={lang === "id" ? "Navigasi utama" : "Main navigation"}
          className="pointer-events-auto mx-auto flex w-full max-w-[1040px] items-center justify-between gap-5 rounded-full bg-[rgba(255,255,255,0.60)] px-4 py-4 font-body text-[0.9375rem] text-on-surface shadow-glass [backdrop-filter:blur(8px)_url(#liquid-glass)_saturate(1.5)] [-webkit-backdrop-filter:blur(8px)_saturate(1.5)] motion-safe:transition-[background-color,box-shadow] motion-safe:duration-300"
        >
          {/* ── Logo (kiri) ── */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 text-on-surface no-underline"
          >
            <img
              src="/images/logo-caheabusel.avif"
              alt="Logo Cahea Busel"
              width={40}
              height={40}
              className="h-10 w-10 object-contain motion-safe:transition-transform motion-safe:duration-[250ms] group-hover:-rotate-[8deg] group-hover:scale-[1.08]"
            />
          </Link>

          {/* ── Menu desktop (tengah) ── */}
          <div className="hidden shrink-0 items-center gap-0.5 lg:flex">
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={lang === "id" ? item.label : item.labelEn}
                exact={item.exact}
              />
            ))}
            <DropdownNav
              label={lang === "id" ? "Informasi" : "Information"}
              items={INFORMASI_ITEMS}
              lang={lang}
            />
          </div>

          {/* ── Aksi kanan ── */}
          <div className="flex shrink-0 items-center gap-2">
            <ProfileIcon href="/admin/login" />

            {/* Hamburger (mobile) */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-outline-variant bg-surface-container-low text-on-surface-variant cursor-pointer motion-safe:transition-colors motion-safe:duration-150 hover:bg-primary-container hover:text-on-primary-container lg:hidden"
            >
              {mobileOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>
          </div>
        </nav>

        {/* ── Mobile fullscreen menu ── */}
        <div
          aria-hidden={!mobileOpen}
          className={`fixed inset-0 z-[99] flex flex-col items-center justify-center bg-white/98 backdrop-blur-[24px] motion-safe:transition-[opacity,visibility] motion-safe:duration-[250ms] lg:hidden ${
            mobileOpen
              ? "visible pointer-events-auto opacity-100"
              : "invisible pointer-events-none opacity-0"
          }`}
        >
          <nav
            aria-label={lang === "id" ? "Navigasi mobile" : "Mobile navigation"}
            className="flex w-full max-w-[320px] flex-col items-center gap-2"
          >
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={lang === "id" ? item.label : item.labelEn}
                exact={item.exact}
                onClick={() => setMobileOpen(false)}
                mobile
              />
            ))}

            {/* Informasi group */}
            <div className="mt-4 flex w-full flex-col items-center gap-1.5 border-t border-outline-variant pt-4">
              <span className="mb-1 text-[0.6875rem] font-bold uppercase tracking-widest text-outline">
                {lang === "id" ? "Informasi" : "Information"}
              </span>
              {INFORMASI_ITEMS.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={lang === "id" ? item.label : item.labelEn}
                  exact
                  onClick={() => setMobileOpen(false)}
                  mobile
                />
              ))}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}

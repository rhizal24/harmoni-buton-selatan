"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Locale } from "@/components/ui/LanguageSwitcher";
import { ProfileIcon } from "@/components/ui/ProfileIcon";
import { GlassSurface } from "@/components/ui/GlassSurface";

/* ─────────────────────────────────────────────
   Data navigasi
   ───────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: "Beranda", labelEn: "Home", href: "/", exact: true },
  { label: "Wisata", labelEn: "Tourism", href: "/wisata", exact: false },
  { label: "Profil", labelEn: "Profile", href: "/profil", exact: false },
  { label: "Peta", labelEn: "Map", href: "/peta", exact: false },
  { label: "Galeri", labelEn: "Gallery", href: "/galeri", exact: false },
  { label: "Informasi", labelEn: "Information", href: "/informasi", exact: false },
] as const;

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
          className="pointer-events-auto mx-auto w-full max-w-[1040px]"
        >
          {/* Permukaan liquid-glass (GlassSurface) — refraksi + frost.
              Tinggi 72px = py-4 lama + logo 40px; radius 36 = pill penuh. */}
          <GlassSurface
            width="100%"
            height={72}
            borderRadius={36}
            backgroundOpacity={0.45}
            saturation={1.5}
            blur={11}
            displace={2}
            className="font-body text-[0.9375rem] text-on-surface"
          >
            <div className="flex w-full items-center justify-between gap-5 px-4">
              {/* ── Logo (kiri) ── */}
              <Link
                href="/"
                className="group flex shrink-0 items-center gap-2.5 text-on-surface no-underline"
              >
                <img
                  src="/assets/logo-caheabusel.avif"
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
            </div>
          </GlassSurface>
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
          </nav>
        </div>
      </div>
    </>
  );
}

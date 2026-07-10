/**
 * NavLink, UI Atom
 *
 * Link navigasi navbar dengan active-state awareness (menggunakan usePathname).
 * Hanya rendering-level; tidak mengandung logic dropdown.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  /** Jika true, aktif hanya ketika pathname persis sama (bukan prefix). */
  exact?: boolean;
  className?: string;
  onClick?: () => void;
}

export function NavLink({
  href,
  children,
  exact = false,
  className = "",
  onClick,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      data-active={isActive ? "true" : undefined}
      className={`nav-link ${isActive ? "nav-link--active" : ""} ${className}`}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

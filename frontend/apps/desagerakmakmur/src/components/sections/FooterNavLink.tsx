"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Link navigasi Footer — tebal saat halaman sedang dibuka (pola Navbar). */
export function FooterNavLink({
  href,
  exact,
  children,
}: {
  href: string;
  exact?: boolean;
  children: string;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`font-body text-sm no-underline motion-safe:transition-colors hover:text-white ${
        isActive ? "font-bold text-white" : "text-white/60"
      }`}
    >
      {children}
    </Link>
  );
}

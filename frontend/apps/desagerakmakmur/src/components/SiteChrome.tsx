"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/sections/Navbar";
import { SmoothScroll } from "@/components/ui/SmoothScroll";

/**
 * Chrome situs publik (smooth scroll + navbar).
 * Disembunyikan di area /admin — dashboard punya sidebar sendiri
 * dan tidak boleh memakai smooth-scroll Lenis.
 */
export function SiteChrome() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <>
      <SmoothScroll />
      <Navbar />
    </>
  );
}

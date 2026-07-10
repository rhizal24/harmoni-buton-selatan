"use client";

import { createContext, useContext } from "react";
import type { AdminSession } from "@/lib/admin";

export const AdminContext = createContext<AdminSession | null>(null);

/** Sesi admin aktif, hanya valid di dalam layout /admin (dashboard). */
export function useAdmin(): AdminSession {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin harus dipakai di dalam layout admin");
  return ctx;
}

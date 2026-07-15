"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3Icon,
  CalendarIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  FileTextIcon,
  GalleryHorizontalIcon,
  ImagesIcon,
  LandmarkIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MapIcon,
  MapPinIcon,
  NetworkIcon,
  NewspaperIcon,
  PhoneIcon,
  SearchIcon,
  StoreIcon,
  TicketIcon,
  WavesIcon,
  type LucideIcon,
} from "lucide-react";
import { loadAdminSession, signOutAdmin, type AdminSession } from "@/lib/admin";
import { SITE_NAME } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AdminContext } from "./admin-context";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string | null;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [{ label: "Ringkasan", href: "/admin", icon: LayoutDashboardIcon }],
  },
  {
    label: "Kelembagaan",
    items: [
      { label: "Profil Desa", href: "/admin/profil", icon: LandmarkIcon },
      { label: "Struktur Organisasi", href: "/admin/struktur", icon: NetworkIcon },
      { label: "Desa dalam Angka", href: "/admin/statistik", icon: BarChart3Icon },
      { label: "Dokumen Desa", href: "/admin/dokumen", icon: FileTextIcon },
      { label: "Kontak Footer", href: "/admin/kontak", icon: PhoneIcon },
    ],
  },
  {
    label: "Konten & Publikasi",
    items: [
      { label: "Hero Section", href: "/admin/hero", icon: GalleryHorizontalIcon },
      { label: "Wisata", href: "/admin/wisata", icon: MapPinIcon },
      { label: "Peta", href: "/admin/peta", icon: MapIcon },
      { label: "Paket Wisata", href: "/admin/paket", icon: TicketIcon },
      { label: "Galeri", href: "/admin/galeri", icon: ImagesIcon },
      { label: "Berita", href: "/admin/berita", icon: NewspaperIcon },
      { label: "UMKM", href: "/admin/umkm", icon: StoreIcon },
    ],
  },
];

function isNavActive(href: string, pathname: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

/** Pencarian menu admin — saran muncul saat mengetik; Enter membuka hasil pertama. */
function NavSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const semua = NAV_GROUPS.flatMap((g) => g.items);
  const hasil = q.trim()
    ? semua.filter((i) => i.label.toLowerCase().includes(q.trim().toLowerCase()))
    : semua;

  function buka(href: string) {
    router.push(href);
    setQ("");
    setOpen(false);
  }

  return (
    <div className="relative w-full">
      <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && hasil[0]) buka(hasil[0].href);
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Cari menu…"
        className="h-10 bg-white pl-9 font-body text-sm"
      />
      {open && (
        <div className="absolute top-full z-20 mt-1 w-full overflow-hidden rounded-md border bg-popover py-1 shadow-floating">
          {hasil.length === 0 ? (
            <p className="px-3 py-2 font-body text-sm text-muted-foreground">
              Menu tidak ditemukan.
            </p>
          ) : (
            hasil.map((item) => (
              <button
                key={item.href}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  buka(item.href);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left font-body text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <item.icon className="size-4 text-[#006572]" />
                {item.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/** Inisial nama untuk avatar (maks. 2 huruf). */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

/**
 * Layout dashboard admin — sidebar kiri + konten kanan (design system §18:
 * padat, dominan tosca, tanpa coral), dibangun dengan shadcn/ui Sidebar
 * (collapsible ke mode ikon). Guard sesi: tanpa sesi admin yang sah
 * langsung diarahkan ke /admin/login.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadAdminSession().then((s) => {
      if (cancelled) return;
      if (!s) {
        router.replace("/admin/login");
        return;
      }
      setSession(s);
      setChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSignOut() {
    await signOutAdmin();
    router.replace("/admin/login");
  }

  if (checking || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7FAFB]">
        <p className="font-body text-sm text-muted-foreground">Memeriksa sesi…</p>
      </main>
    );
  }

  const displayName = session.profile.full_name ?? session.email ?? "Admin";
  const activeItem = NAV_GROUPS.flatMap((g) => g.items).find((item) =>
    isNavActive(item.href, pathname),
  );

  return (
    <AdminContext.Provider value={session}>
      <SidebarProvider style={{ "--sidebar-width": "17.5rem" } as React.CSSProperties}>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <Link href="/admin">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                      <WavesIcon className="size-5" />
                    </div>
                    <div className="grid flex-1 text-left leading-tight">
                      <span className="truncate font-body text-base font-bold tracking-tight text-[#006572]">
                        {SITE_NAME}
                      </span>
                      <span className="truncate font-body text-[11px] font-semibold uppercase tracking-[0.24em] text-[#006572]/60">
                        Panel Admin
                      </span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            {NAV_GROUPS.map((group) => (
              <SidebarGroup key={group.label ?? "utama"}>
                {group.label && (
                  <SidebarGroupLabel className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-[#006572]/70">
                    {group.label}
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          tooltip={item.label}
                          isActive={isNavActive(item.href, pathname)}
                          className="h-11 gap-2.5 px-3 font-body text-[15px] [&>svg]:size-[18px] data-[active=true]:bg-sidebar-primary data-[active=true]:font-semibold data-[active=true]:text-sidebar-primary-foreground"
                        >
                          <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Lihat Situs"
                  className="h-11 gap-2.5 px-3 font-body text-[15px] [&>svg]:size-[18px]"
                >
                  <Link href="/" target="_blank">
                    <ExternalLinkIcon />
                    <span>Lihat Situs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Keluar"
                  onClick={handleSignOut}
                  className="h-11 gap-2.5 px-3 font-body text-[15px] text-destructive [&>svg]:size-[18px] hover:bg-error-container/50 hover:text-destructive"
                >
                  <LogOutIcon />
                  <span>Keluar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <SidebarInset className="bg-[#F7FAFB]">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-[#F7FAFB] px-4 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <h1 className="font-body text-base font-bold tracking-tight text-[#006572]">
              {activeItem?.label ?? "Panel Admin"}
            </h1>

            <div className="mx-4 hidden max-w-md flex-1 md:block">
              <NavSearch />
            </div>

            <div className="ml-auto flex items-center gap-2.5">
              <span className="hidden items-center gap-1.5 font-body text-sm text-muted-foreground sm:inline-flex">
                <CalendarIcon className="size-4" />
                {formatDate(new Date().toISOString())}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-md px-1.5 py-1 motion-safe:transition-colors hover:bg-surface-container-low data-[state=open]:bg-surface-container-low"
                  >
                    <span className="flex size-9 items-center justify-center rounded-full bg-[#006572] font-body text-sm font-bold text-white">
                      {initials(displayName)}
                    </span>
                    <span className="hidden max-w-40 truncate font-body text-sm font-semibold text-foreground md:block">
                      {displayName}
                    </span>
                    <ChevronDownIcon className="size-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-56">
                  <DropdownMenuLabel>
                    <p className="truncate font-body text-sm font-semibold">{displayName}</p>
                    <p className="truncate font-body text-xs font-normal text-muted-foreground">
                      {session.email ?? "Admin desa"}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/" target="_blank">
                      <ExternalLinkIcon />
                      Lihat Situs
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onSelect={handleSignOut}>
                    <LogOutIcon />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="min-w-0 flex-1 p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AdminContext.Provider>
  );
}

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
} from "react-leaflet";
import Link from "next/link";
import { Layers, Maximize2, Minimize2, SlidersHorizontal } from "lucide-react";
import { VILLAGE_MAP_CENTER, VILLAGE_MAP_DEFAULT_ZOOM } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import type { Wisata } from "@/types/wisata";
import type { Umkm } from "@/types/umkm";
import type { FeatureCollection } from "geojson";

const WARNA_WISATA = "#006572";
const WARNA_UMKM = "#F45B69";
const WARNA_BATAS_WILAYAH = "#2E2E2E";
const WARNA_BATAS_DESA = "#006572";
const WARNA_BANGUNAN = "#5A5A5A";

/**
 * Dua pilihan basemap — jalan (OSM default) dan topografi (kontur
 * OpenTopoMap) — cukup ditoggle langsung tanpa dropdown karena cuma 2 opsi.
 */
const BASEMAP_OPTIONS = {
  jalan: {
    label: "Jalan",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    // OSM masih punya tile asli sampai zoom 19.
    maxNativeZoom: 19,
  },
  topografi: {
    label: "Topografi",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    // OpenTopoMap cuma render tile asli sampai zoom 17 — di atas itu server
    // balikin gambar placeholder "max zoom" alih-alih tile peta. Dengan
    // `maxNativeZoom`, Leaflet upscale tile z17 alih-alih minta tile yang
    // tidak ada.
    maxNativeZoom: 17,
  },
} as const;

type BasemapKey = keyof typeof BASEMAP_OPTIONS;

/**
 * Pin marker kustom (divIcon SVG) — Leaflet default icon butuh berkas
 * gambar terpisah yang gampang putus lewat bundler, jadi diganti SVG inline
 * agar konsisten dengan warna brand. Warna beda per kategori: tosca untuk
 * Wisata, coral untuk UMKM.
 */
function buatIkonPin(warna: string) {
  return L.divIcon({
    className: "",
    html: `
      <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 26 16 26s16-15 16-26C32 7.163 24.837 0 16 0z" fill="${warna}"/>
        <circle cx="16" cy="16" r="6.5" fill="white"/>
      </svg>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -38],
  });
}

const ikonWisata = buatIkonPin(WARNA_WISATA);
const ikonUmkm = buatIkonPin(WARNA_UMKM);

/**
 * Pill toggle filter layer — dipakai dobel: baris horizontal di desktop
 * (selalu tampil) dan daftar vertikal di dalam dropdown mobile (`sm:hidden`
 * toggle). Diekstrak jadi komponen supaya bentuk & warna tiap kategori tetap
 * konsisten di kedua tampilan.
 */
function FilterPill({
  label,
  active,
  onClick,
  activeClassName,
  inactiveDotColor,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  activeClassName: string;
  inactiveDotColor: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1.5 font-body text-xs font-semibold whitespace-nowrap motion-safe:transition-all ${
        active
          ? activeClassName
          : "border-[#D0D0D0] bg-white/95 text-[#5A5A5A] shadow-sm"
      }`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${active ? "bg-white" : ""}`}
        style={active ? undefined : { backgroundColor: inactiveDotColor }}
        aria-hidden
      />
      {label}
    </button>
  );
}

interface WebGISMapInnerProps {
  wisata: Wisata[];
  umkm: Umkm[];
}

/**
 * Leaflet tidak otomatis tahu ukuran container berubah saat toggle mode
 * layar-penuh (ukuran container diubah lewat class Tailwind, di luar siklus
 * render Leaflet sendiri), jadi peta perlu dipaksa `invalidateSize()` tiap
 * kali `isExpanded` berubah, kalau tidak tile akan terpotong/blank.
 */
function SinkronkanUkuranPeta({ isExpanded }: { isExpanded: boolean }) {
  const map = useMap();

  useEffect(() => {
    const timeout = window.setTimeout(() => map.invalidateSize(), 250);
    return () => window.clearTimeout(timeout);
  }, [map, isExpanded]);

  return null;
}

/**
 * Peta interaktif (react-leaflet + tile OpenStreetMap). Marker hanya untuk
 * destinasi/usaha yang punya koordinat (`latitude`/`longitude` terisi di
 * admin Wisata/UMKM); klik marker → popup ringkas dengan tautan ke detail.
 * Dua kategori (Wisata, UMKM) digabung di peta yang sama dengan warna pin
 * berbeda + toggle tampil/sembunyi per kategori supaya tidak numpuk.
 */
export function WebGISMapInner({ wisata, umkm }: WebGISMapInnerProps) {
  const [tampilWisata, setTampilWisata] = useState(true);
  const [tampilUmkm, setTampilUmkm] = useState(true);
  const [tampilBatasWilayah, setTampilBatasWilayah] = useState(true);
  const [tampilBatasDesa, setTampilBatasDesa] = useState(true);
  const [tampilBangunan, setTampilBangunan] = useState(true);
  const [basemap, setBasemap] = useState<BasemapKey>("jalan");
  const [menuFilterTerbuka, setMenuFilterTerbuka] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [batasWilayah, setBatasWilayah] = useState<FeatureCollection | null>(
    null,
  );
  const [batasDesa, setBatasDesa] = useState<FeatureCollection | null>(null);
  const [bangunan, setBangunan] = useState<FeatureCollection | null>(null);

  // Data batas administrasi (Kecamatan Sampolawa), batas desa, dan bangunan
  // dipisah jadi GeoJSON statis di /public/geo alih-alih di-hardcode di kode
  // — koordinat sudah dalam WGS84 [lng, lat] (standar GeoJSON), jadi Leaflet
  // bisa memproyeksikannya langsung tanpa transformasi tambahan.
  useEffect(() => {
    let batal = false;
    fetch("/geo/kecamatan-sampolawa.geojson")
      .then((res) => res.json())
      .then((data: FeatureCollection) => {
        if (!batal) setBatasWilayah(data);
      })
      .catch(() => {
        if (!batal) setBatasWilayah(null);
      });
    return () => {
      batal = true;
    };
  }, []);

  useEffect(() => {
    let batal = false;
    fetch("/geo/batas-desa.geojson")
      .then((res) => res.json())
      .then((data: FeatureCollection) => {
        if (!batal) setBatasDesa(data);
      })
      .catch(() => {
        if (!batal) setBatasDesa(null);
      });
    return () => {
      batal = true;
    };
  }, []);

  useEffect(() => {
    let batal = false;
    fetch("/geo/bangunan.geojson")
      .then((res) => res.json())
      .then((data: FeatureCollection) => {
        if (!batal) setBangunan(data);
      })
      .catch(() => {
        if (!batal) setBangunan(null);
      });
    return () => {
      batal = true;
    };
  }, []);

  // Fullscreen API browser (`requestFullscreen`) sering diblok Permissions
  // Policy di dalam iframe preview, jadi "layar penuh" di sini dibuat murni
  // lewat CSS (`fixed inset-0`). `Reveal` (ancestor section peta) memberi
  // `transform` lewat class `translate-y-*` saat animasi masuk viewport, dan
  // `transform` apa pun selain `none` membuat ancestor itu jadi containing
  // block baru — `position: fixed` di dalamnya jadi kejebak di kotak kecil,
  // bukan viewport. Makanya versi expanded di-portal ke `document.body`.
  useEffect(() => {
    if (!isExpanded) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsExpanded(false);
    };
    document.addEventListener("keydown", handleKeyDown);

    const bodyOverflowSebelumnya = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = bodyOverflowSebelumnya;
    };
  }, [isExpanded]);

  const wisataBerkoordinat = wisata.filter(
    (w): w is Wisata & { latitude: number; longitude: number } =>
      w.latitude != null && w.longitude != null,
  );
  const umkmBerkoordinat = umkm.filter(
    (u): u is Umkm & { latitude: number; longitude: number } =>
      u.latitude != null && u.longitude != null,
  );

  const peta = (
    <div
      className={
        isExpanded
          ? "fixed inset-0 z-[2000] h-dvh w-screen bg-white"
          : "relative h-full w-full bg-white"
      }
    >
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        aria-label={
          isExpanded ? "Keluar dari layar penuh" : "Tampilkan layar penuh"
        }
        className="absolute top-3 left-3 z-[1000] flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-[#D0D0D0] bg-white/95 text-[#5A5A5A] shadow-sm motion-safe:transition-colors hover:border-[#006572] hover:text-[#006572]"
      >
        {isExpanded ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </button>

      <button
        type="button"
        onClick={() =>
          setBasemap((v) => (v === "jalan" ? "topografi" : "jalan"))
        }
        aria-label={`Ganti ke peta ${
          basemap === "jalan"
            ? BASEMAP_OPTIONS.topografi.label
            : BASEMAP_OPTIONS.jalan.label
        }`}
        title={`Peta ${BASEMAP_OPTIONS[basemap].label}`}
        className="absolute top-14 left-3 z-[1000] flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-[#D0D0D0] bg-white/95 text-[#5A5A5A] shadow-sm motion-safe:transition-colors hover:border-[#006572] hover:text-[#006572]"
      >
        <Layers className="h-4 w-4" />
      </button>

      <div className="absolute top-3 right-3 z-[1000] flex flex-col items-end">
        {/* Toggle dropdown filter — cuma tampil di mobile; di sm ke atas
            baris pill selalu terbuka seperti biasa. */}
        <button
          type="button"
          onClick={() => setMenuFilterTerbuka((v) => !v)}
          aria-label="Tampilkan filter layer peta"
          aria-expanded={menuFilterTerbuka}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-[#D0D0D0] bg-white/95 text-[#5A5A5A] shadow-sm motion-safe:transition-colors hover:border-[#006572] hover:text-[#006572] sm:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>

        <div
          className={`flex-col items-end gap-2 ${
            menuFilterTerbuka ? "mt-2 flex" : "hidden"
          } sm:mt-0 sm:flex sm:flex-row sm:flex-wrap sm:justify-end sm:gap-2`}
        >
          {batasDesa && (
            <FilterPill
              label="Batas Desa"
              active={tampilBatasDesa}
              onClick={() => setTampilBatasDesa((v) => !v)}
              activeClassName="border-[#006572] bg-[#006572] text-white shadow-[0_0_14px_rgba(0,101,114,0.55)]"
              inactiveDotColor={WARNA_BATAS_DESA}
            />
          )}
          {bangunan && (
            <FilterPill
              label={`Bangunan (${bangunan.features.length})`}
              active={tampilBangunan}
              onClick={() => setTampilBangunan((v) => !v)}
              activeClassName="border-[#5A5A5A] bg-[#5A5A5A] text-white shadow-[0_0_14px_rgba(90,90,90,0.45)]"
              inactiveDotColor={WARNA_BANGUNAN}
            />
          )}
          {batasWilayah && (
            <FilterPill
              label="Kec. Sampolawa"
              active={tampilBatasWilayah}
              onClick={() => setTampilBatasWilayah((v) => !v)}
              activeClassName="border-[#2E2E2E] bg-[#2E2E2E] text-white shadow-[0_0_14px_rgba(46,46,46,0.45)]"
              inactiveDotColor={WARNA_BATAS_WILAYAH}
            />
          )}
          <FilterPill
            label={`Wisata (${wisataBerkoordinat.length})`}
            active={tampilWisata}
            onClick={() => setTampilWisata((v) => !v)}
            activeClassName="border-[#006572] bg-[#006572] text-white shadow-[0_0_14px_rgba(0,101,114,0.55)]"
            inactiveDotColor={WARNA_WISATA}
          />
          <FilterPill
            label={`UMKM (${umkmBerkoordinat.length})`}
            active={tampilUmkm}
            onClick={() => setTampilUmkm((v) => !v)}
            activeClassName="border-[#F45B69] bg-[#F45B69] text-white shadow-[0_0_14px_rgba(244,91,105,0.55)]"
            inactiveDotColor={WARNA_UMKM}
          />
        </div>
      </div>

      <MapContainer
        center={VILLAGE_MAP_CENTER}
        zoom={VILLAGE_MAP_DEFAULT_ZOOM}
        scrollWheelZoom
        touchZoom
        zoomControl={false}
        className="h-full w-full"
      >
        <SinkronkanUkuranPeta isExpanded={isExpanded} />
        <ZoomControl position="bottomright" />
        <TileLayer
          key={basemap}
          attribution={BASEMAP_OPTIONS[basemap].attribution}
          url={BASEMAP_OPTIONS[basemap].url}
          maxNativeZoom={BASEMAP_OPTIONS[basemap].maxNativeZoom}
        />
        {tampilBatasWilayah && batasWilayah && (
          <GeoJSON
            key="batas-wilayah-sampolawa"
            data={batasWilayah}
            style={{
              color: WARNA_BATAS_WILAYAH,
              weight: 2,
              dashArray: "6 4",
              fillColor: WARNA_BATAS_WILAYAH,
              fillOpacity: 0.05,
            }}
          />
        )}
        {tampilBatasDesa && batasDesa && (
          <GeoJSON
            key="batas-desa-gerak-makmur"
            data={batasDesa}
            style={{
              color: WARNA_BATAS_DESA,
              weight: 2.5,
              fillColor: WARNA_BATAS_DESA,
              fillOpacity: 0.04,
            }}
            onEachFeature={(feature, layer) => {
              const nama = feature.properties?.NAMOBJ ?? "Desa Gerak Makmur";
              layer.bindTooltip(nama, { sticky: true });
            }}
          />
        )}
        {tampilBangunan && bangunan && (
          <GeoJSON
            key="bangunan-desa"
            data={bangunan}
            style={{
              color: WARNA_BANGUNAN,
              weight: 1,
              fillColor: WARNA_BANGUNAN,
              fillOpacity: 0.45,
            }}
          />
        )}
        {tampilWisata &&
          wisataBerkoordinat.map((w) => (
            <Marker
              key={w.nama}
              position={[w.latitude, w.longitude]}
              icon={ikonWisata}
            >
              <Popup className="map-popup" minWidth={240} maxWidth={260}>
                <div className="w-[240px] font-body">
                  {w.imgs[0] && (
                    // eslint-disable-next-line @next/next/no-img-element -- thumbnail di dalam popup Leaflet, bukan konten halaman
                    <img
                      src={w.imgs[0]}
                      alt={w.alt || w.nama}
                      className="h-32 w-full object-cover"
                    />
                  )}
                  <div className="flex flex-col gap-1.5 px-3.5 py-3">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-lg leading-tight font-bold text-[#006572]">
                        {w.nama}
                      </p>
                      {w.tagline && (
                        <p className="text-xs leading-tight text-[#2E2E2E]/70">
                          {w.tagline}
                        </p>
                      )}
                    </div>
                    {w.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {w.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-[#CFF1F4] px-2 py-0.5 text-[10px] font-semibold text-[#00434B]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <Link
                      href={`/wisata#wisata-${slugify(w.nama)}`}
                      className="mt-1 text-xs font-semibold text-[#006572] hover:underline"
                    >
                      Lihat detail →
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        {tampilUmkm &&
          umkmBerkoordinat.map((u) => (
            <Marker
              key={u.nama}
              position={[u.latitude, u.longitude]}
              icon={ikonUmkm}
            >
              <Popup className="map-popup" minWidth={200} maxWidth={220}>
                <div className="flex w-[200px] flex-col gap-1.5 px-3.5 py-3 font-body">
                  <p className="text-sm font-bold text-[#F45B69]">{u.nama}</p>
                  {(u.kategori || u.lokasi) && (
                    <p className="text-xs text-[#2E2E2E]/70">
                      {[u.kategori, u.lokasi].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <Link
                    href="/informasi#umkm-desa"
                    className="mt-1 text-xs font-semibold text-[#F45B69] hover:underline"
                  >
                    Lihat UMKM desa →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );

  return isExpanded ? createPortal(peta, document.body) : peta;
}

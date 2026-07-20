"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  GeoJSON,
  MapContainer,
  Marker,
  Pane,
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
import type { Feature, FeatureCollection } from "geojson";

// Coral — dulu dipakai UMKM (sudah dihapus dari peta ini), sekarang jadi
// warna khusus Wisata supaya beda dari semua warna layer lain (teal Batas
// Desa, hitam Batas Wilayah, abu-abu/hijau/ungu/oranye/biru Bangunan, emas
// Fasilitas Umum).
const WARNA_WISATA = "#F45B69";
const WARNA_BATAS_WILAYAH = "#2E2E2E";
const WARNA_BATAS_DESA = "#006572";
const WARNA_BANGUNAN = "#5A5A5A";
const WARNA_FASILITAS = "#C9A227";

/**
 * Tumpukan layer (bawah → atas): Kec. Sampolawa, Batas Desa, Bangunan,
 * Fasilitas Umum. Keempat layer di-fetch async terpisah, jadi urutan
 * mount-nya tidak bisa diandalkan mengikuti urutan JSX — layer yang fetch-nya
 * kelar duluan bisa nongol di atas walau ditulis lebih dulu di kode. `Pane`
 * dengan z-index eksplisit ini yang benar-benar mengunci urutan tampil,
 * terlepas dari kapan masing-masing selesai di-fetch.
 */
const PANE_KEC_SAMPOLAWA = "pane-kec-sampolawa";
const PANE_BATAS_DESA = "pane-batas-desa";
const PANE_BANGUNAN = "pane-bangunan";
const PANE_FASILITAS_UMUM = "pane-fasilitas-umum";

/**
 * Warna bangunan dibedakan per dusun supaya sebaran tiap dusun gampang
 * dibaca sekilas di peta, alih-alih satu warna abu-abu rata untuk semua
 * bangunan. Dusun di luar 4 nama ini (kalau ada data baru) jatuh ke
 * `WARNA_BANGUNAN` sebagai warna default.
 */
const WARNA_BANGUNAN_PER_DUSUN: Record<string, string> = {
  "Lande 1": "#4A7C59",
  "Lande 2": "#7C5C9C",
  "Lande 3": "#C77B3B",
  "Lande 4": "#4472A8",
};

// Urutan tampil pill filter dusun — dusun di luar daftar ini (kalau ada
// data baru) tetap dirender, ditaruh di akhir lewat sisa hasil `.sort()`.
const URUTAN_DUSUN = ["Lande 1", "Lande 2", "Lande 3", "Lande 4"];

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
 * agar konsisten dengan warna brand.
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
  warna,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  // Kategori dengan warna tetap (dikenal saat nulis kode) pakai kelas
  // Tailwind statis lewat `activeClassName`. Kategori dengan warna dinamis
  // (mis. per dusun, ditentukan dari data) pakai `warna` + inline style,
  // karena Tailwind JIT tidak bisa men-scan class arbitrary-value yang
  // dirakit lewat template literal saat runtime.
  activeClassName?: string;
  inactiveDotColor: string;
  warna?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1.5 font-body text-xs font-semibold whitespace-nowrap motion-safe:transition-all ${
        active
          ? (activeClassName ?? "text-white shadow-sm")
          : "border-[#D0D0D0] bg-white/95 text-[#5A5A5A] shadow-sm"
      }`}
      style={
        active && warna
          ? { borderColor: warna, backgroundColor: warna }
          : undefined
      }
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
 * Deep-link dari halaman lain (mis. tombol "Lihat di Peta Desa" di
 * `/wisata`) — `?wisata=<slug-nama>` di URL peta ini men-fly-to koordinat
 * destinasi itu lalu buka popup-nya otomatis.
 */
function FokusWisataDariQuery({
  wisataBerkoordinat,
  markerRefs,
}: {
  wisataBerkoordinat: (Wisata & { latitude: number; longitude: number })[];
  markerRefs: React.RefObject<Map<string, L.Marker>>;
}) {
  const map = useMap();
  const searchParams = useSearchParams();
  const fokus = searchParams.get("wisata");

  useEffect(() => {
    if (!fokus) return;
    const target = wisataBerkoordinat.find((w) => slugify(w.nama) === fokus);
    if (!target) return;
    map.flyTo([target.latitude, target.longitude], 17, { duration: 1.2 });
    // Popup langsung dibuka — tetap kebaca walau animasi flyTo belum kelar.
    markerRefs.current.get(fokus)?.openPopup();
  }, [fokus, map, wisataBerkoordinat, markerRefs]);

  return null;
}

/**
 * Peta interaktif (react-leaflet + tile OpenStreetMap). Marker hanya untuk
 * destinasi yang punya koordinat (`latitude`/`longitude` terisi di admin
 * Wisata); klik marker → popup ringkas dengan tautan ke detail.
 */
export function WebGISMapInner({ wisata }: WebGISMapInnerProps) {
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());
  const [tampilWisata, setTampilWisata] = useState(true);
  const [tampilBatasWilayah, setTampilBatasWilayah] = useState(true);
  const [tampilBatasDesa, setTampilBatasDesa] = useState(true);
  const [dusunTersembunyi, setDusunTersembunyi] = useState<Set<string>>(
    () => new Set(),
  );
  const [tampilFasilitas, setTampilFasilitas] = useState(true);
  const [basemap, setBasemap] = useState<BasemapKey>("jalan");
  const [menuFilterTerbuka, setMenuFilterTerbuka] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [batasWilayah, setBatasWilayah] = useState<FeatureCollection | null>(
    null,
  );
  const [batasDesa, setBatasDesa] = useState<FeatureCollection | null>(null);
  const [bangunan, setBangunan] = useState<FeatureCollection | null>(null);
  const [fasilitasUmum, setFasilitasUmum] = useState<FeatureCollection | null>(
    null,
  );

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

  useEffect(() => {
    let batal = false;
    fetch("/geo/tambahan-attribute.geojson")
      .then((res) => res.json())
      .then((data: FeatureCollection) => {
        if (!batal) setFasilitasUmum(data);
      })
      .catch(() => {
        if (!batal) setFasilitasUmum(null);
      });
    return () => {
      batal = true;
    };
  }, []);

  // Fullscreen API browser (`requestFullscreen`) sering diblok Permissions
  // Policy di dalam iframe preview, jadi "layar penuh" di sini dibuat murni
  // lewat CSS (`fixed inset-0`), tanpa portal. `Reveal` (ancestor section
  // peta di `PetaWebGIS`) dipanggil dengan `dropTransformWhenVisible` supaya
  // tidak permanen menyisakan `transform: translateY(0)` setelah animasinya
  // selesai — `transform` apa pun selain `none` bikin ancestor itu jadi
  // containing block baru yang menjebak `position: fixed` di dalamnya,
  // bukan di viewport. (Sebelumnya ini "diakali" dengan portal ke
  // `document.body` saat expanded — tapi portal yang container-nya berubah
  // antar render bikin React unmount+remount seluruh subtree tiap toggle,
  // termasuk instance Leaflet map-nya, dan animasi zoom/tooltip yang masih
  // pending dari instance lama lalu nabrak DOM yang sudah dibongkar dan
  // lempar `Cannot read properties of undefined (reading '_leaflet_pos')`.)
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

  const wisataBerkoordinat = useMemo(
    () =>
      wisata.filter(
        (w): w is Wisata & { latitude: number; longitude: number } =>
          w.latitude != null && w.longitude != null,
      ),
    [wisata],
  );
  // Bangunan dikelompokkan per dusun supaya tiap dusun bisa punya pill
  // filter + warna sendiri — react-leaflet's GeoJSON tidak reaktif ke
  // perubahan `data`/`filter` (cuma `style`), jadi tiap dusun dirender jadi
  // GeoJSON terpisah yang di-mount/unmount lewat kondisi, bukan lewat satu
  // GeoJSON besar yang di-filter di dalam.
  const bangunanPerDusun = useMemo(() => {
    if (!bangunan) return [];
    const kelompok = new Map<string, Feature[]>();
    for (const feature of bangunan.features) {
      const dusun = (feature.properties?.Dusun as string | undefined) ?? "Lainnya";
      if (!kelompok.has(dusun)) kelompok.set(dusun, []);
      kelompok.get(dusun)!.push(feature);
    }
    return [...kelompok.entries()]
      .sort(([a], [b]) => {
        const ia = URUTAN_DUSUN.indexOf(a);
        const ib = URUTAN_DUSUN.indexOf(b);
        if (ia === -1 && ib === -1) return a.localeCompare(b);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      })
      .map(([dusun, features]) => ({
        dusun,
        warna: WARNA_BANGUNAN_PER_DUSUN[dusun] ?? WARNA_BANGUNAN,
        data: { type: "FeatureCollection", features } as FeatureCollection,
      }));
  }, [bangunan]);

  const toggleDusun = (dusun: string) => {
    setDusunTersembunyi((prev) => {
      const next = new Set(prev);
      if (next.has(dusun)) {
        next.delete(dusun);
      } else {
        next.add(dusun);
      }
      return next;
    });
  };

  const peta = (
    <div
      className={
        isExpanded
          ? "fixed inset-0 z-[2000] isolate h-dvh w-screen bg-white"
          : "relative isolate h-full w-full bg-white"
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

      <div className="absolute top-3 right-3 z-[1000] flex max-w-[calc(100%-1.5rem)] flex-col items-end">
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
          } sm:mt-0 sm:flex sm:flex-col sm:items-end sm:gap-2`}
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
          {bangunanPerDusun.map(({ dusun, warna }) => (
            <FilterPill
              key={dusun}
              label="Bangunan"
              active={!dusunTersembunyi.has(dusun)}
              onClick={() => toggleDusun(dusun)}
              warna={warna}
              inactiveDotColor={warna}
            />
          ))}
          {fasilitasUmum && (
            <FilterPill
              label="Fasilitas Umum"
              active={tampilFasilitas}
              onClick={() => setTampilFasilitas((v) => !v)}
              activeClassName="border-[#C9A227] bg-[#C9A227] text-white shadow-[0_0_14px_rgba(201,162,39,0.5)]"
              inactiveDotColor={WARNA_FASILITAS}
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
            label="Wisata"
            active={tampilWisata}
            onClick={() => setTampilWisata((v) => !v)}
            activeClassName="border-[#F45B69] bg-[#F45B69] text-white shadow-[0_0_14px_rgba(244,91,105,0.55)]"
            inactiveDotColor={WARNA_WISATA}
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
        <FokusWisataDariQuery
          wisataBerkoordinat={wisataBerkoordinat}
          markerRefs={markerRefs}
        />
        <ZoomControl position="bottomright" />
        <TileLayer
          key={basemap}
          attribution={BASEMAP_OPTIONS[basemap].attribution}
          url={BASEMAP_OPTIONS[basemap].url}
          maxNativeZoom={BASEMAP_OPTIONS[basemap].maxNativeZoom}
        />
        {/* z-index eksplisit — lihat komentar PANE_* di atas */}
        <Pane name={PANE_KEC_SAMPOLAWA} style={{ zIndex: 401 }} />
        <Pane name={PANE_BATAS_DESA} style={{ zIndex: 402 }} />
        <Pane name={PANE_BANGUNAN} style={{ zIndex: 403 }} />
        <Pane name={PANE_FASILITAS_UMUM} style={{ zIndex: 404 }} />
        {tampilBatasWilayah && batasWilayah && (
          <GeoJSON
            key="batas-wilayah-sampolawa"
            pane={PANE_KEC_SAMPOLAWA}
            data={batasWilayah}
            style={{
              color: WARNA_BATAS_WILAYAH,
              weight: 2,
              dashArray: "6 4",
              fillColor: WARNA_BATAS_WILAYAH,
              fillOpacity: 0.05,
            }}
            onEachFeature={(feature, layer) => {
              const nama = feature.properties?.NAMOBJ ?? "Kec. Sampolawa";
              layer.bindTooltip(nama, { sticky: true });
            }}
          />
        )}
        {tampilBatasDesa && batasDesa && (
          <GeoJSON
            key="batas-desa-gerak-makmur"
            pane={PANE_BATAS_DESA}
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
        {bangunanPerDusun.map(
          ({ dusun, warna, data }) =>
            !dusunTersembunyi.has(dusun) && (
              <GeoJSON
                key={`bangunan-${dusun}`}
                pane={PANE_BANGUNAN}
                data={data}
                style={{
                  color: warna,
                  weight: 1,
                  fillColor: warna,
                  fillOpacity: 0.45,
                }}
                onEachFeature={(_feature, layer) => {
                  layer.bindTooltip(dusun, { sticky: true });
                }}
              />
            ),
        )}
        {tampilFasilitas && fasilitasUmum && (
          <GeoJSON
            key="fasilitas-umum-desa"
            pane={PANE_FASILITAS_UMUM}
            data={fasilitasUmum}
            style={{
              color: WARNA_FASILITAS,
              weight: 1.5,
              fillColor: WARNA_FASILITAS,
              fillOpacity: 0.4,
            }}
            onEachFeature={(feature, layer) => {
              const keterangan = feature.properties?.Keterangan ?? "Fasilitas Umum";
              layer.bindTooltip(keterangan, { sticky: true });
            }}
          />
        )}
        {tampilWisata &&
          wisataBerkoordinat.map((w) => (
            <Marker
              key={w.nama}
              position={[w.latitude, w.longitude]}
              icon={ikonWisata}
              ref={(instance) => {
                if (instance) markerRefs.current.set(slugify(w.nama), instance);
                else markerRefs.current.delete(slugify(w.nama));
              }}
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
      </MapContainer>
    </div>
  );

  return peta;
}

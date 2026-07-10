import { Reveal } from "@/components/ui/Reveal";
import { getStatistik } from "@/data/profil";
import { STATISTIK } from "@/app/profil/_data/profil";
import type { StatGroup, StatItem } from "@/types/profil";

/**
 * Desa dalam Angka (Gaya Baru) - infografis kependudukan mengikuti struktur
 * gayabaru-desa.com/infografis:
 *   1. Penduduk & Kepala Keluarga  : kartu angka
 *   2. Kelompok Umur               : bar horizontal
 *   3. Per Dusun                   : donut chart (populasi & KK)
 *   4. Tingkat Pendidikan          : bar vertikal
 *   5. Mata Pencaharian            : bar horizontal
 *   6. Agama                       : kartu angka
 * Data via `@/data/profil` (Supabase, fallback seed); angka diubah admin
 * lewat /admin/statistik. Palet chart tervalidasi (navy/oranye/biru muda).
 */

const NAVY = "#2E5E9E";
const ORANGE = "#D96F2F";
const LIGHT_BLUE = "#6D9FE8";
const PIE_COLORS = [NAVY, ORANGE, LIGHT_BLUE];

const fmt = new Intl.NumberFormat("id-ID");

function toNumber(value: string): number {
  const cleaned = value.replace(/[^\d]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/** Ambil grup dari DB; bila belum ada (seed baru belum dijalankan),
 *  fallback ke template statis agar halaman tetap lengkap. */
function findGroup(groups: StatGroup[], judul: string): StatItem[] {
  const fromDb = groups.find((g) => g.judul.toLowerCase() === judul.toLowerCase())?.items;
  if (fromDb && fromDb.length > 0) return fromDb;
  return STATISTIK.find((g) => g.judul === judul)?.items ?? [];
}

/* ── Sub judul blok ── */
function BlockTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <h3 className="shrink-0 font-body text-xl font-semibold text-[#31577F]">{children}</h3>
      <span className="h-px flex-1 bg-[#31577F]/15" aria-hidden />
    </div>
  );
}

/* ── Bar horizontal ── */
function HorizontalBars({ items, color }: { items: StatItem[]; color: string }) {
  const max = Math.max(1, ...items.map((i) => toNumber(i.value)));
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item) => {
        const n = toNumber(item.value);
        return (
          <div
            key={item.label}
            title={`${item.label}: ${fmt.format(n)} jiwa`}
            className="grid grid-cols-[110px_1fr_56px] items-center gap-3 sm:grid-cols-[170px_1fr_64px]"
          >
            <span className="truncate font-body text-sm text-[#2E2E2E]">{item.label}</span>
            <span className="h-4 w-full overflow-hidden rounded-[4px] bg-[#E9EEF5]">
              <span
                className="block h-full rounded-r-[4px]"
                style={{ width: `${Math.max(1, (n / max) * 100)}%`, backgroundColor: color }}
              />
            </span>
            <span className="text-right font-body text-sm font-semibold text-[#1F3A59]">
              {fmt.format(n)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Bar vertikal ── */
function VerticalBars({ items }: { items: StatItem[] }) {
  const max = Math.max(1, ...items.map((i) => toNumber(i.value)));
  return (
    <div className="flex h-56 items-end gap-2 sm:gap-3">
      {items.map((item) => {
        const n = toNumber(item.value);
        return (
          <div
            key={item.label}
            title={`${item.label}: ${fmt.format(n)} jiwa`}
            className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
          >
            <span className="font-body text-xs font-semibold text-[#1F3A59]">
              {fmt.format(n)}
            </span>
            <span
              className="w-full max-w-[44px] rounded-t-[4px] bg-[#2E5E9E]"
              style={{ height: `${Math.max(2, (n / max) * 100)}%` }}
            />
            <span className="min-h-[2rem] text-center font-body text-[11px] leading-tight text-[#5A5A5A]">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Donut chart (SVG) ── */
function Donut({ items, unit }: { items: StatItem[]; unit: string }) {
  const values = items.map((i) => toNumber(i.value));
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const R = 15.9155; // keliling ≈ 100 → dasharray bisa ditulis dalam persen
  let offset = 25; // mulai dari jam 12

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-44 w-44">
        <svg viewBox="0 0 42 42" className="h-full w-full">
          {values.map((v, i) => {
            const pct = (v / total) * 100;
            const seg = (
              <circle
                key={items[i].label}
                cx="21"
                cy="21"
                r={R}
                fill="transparent"
                stroke={PIE_COLORS[i % PIE_COLORS.length]}
                strokeWidth="7"
                strokeDasharray={`${pct} ${100 - pct}`}
                strokeDashoffset={offset}
              >
                <title>{`${items[i].label}: ${fmt.format(v)} ${unit}`}</title>
              </circle>
            );
            offset -= pct;
            return seg;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-body text-2xl font-bold text-[#1F3A59]">
            {fmt.format(total)}
          </span>
          <span className="font-body text-xs text-[#5A5A5A]">{unit}</span>
        </div>
      </div>
      <ul className="flex w-full flex-col gap-1.5">
        {items.map((item, i) => {
          const n = toNumber(item.value);
          return (
            <li
              key={item.label}
              className="flex items-center gap-2 font-body text-sm text-[#2E2E2E]"
            >
              <span
                className="h-3 w-3 shrink-0 rounded-[3px]"
                style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                aria-hidden
              />
              <span className="flex-1">{item.label}</span>
              <span className="font-semibold text-[#1F3A59]">{fmt.format(n)}</span>
              <span className="w-12 text-right text-xs text-[#5A5A5A]">
                {((n / total) * 100).toFixed(1)}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export async function StatistikDesa() {
  const statistik = await getStatistik();

  const penduduk = findGroup(statistik, "Penduduk & Kepala Keluarga");
  const umur = findGroup(statistik, "Kelompok Umur");
  const popDusun = findGroup(statistik, "Populasi per Dusun");
  const kkDusun = findGroup(statistik, "KK per Dusun");
  const pendidikan = findGroup(statistik, "Tingkat Pendidikan");
  const pencaharian = findGroup(statistik, "Mata Pencaharian");
  const agama = findGroup(statistik, "Agama");

  return (
    <section
      id="statistik"
      aria-label="Statistik desa"
      className="bg-white px-5 py-16 sm:px-8 lg:py-24"
    >
      <div className="mx-auto flex w-full max-w-[1112px] flex-col gap-12">
        <Reveal>
          <div className="flex flex-col items-start gap-4">
            <span className="flex items-center gap-3 font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#31577F]">
              <span className="h-[3px] w-[42px] bg-[#31577F]" aria-hidden />
              Data Desa
            </span>
            <h2 className="font-body text-[clamp(2rem,4vw,3rem)] font-semibold text-[#31577F]">
              Desa dalam Angka
            </h2>
          </div>
        </Reveal>

        {/* 1 ── Penduduk & Kepala Keluarga */}
        {penduduk.length > 0 && (
          <Reveal>
            <div className="flex flex-col gap-6">
              <BlockTitle>Jumlah Penduduk &amp; Kepala Keluarga</BlockTitle>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {penduduk.map((item, i) => (
                  <div
                    key={item.label}
                    className={`rounded-xl p-5 ${
                      i === 0 ? "bg-[#31577F] text-white" : "bg-[#E9EEF5] text-[#1F3A59]"
                    }`}
                  >
                    <p className="font-body text-3xl font-bold sm:text-4xl">{item.value}</p>
                    <p
                      className={`mt-1 font-body text-sm ${
                        i === 0 ? "text-white/80" : "text-[#5A5A5A]"
                      }`}
                    >
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* 2 ── Kelompok umur */}
        {umur.length > 0 && (
          <Reveal>
            <div className="flex flex-col gap-6">
              <BlockTitle>Berdasarkan Kelompok Umur</BlockTitle>
              <div className="rounded-xl border border-[#D0D0D0] p-5 sm:p-6">
                <HorizontalBars items={umur} color={NAVY} />
              </div>
            </div>
          </Reveal>
        )}

        {/* 3 ── Per dusun (dua donut) */}
        {(popDusun.length > 0 || kkDusun.length > 0) && (
          <Reveal>
            <div className="flex flex-col gap-6">
              <BlockTitle>Berdasarkan Dusun</BlockTitle>
              <div className="grid gap-6 md:grid-cols-2">
                {popDusun.length > 0 && (
                  <div className="rounded-xl border border-[#D0D0D0] p-5 sm:p-6">
                    <p className="mb-4 font-body text-sm font-semibold text-[#2E2E2E]">
                      Populasi per Dusun
                    </p>
                    <Donut items={popDusun} unit="jiwa" />
                  </div>
                )}
                {kkDusun.length > 0 && (
                  <div className="rounded-xl border border-[#D0D0D0] p-5 sm:p-6">
                    <p className="mb-4 font-body text-sm font-semibold text-[#2E2E2E]">
                      Kepala Keluarga per Dusun
                    </p>
                    <Donut items={kkDusun} unit="KK" />
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        )}

        {/* 4 ── Tingkat pendidikan */}
        {pendidikan.length > 0 && (
          <Reveal>
            <div className="flex flex-col gap-6">
              <BlockTitle>Berdasarkan Tingkat Pendidikan</BlockTitle>
              <div className="overflow-x-auto rounded-xl border border-[#D0D0D0] p-5 sm:p-6">
                <div className="min-w-[560px]">
                  <VerticalBars items={pendidikan} />
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* 5 ── Mata pencaharian */}
        {pencaharian.length > 0 && (
          <Reveal>
            <div className="flex flex-col gap-6">
              <BlockTitle>Berdasarkan Mata Pencaharian</BlockTitle>
              <div className="rounded-xl border border-[#D0D0D0] p-5 sm:p-6">
                <HorizontalBars items={pencaharian} color={ORANGE} />
              </div>
            </div>
          </Reveal>
        )}

        {/* 6 ── Agama */}
        {agama.length > 0 && (
          <Reveal>
            <div className="flex flex-col gap-6">
              <BlockTitle>Berdasarkan Agama</BlockTitle>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {agama.map((item) => (
                  <div key={item.label} className="rounded-xl bg-[#FBEADD] p-4">
                    <p className="font-body text-2xl font-bold text-[#7A430F]">{item.value}</p>
                    <p className="mt-0.5 font-body text-sm text-[#5A5A5A]">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

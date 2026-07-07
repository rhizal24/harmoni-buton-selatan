interface PaginationProps {
  /** Halaman aktif (1-based) */
  page: number;
  /** Jumlah halaman */
  count: number;
  onChange: (page: number) => void;
  className?: string;
}

function ArrowIcon({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
      className={flip ? "rotate-180" : ""}
    >
      <path
        d="M22.499 12.85a.9.9 0 0 1 .57.205l.067.06a.9.9 0 0 1 .06 1.206l-.06.066-5.585 5.586-.028.027.028.027 5.585 5.587a.9.9 0 0 1 .06 1.207l-.06.066a.9.9 0 0 1-1.207.06l-.066-.06-6.25-6.25a1 1 0 0 1-.158-.212l-.038-.08a.9.9 0 0 1-.03-.606l.03-.083a1 1 0 0 1 .137-.226l.06-.066 6.25-6.25a.9.9 0 0 1 .635-.263Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth=".078"
      />
    </svg>
  );
}

/**
 * Pagination — kontrol halaman (prev/next + nomor). Terkontrol penuh lewat
 * props `page`, `count`, `onChange`. Warna mengikuti tosca design system.
 */
export function Pagination({
  page,
  count,
  onChange,
  className = "",
}: PaginationProps) {
  const arrowBase =
    "flex items-center justify-center rounded-full bg-[#006572]/10 text-[#006572] motion-safe:transition-colors hover:bg-[#006572]/20 disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav
      aria-label="Navigasi galeri"
      className={`mx-auto flex w-full max-w-80 items-center justify-between font-medium text-[#006572] ${className}`}
    >
      <button
        type="button"
        aria-label="Halaman sebelumnya"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className={arrowBase}
      >
        <ArrowIcon />
      </button>

      <div className="flex items-center gap-2 text-sm font-medium">
        {Array.from({ length: count }, (_, i) => i + 1).map((n) => {
          const active = n === page;
          return (
            <button
              key={n}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onChange(n)}
              className={`flex aspect-square h-10 w-10 items-center justify-center rounded-full motion-safe:transition-colors ${
                active
                  ? "border border-[#006572]/40 text-[#006572]"
                  : "text-[#006572]/60 hover:text-[#006572]"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        aria-label="Halaman berikutnya"
        onClick={() => onChange(page + 1)}
        disabled={page >= count}
        className={arrowBase}
      >
        <ArrowIcon flip />
      </button>
    </nav>
  );
}

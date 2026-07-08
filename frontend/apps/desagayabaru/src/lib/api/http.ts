import { API_BASE_URL, DEFAULT_REVALIDATE } from "./config";

/**
 * Error HTTP dari backend — membawa status code untuk penanganan di pemanggil
 * (mis. 404 → notFound()).
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiFetchOptions {
  /** Revalidate (detik) untuk cache Next.js. `false` = selalu segar (no-store). */
  revalidate?: number | false;
  /** Bearer token untuk endpoint ber-auth (dashboard admin). */
  token?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
}

/**
 * Pembungkus tipis di atas `fetch` untuk memanggil backend.
 *
 * - Gabungkan `API_BASE_URL` + `path` (path diawali "/").
 * - Set header JSON + Authorization bila ada token.
 * - `fetch` Next.js TIDAK di-cache secara default (lihat docs 06-fetching-data),
 *   jadi cache diatur eksplisit lewat `next.revalidate`.
 * - Lempar `ApiError` yang informatif saat respons non-2xx.
 */
export async function apiFetch<T>(
  path: string,
  { revalidate = DEFAULT_REVALIDATE, token, method = "GET", body }: ApiFetchOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    next: revalidate === false ? undefined : { revalidate },
    cache: revalidate === false ? "no-store" : undefined,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = (await res.json()) as { message?: string; error?: string };
      detail = data.message ?? data.error ?? detail;
    } catch {
      /* respons tanpa body JSON — pakai statusText */
    }
    throw new ApiError(res.status, `${method} ${path} → ${res.status}: ${detail}`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

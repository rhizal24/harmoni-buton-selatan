"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Reveal } from "@/components/ui/Reveal";
import type { Anggota } from "@/types/profil";

const NODE_W = 210;
const COL_W = 250; // jarak antar-kolom (leaf)
const ROW_H = 300; // jarak antar-tingkat

type AnggotaData = {
  jabatan: string;
  nama: string;
  foto?: string;
  root: boolean;
};
type AnggotaNode = Node<AnggotaData, "anggota">;

/** Inisial dari nama untuk avatar placeholder (mis. "La Ode Arlan" → "LA"). */
function initials(nama: string) {
  const bersih = nama.replace(/[.,—]/g, "").trim();
  if (!bersih) return "—";
  return bersih
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Node kartu perangkat — foto/inisial + jabatan + nama. Root di-highlight. */
function AnggotaNodeCard({ data }: NodeProps<AnggotaNode>) {
  return (
    <div
      style={{ width: NODE_W }}
      className={`overflow-hidden rounded-lg bg-white text-center ${
        data.root
          ? "border-2 border-[#006572] shadow-card-hover"
          : "border border-[#006572]/20"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-0 !bg-[#006572]"
      />

      <div className="flex aspect-[4/3] items-center justify-center bg-[#f6fafb]">
        {data.foto ? (
          <img
            src={data.foto}
            alt={`${data.jabatan} — ${data.nama}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-body text-3xl font-semibold text-[#006572]/40">
            {initials(data.nama)}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-0.5 px-3 py-3">
        <h3 className="font-body text-sm font-bold leading-tight text-[#006572]">
          {data.jabatan}
        </h3>
        <p className="font-body text-xs leading-snug text-[#006572]/70">
          {data.nama}
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-0 !bg-[#006572]"
      />
    </div>
  );
}

// Didefinisikan di luar komponen agar identitasnya stabil (syarat React Flow).
const nodeTypes = { anggota: AnggotaNodeCard };

/** Tidy-tree layout: leaf dipak berurutan, tiap induk di-tengah anak-anaknya. */
function computeLayout(data: Anggota[]) {
  const childrenOf = new Map<string, string[]>();
  let rootId = data[0]?.id ?? "";
  for (const a of data) {
    if (a.parent) {
      childrenOf.set(a.parent, [...(childrenOf.get(a.parent) ?? []), a.id]);
    } else {
      rootId = a.id;
    }
  }

  const pos = new Map<string, { x: number; y: number }>();
  let leaf = 0;
  const walk = (id: string, depth: number): number => {
    const kids = childrenOf.get(id) ?? [];
    const y = depth * ROW_H;
    if (kids.length === 0) {
      const x = leaf * COL_W;
      leaf += 1;
      pos.set(id, { x, y });
      return x;
    }
    const xs = kids.map((k) => walk(k, depth + 1));
    const x = (xs[0] + xs[xs.length - 1]) / 2;
    pos.set(id, { x, y });
    return x;
  };
  walk(rootId, 0);
  return pos;
}

/** Kanvas bagan React Flow — dipakai ulang di kotak inline & modal layar penuh. */
function OrgChart({ nodes, edges }: { nodes: AnggotaNode[]; edges: Edge[] }) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.18 }}
      minZoom={0.2}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      zoomOnScroll={false}
      preventScrolling={false}
      defaultEdgeOptions={{
        type: "smoothstep",
        style: { stroke: "#006572", strokeWidth: 1.5 },
      }}
      proOptions={{ hideAttribution: true }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={22}
        size={1.5}
        color="#00657222"
      />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

function MaximizeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

/**
 * Struktur Organisasi — bagan perangkat desa interaktif (React Flow). Layout
 * hierarki dihitung otomatis dari `parent` di `../_data/struktur`. Responsif:
 * `fitView` menyesuaikan bagan ke kontainer. Tombol layar-penuh membuka bagan
 * dalam modal pop-up (tutup: tombol ×, Esc, atau klik latar). Scroll roda tetap
 * menggulung halaman.
 */
export function StrukturOrganisasi({ data }: { data: Anggota[] }) {
  const [open, setOpen] = useState(false);

  const { nodes, edges } = useMemo(() => {
    const pos = computeLayout(data);
    const rootId = data.find((a) => !a.parent)?.id;
    const flowNodes: AnggotaNode[] = data.map((a) => ({
      id: a.id,
      type: "anggota",
      position: pos.get(a.id) ?? { x: 0, y: 0 },
      data: {
        jabatan: a.jabatan,
        nama: a.nama,
        foto: a.foto,
        root: a.id === rootId,
      },
      draggable: false,
    }));
    const flowEdges: Edge[] = data.filter((a) => a.parent).map((a) => ({
      id: `${a.parent}-${a.id}`,
      source: a.parent as string,
      target: a.id,
    }));
    return { nodes: flowNodes, edges: flowEdges };
  }, [data]);

  // Kunci scroll body + tutup dengan Esc selama modal terbuka.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <section
      id="struktur"
      aria-label="Struktur organisasi desa"
      className="bg-[#f6fafb] px-5 py-16 sm:px-8 lg:py-24"
    >
      <div className="mx-auto flex w-full max-w-[1112px] flex-col gap-6">
        <Reveal>
          <div className="flex flex-col items-start gap-4">
            <span className="flex items-center gap-3 font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#006572]">
              <span className="h-[3px] w-[42px] bg-[#006572]" aria-hidden />
              Pemerintahan
            </span>
            <h2 className="font-body text-[clamp(2rem,4vw,3rem)] font-semibold text-[#006572]">
              Struktur Organisasi
            </h2>
            <p className="max-w-[46rem] font-body text-lg leading-relaxed text-[#006572]/80">
              Susunan perangkat Desa Gerak Makmur dan alur koordinasinya —
              dari Kepala Desa hingga kepala dusun.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative h-[520px] w-full overflow-hidden rounded-xl border border-[#006572]/20 bg-white sm:h-[620px]">
            <OrgChart nodes={nodes} edges={edges} />

            {/* Tombol layar penuh */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-md border border-[#006572]/25 bg-white/90 px-3 py-2 font-body text-xs font-semibold text-[#006572] shadow-sm backdrop-blur-sm motion-safe:transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-[#006572] focus-visible:outline-offset-2"
            >
              <MaximizeIcon />
              Layar Penuh
            </button>
          </div>
        </Reveal>

        <p className="font-body text-sm text-[#006572]/60">
          Geser untuk menjelajah bagan; gunakan tombol +/− atau cubit untuk
          memperbesar, atau buka Layar Penuh.
        </p>
      </div>

      {/* Modal pop-up layar penuh */}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Struktur Organisasi Desa Gerak Makmur"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4 pb-4 pt-[104px] backdrop-blur-sm motion-safe:animate-gallery-fade sm:px-6 sm:pb-6"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative h-[80vh] max-h-[calc(100dvh-8rem)] w-full max-w-[1720px] overflow-hidden rounded-xl border border-[#006572]/20 bg-white shadow-floating"
            >
              <OrgChart nodes={nodes} edges={edges} />

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup layar penuh"
                className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#006572]/25 bg-white/90 text-[#006572] shadow-sm backdrop-blur-sm motion-safe:transition-colors hover:bg-[#006572] hover:text-white focus-visible:outline-2 focus-visible:outline-[#006572] focus-visible:outline-offset-2"
              >
                <CloseIcon />
              </button>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}

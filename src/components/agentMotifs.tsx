import { motion, useReducedMotion, type Variants } from 'framer-motion';

/**
 * Instrument-panel motifs for the "How I work with agents" section. Each is a
 * small, self-contained SVG diagram that illustrates one pillar of the workflow:
 *
 *   GraphMotif    — a knowledge graph with one call chain traced in coral
 *   ContractMotif — an OpenAPI request fanning into property-based response cases
 *   HarnessMotif  — any schema plugged into one reusable Schemathesis runner
 *
 * Motifs are decorative (the copy carries the meaning), so the section marks
 * them `aria-hidden`. On-view reveals stagger via framer-motion variants and
 * collapse to their final frame under `prefers-reduced-motion`. The little
 * code-ish captions (trace_path(), 142 cases, openapi.json) are technical
 * tokens that read the same across locales, so they live here, not in i18n.
 */

const ease = [0.22, 1, 0.36, 1] as const;

// Palette — mirrors the @theme tokens in index.css.
const INK = '#1A1A1A';
const CORAL = '#FF6B6B';
const TEAL = '#0F766E';
const TEAL_BRIGHT = '#00D9A3';
const PANEL = '#FFF8F3'; // cream-50, so node/chip fills sit on the panel

const group: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
};
const draw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 0.8, ease }, opacity: { duration: 0.25 } },
  },
};
const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
};

type Pt = readonly [number, number];

const svgProps = {
  viewBox: '0 0 240 150',
  className: 'w-full h-full',
  fill: 'none' as const,
  variants: group,
  whileInView: 'show' as const,
  viewport: { once: true, margin: '-60px' } as const,
};

const useInitial = () => (useReducedMotion() ? 'show' : 'hidden');

const mono = { fontFamily: 'var(--font-mono)' } as const;

/** 01 — Project indexing: a graph whose one lit path is a traced call chain. */
export const GraphMotif = () => {
  const initial = useInitial();
  const N: Record<string, Pt> = {
    A: [34, 60], B: [98, 34], C: [84, 112], D: [152, 78], E: [146, 120], F: [210, 50], G: [206, 108],
  };
  const seg = (p: Pt, q: Pt) => `M${p[0]} ${p[1]} L${q[0]} ${q[1]}`;
  const faint: [Pt, Pt][] = [[N.A, N.C], [N.B, N.D], [N.C, N.D], [N.C, N.E], [N.D, N.G], [N.E, N.G], [N.B, N.C]];
  const traced: [Pt, Pt][] = [[N.A, N.B], [N.B, N.D], [N.D, N.F]];
  const tracedNodes: Pt[] = [N.A, N.B, N.D, N.F];
  const idleNodes: Pt[] = [N.C, N.E, N.G];

  return (
    <motion.svg {...svgProps} initial={initial}>
      {faint.map((e, i) => (
        <motion.path key={`f${i}`} d={seg(e[0], e[1])} stroke={INK} strokeOpacity={0.16} strokeWidth={1.25} variants={draw} />
      ))}
      {traced.map((e, i) => (
        <motion.path key={`t${i}`} d={seg(e[0], e[1])} stroke={CORAL} strokeWidth={1.75} strokeLinecap="round" variants={draw} />
      ))}
      {idleNodes.map((n, i) => (
        <motion.circle key={`i${i}`} cx={n[0]} cy={n[1]} r={4} fill={PANEL} stroke={INK} strokeOpacity={0.3} strokeWidth={1.25} variants={fade} />
      ))}
      {tracedNodes.map((n, i) => (
        <motion.circle key={`c${i}`} cx={n[0]} cy={n[1]} r={5} fill={CORAL} variants={fade} />
      ))}
      <motion.text variants={fade} x={14} y={140} style={mono} fontSize={9} fill={INK} fillOpacity={0.4}>
        trace_path()
      </motion.text>
    </motion.svg>
  );
};

/** 02 — Schemathesis: one request fanning into generated response cases, one 500 caught. */
type Row = {
  y: number;
  code: string;
  dot: string;
  dotOp: number;
  codeFill: string;
  mark: string;
  markFill: string;
  bug?: boolean;
};

export const ContractMotif = () => {
  const initial = useInitial();
  const rows: Row[] = [
    { y: 30, code: '200', dot: TEAL_BRIGHT, dotOp: 1, codeFill: INK, mark: '✓', markFill: TEAL },
    { y: 63, code: '422', dot: INK, dotOp: 0.4, codeFill: INK, mark: '', markFill: INK },
    { y: 96, code: '500', dot: CORAL, dotOp: 1, codeFill: CORAL, mark: '✕', markFill: CORAL, bug: true },
  ];

  return (
    <motion.svg {...svgProps} initial={initial}>
      {/* request pill */}
      <motion.g variants={rise}>
        <rect x={12} y={58} width={92} height={30} rx={7} fill={PANEL} stroke={INK} strokeOpacity={0.2} />
        <circle cx={26} cy={73} r={3} fill={TEAL} />
        <text x={36} y={77} style={mono} fontSize={10} fill={INK} fillOpacity={0.75}>GET /acct</text>
      </motion.g>
      {/* branch connectors: one request → many cases */}
      {rows.map((r, i) => (
        <motion.path key={`b${i}`} d={`M104 73 C120 73 120 ${r.y + 12} 134 ${r.y + 12}`} stroke={INK} strokeOpacity={0.18} strokeWidth={1.25} variants={draw} />
      ))}
      {/* response rows */}
      {rows.map((r, i) => (
        <motion.g key={`r${i}`} variants={rise}>
          <rect x={134} y={r.y} width={94} height={24} rx={6} fill={PANEL} stroke={r.bug ? CORAL : INK} strokeOpacity={r.bug ? 0.5 : 0.16} />
          <circle cx={148} cy={r.y + 12} r={3.5} fill={r.dot} fillOpacity={r.dotOp} />
          <text x={160} y={r.y + 16} style={mono} fontSize={10} fill={r.codeFill} fillOpacity={r.bug ? 1 : 0.8}>{r.code}</text>
          {r.mark && <text x={r.bug ? 208 : 210} y={r.y + 16} style={mono} fontSize={10} fill={r.markFill}>{r.mark}</text>}
        </motion.g>
      ))}
      {/* counters */}
      <motion.text variants={fade} x={12} y={112} style={mono} fontSize={9} fill={INK} fillOpacity={0.45}>142 cases</motion.text>
      <motion.text variants={fade} x={12} y={126} style={mono} fontSize={9} fill={CORAL}>1 contract bug</motion.text>
    </motion.svg>
  );
};

/** 03 — Harness: any OpenAPI schema plugged into one reusable runner. */
export const HarnessMotif = () => {
  const initial = useInitial();
  const results = [
    { y: 44, mark: '✓', color: TEAL, label: '2xx' },
    { y: 66, mark: '✓', color: TEAL, label: '4xx' },
    { y: 88, mark: '✕', color: CORAL, label: '5xx' },
  ] as const;

  return (
    <motion.svg {...svgProps} initial={initial}>
      {/* stacked schema chips imply "any API" */}
      <motion.g variants={rise}>
        <rect x={22} y={52} width={74} height={30} rx={7} fill="none" stroke={INK} strokeOpacity={0.12} />
        <rect x={18} y={48} width={74} height={30} rx={7} fill="none" stroke={INK} strokeOpacity={0.18} />
        <rect x={14} y={44} width={74} height={30} rx={7} fill={PANEL} stroke={INK} strokeOpacity={0.3} />
        <text x={24} y={62} style={mono} fontSize={9} fill={CORAL} fillOpacity={0.85}>{'{ }'}</text>
        <text x={24} y={73} style={mono} fontSize={8.5} fill={INK} fillOpacity={0.7}>openapi.json</text>
      </motion.g>
      {/* connectors + harness box */}
      <motion.path d="M92 59 L118 59" stroke={INK} strokeOpacity={0.25} strokeWidth={1.25} variants={draw} />
      <motion.g variants={rise}>
        <rect x={120} y={44} width={46} height={30} rx={8} fill={PANEL} stroke={CORAL} strokeOpacity={0.55} />
        <text x={130} y={63} style={mono} fontSize={9} fill={CORAL}>▶ run</text>
      </motion.g>
      <motion.path d="M166 59 L184 59" stroke={INK} strokeOpacity={0.25} strokeWidth={1.25} variants={draw} />
      {/* results */}
      {results.map((r, i) => (
        <motion.g key={`res${i}`} variants={rise}>
          <text x={188} y={r.y} style={mono} fontSize={10} fill={r.color}>{r.mark}</text>
          <text x={201} y={r.y} style={mono} fontSize={9} fill={INK} fillOpacity={0.6}>{r.label}</text>
        </motion.g>
      ))}
      {/* contract coverage bar */}
      <motion.g variants={fade}>
        <text x={14} y={112} style={mono} fontSize={8.5} fill={INK} fillOpacity={0.45}>contract coverage</text>
        <text x={202} y={112} style={mono} fontSize={8.5} fill={TEAL}>88%</text>
        <rect x={14} y={118} width={212} height={7} rx={3.5} fill={INK} fillOpacity={0.08} />
        <motion.rect
          x={14}
          y={118}
          height={7}
          rx={3.5}
          fill={TEAL_BRIGHT}
          variants={{ hidden: { width: 0 }, show: { width: 187, transition: { duration: 0.9, ease, delay: 0.2 } } }}
        />
      </motion.g>
    </motion.svg>
  );
};

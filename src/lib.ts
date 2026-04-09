// ── chartli library entry ──
//
// This module is the *programmatic* (non-CLI) entry point for chartli.
// It is intentionally side-effect free: importing this file must not
// touch `process.argv`, write to stdout, or register any commands.
// That is what `src/index.ts` (the CLI) is for.
//
// Consumers can either:
//   1. Import everything from the package root:
//        import { renderAscii, normalizeData } from 'chartli';
//   2. Import a single chart renderer via a subpath export:
//        import { renderSvg } from 'chartli/svg';
//
// The subpath form keeps tree-shaking friendly bundles small for users
// who only need one chart type. The mapping lives in `package.json`
// under the `exports` field.
//
// Node's subpath exports docs:
//   https://nodejs.org/api/packages.html#subpath-exports

// ── Data preparation ──
// `parseChartInput` turns a whitespace/CSV-ish text blob into rows + headers.
// `normalizeData` rescales each column into the [0, 1] range that every
// renderer expects as input via the `normalized` argument.
export {
	parseChartInput,
	normalizeData,
	type ParsedChartInput,
	type NormalizeResult,
} from './utils/normalize.js';

// ── Shared annotation types/helpers ──
// `ChartAnnotations` is the common option shape (axis labels, x labels,
// series labels, showDataLabels) accepted by every renderer.
export {
	type ChartAnnotations,
	formatValue,
	normalizeLabels,
} from './utils/chart-annotations.js';

// ── Renderers ──
// Each renderer takes `{ normalized, options }` and returns a string
// (either terminal output or, in the case of `renderSvg`, an SVG document).
export { renderAscii, type AsciiOptions } from './utils/ascii.js';
export { renderUnicode, type UnicodeOptions } from './utils/unicode.js';
export { renderBraille, type BrailleOptions } from './utils/braille.js';
export { renderSpark } from './utils/spark.js';
export { renderBars, type BarsOptions } from './utils/bars.js';
export { renderColumns, type ColumnsOptions } from './utils/columns.js';
export { renderHeatmap } from './utils/heatmap.js';
export { renderSvg, type SvgOptions } from './utils/svg.js';

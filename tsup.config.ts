import { defineConfig } from 'tsup';

// We produce two distinct bundles from one tsup invocation:
//
//   1. The CLI (`src/index.ts`) — needs a `#!/usr/bin/env node` shebang
//      so it can be invoked via the `chartli` bin entry. It does NOT
//      ship `.d.ts` files because nobody imports the CLI as a module.
//
//   2. The library (`src/lib.ts` + each per-renderer entry under
//      `src/utils/*.ts`) — must NOT have a shebang (some bundlers and
//      Deno's `npm:` shim get confused by stray shebangs in library
//      modules) and SHOULD ship `.d.ts` files for TypeScript consumers.
//
// tsup accepts an array of configs, each built independently, which is
// how we get different `banner` / `dts` settings per bundle.
//   https://tsup.egoist.dev/#multiple-entrypoints

// ── Entries exposed as subpath imports (e.g. `chartli/ascii`) ──
// Keep this list in sync with the `exports` map in `package.json`.
const libraryEntries = {
	// Barrel export — `import { renderAscii } from 'chartli'`
	lib: 'src/lib.ts',
	// Per-chart-type entries — `import { renderAscii } from 'chartli/ascii'`
	ascii: 'src/utils/ascii.ts',
	unicode: 'src/utils/unicode.ts',
	braille: 'src/utils/braille.ts',
	spark: 'src/utils/spark.ts',
	bars: 'src/utils/bars.ts',
	columns: 'src/utils/columns.ts',
	heatmap: 'src/utils/heatmap.ts',
	svg: 'src/utils/svg.ts',
	// Shared helpers consumers may want directly
	normalize: 'src/utils/normalize.ts',
	'chart-annotations': 'src/utils/chart-annotations.ts',
};

export default defineConfig([
	// ── CLI bundle ──
	{
		entry: { index: 'src/index.ts' },
		format: ['esm'],
		target: 'node18',
		clean: true,
		// Shebang only on the CLI bundle. The CLI is the file referenced
		// by `bin.chartli` in package.json.
		banner: { js: '#!/usr/bin/env node' },
	},
	// ── Library bundle ──
	{
		entry: libraryEntries,
		format: ['esm'],
		target: 'node18',
		// Don't `clean` here — that would wipe the CLI build above, since
		// tsup runs the configs in parallel/sequence into the same dist.
		clean: false,
		// Emit `.d.ts` so TS/Deno consumers get full type info.
		// Ref: https://tsup.egoist.dev/#generate-declaration-file
		dts: true,
		// Don't bundle dependencies into the library — let the consumer's
		// package manager dedupe them.
		sourcemap: true,
	},
]);

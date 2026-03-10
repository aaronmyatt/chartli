import { type ChartAnnotations, centerText } from './chart-annotations.js';
import { type NormalizeResult } from './normalize.js';

const SHADES = [' ', '░', '▒', '▓', '█'] as const;

function toShade(value: number): string {
	const clamped = Math.max(0, Math.min(1, value));
	const idx = Math.round(clamped * (SHADES.length - 1));
	return SHADES[idx] ?? ' ';
}

export function renderHeatmap({
	normalized,
	options,
}: {
	normalized: NormalizeResult;
	options?: ChartAnnotations;
}): string {
	const { data } = normalized;
	const numCols = data[0]?.length ?? 0;

	if (numCols === 0) return '';

	const labels = options?.seriesLabels ?? [];
	const header = `    ${Array.from({ length: numCols }, (_, i) => labels[i] ?? `C${i + 1}`).join(' ')}`;
	const rows = data.map((row, rowIdx) => {
		const cells = row.map((v) => toShade(v)).join(' ');
		const rowLabel =
			options?.xLabels?.[rowIdx] ?? `R${String(rowIdx + 1).padStart(2, '0')}`;
		return `${rowLabel.padEnd(3)} ${cells}`;
	});

	const lines = [header, ...rows];

	if (options?.yAxisLabel) {
		lines.unshift(options.yAxisLabel);
	}

	if (options?.xAxisLabel) {
		lines.push(centerText(options.xAxisLabel, header.length));
	}

	return lines.join('\n');
}

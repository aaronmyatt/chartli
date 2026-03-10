import {
	type ChartAnnotations,
	centerText,
	formatValue,
} from './chart-annotations.js';
import { type NormalizeResult } from './normalize.js';

export interface BarsOptions extends ChartAnnotations {
	readonly width?: number;
}

const BAR_CHARS = ['█', '▓', '▒', '░', '■', '□'] as const;

export function renderBars({
	normalized,
	options,
}: {
	normalized: NormalizeResult;
	options?: BarsOptions;
}): string {
	const width = options?.width ?? 28;
	const { data, raw } = normalized;
	const numCols = data[0]?.length ?? 0;
	const lastRow = data[data.length - 1] ?? [];
	const rawLastRow = raw[raw.length - 1] ?? [];

	if (numCols === 0) return '';

	const labels = options?.seriesLabels ?? [];
	const labelWidth = Math.max(
		0,
		...Array.from({ length: numCols }, (_, colIdx) =>
			(labels[colIdx] ?? `S${colIdx + 1}`).length,
		),
	);
	const formattedValues = Array.from({ length: numCols }, (_, colIdx) =>
		options?.showDataLabels
			? formatValue(rawLastRow[colIdx] ?? 0)
			: Math.max(0, Math.min(1, lastRow[colIdx] ?? 0)).toFixed(2),
	);
	const lines = Array.from({ length: numCols }, (_, colIdx) => {
		const value = Math.max(0, Math.min(1, lastRow[colIdx] ?? 0));
		const units = Math.round(value * width);
		const char = BAR_CHARS[colIdx % BAR_CHARS.length] ?? '█';
		const bar = char.repeat(units).padEnd(width, ' ');
		const label = labels[colIdx] ?? `S${colIdx + 1}`;
		const dataLabel = formattedValues[colIdx] ?? value.toFixed(2);
		return `${label.padEnd(labelWidth)} |${bar}| ${dataLabel}`;
	});

	if (options?.yAxisLabel) {
		lines.unshift(options.yAxisLabel);
	}

	if (options?.xAxisLabel) {
		const chartLineWidth =
			labelWidth +
			3 +
			width +
			3 +
			Math.max(...formattedValues.map((value) => value.length));
		lines.push(centerText(options.xAxisLabel, Math.max(chartLineWidth, options.xAxisLabel.length)));
	}

	return lines.join('\n');
}

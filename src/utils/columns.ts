import {
	type ChartAnnotations,
	centerText,
	formatValue,
} from './chart-annotations.js';
import { type NormalizeResult } from './normalize.js';

export interface ColumnsOptions extends ChartAnnotations {
	readonly height?: number;
}

const COLUMN_CHARS = ['█', '▓', '▒', '░', '■', '□'] as const;

export function renderColumns({
	normalized,
	options,
}: {
	normalized: NormalizeResult;
	options?: ColumnsOptions;
}): string {
	const height = options?.height ?? 8;
	const { data, raw } = normalized;
	const numCols = data[0]?.length ?? 0;
	const lastRow = data[data.length - 1] ?? [];
	const rawLastRow = raw[raw.length - 1] ?? [];

	if (numCols === 0) return '';

	const labels =
		options?.seriesLabels ??
		Array.from({ length: numCols }, (_, index) => String(index + 1));
	const valueLabels = options?.showDataLabels
		? Array.from({ length: numCols }, (_, colIdx) =>
				formatValue(rawLastRow[colIdx] ?? 0),
			)
		: [];
	const slotWidth = Math.max(
		1,
		...labels.map((label) => label.length),
		...valueLabels.map((label) => label.length),
	);
	const totalWidth = numCols * slotWidth + Math.max(0, numCols - 1);
	const lines: string[] = [];

	if (options?.yAxisLabel) {
		lines.push(options.yAxisLabel);
	}

	if (options?.showDataLabels) {
		lines.push(
			valueLabels.map((label) => centerText(label, slotWidth)).join(' '),
		);
	}

	for (let level = height; level >= 1; level--) {
		const cells: string[] = [];
		for (let colIdx = 0; colIdx < numCols; colIdx++) {
			const value = Math.max(0, Math.min(1, lastRow[colIdx] ?? 0));
			const filled = Math.round(value * height) >= level;
			const char = filled ? (COLUMN_CHARS[colIdx % COLUMN_CHARS.length] ?? '█') : ' ';
			cells.push(centerText(char, slotWidth));
		}
		lines.push(cells.join(' '));
	}

	lines.push('─'.repeat(Math.max(1, totalWidth)));
	lines.push(labels.map((label) => centerText(label, slotWidth)).join(' '));

	if (options?.xAxisLabel) {
		lines.push(centerText(options.xAxisLabel, Math.max(totalWidth, options.xAxisLabel.length)));
	}

	return lines.join('\n');
}

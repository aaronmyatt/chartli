import {
	type ChartAnnotations,
	buildSparseLabelLine,
	centerText,
	formatValue,
} from './chart-annotations.js';
import { type NormalizeResult } from './normalize.js';

const BLOCKS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'] as const;

function toSpark(v: number): string {
	const idx = Math.max(0, Math.min(BLOCKS.length - 1, Math.round(v * 7)));
	return BLOCKS[idx] ?? '▁';
}

export function renderSpark({
	normalized,
	options,
}: {
	normalized: NormalizeResult;
	options?: ChartAnnotations;
}): string {
	const { data, raw } = normalized;
	const numCols = data[0]?.length ?? 0;
	const numRows = data.length;
	const seriesLabels = options?.seriesLabels ?? [];
	const labelWidth = Math.max(
		0,
		...Array.from({ length: numCols }, (_, colIdx) =>
			(seriesLabels[colIdx] ?? `S${colIdx + 1}`).length,
		),
	);

	const lines: string[] = [];
	if (options?.yAxisLabel) {
		lines.push(options.yAxisLabel);
	}

	for (let colIdx = 0; colIdx < numCols; colIdx++) {
		const series = data.map((row) => toSpark(row[colIdx] ?? 0)).join('');
		const label = seriesLabels[colIdx] ?? `S${colIdx + 1}`;
		const rawLastValue = raw[raw.length - 1]?.[colIdx];
		const suffix =
			options?.showDataLabels && rawLastValue !== undefined
				? ` ${formatValue(rawLastValue)}`
				: '';
		lines.push(`${label.padEnd(labelWidth)} ${series}${suffix}`);
	}

	if (options?.xLabels && numRows > 0) {
		const prefix = ' '.repeat(labelWidth + 1);
		lines.push(
			`${prefix}${buildSparseLabelLine({
				width: numRows,
				items: options.xLabels.map((label, index) => ({
					label,
					center: numRows === 1 ? 0 : (index / Math.max(numRows - 1, 1)) * (numRows - 1),
				})),
			})}`,
		);
	}

	if (options?.xAxisLabel) {
		lines.push(centerText(options.xAxisLabel, labelWidth + 1 + numRows));
	}

	return lines.join('\n');
}

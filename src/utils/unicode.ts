import {
	type ChartAnnotations,
	buildSparseLabelLine,
	centerText,
} from './chart-annotations.js';
import { type NormalizeResult } from './normalize.js';

const BLOCKS = [' ', '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'] as const;

export interface UnicodeOptions extends ChartAnnotations {
	readonly width?: number;
}

export function renderUnicode({
	normalized,
	options,
}: {
	normalized: NormalizeResult;
	options?: UnicodeOptions;
}): string {
	const { data } = normalized;
	const numCols = data[0]?.length ?? 0;
	const numRows = data.length;
	const chartHeight = 8;
	const gap = 2;

	const cols: string[][] = [];

	for (let colIdx = 0; colIdx < numCols; colIdx++) {
		const colLines: string[] = [];
		for (let h = chartHeight; h >= 1; h--) {
			let row = '';
			for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
				const y = data[rowIdx]?.[colIdx] ?? 0;
				const filled = y * chartHeight;
				const blockIdx = Math.min(
					8,
					Math.max(0, Math.round((filled - (h - 1)) * 8)),
				);
				row += BLOCKS[blockIdx] ?? ' ';
			}
			colLines.push(row);
		}
		cols.push(colLines);
	}

	// Merge cols side by side
	const mergedLines =
		cols[0]?.map((_, lineIdx) =>
			cols.map((col) => col[lineIdx] ?? '').join(' '.repeat(gap)),
		) ?? [];

	const totalWidth = numCols * numRows + Math.max(0, numCols - 1) * gap;
	const lines: string[] = [];

	if (options?.yAxisLabel) {
		lines.push(options.yAxisLabel);
	}

	if (options?.seriesLabels && numCols > 0) {
		lines.push(
			buildSparseLabelLine({
				width: totalWidth,
				items: options.seriesLabels.slice(0, numCols).map((label, colIdx) => ({
					label,
					center:
						colIdx * (numRows + gap) + Math.max(0, (numRows - 1) / 2),
				})),
			}),
		);
	}

	lines.push(...mergedLines);

	if (options?.xLabels && numCols === 1) {
		lines.push(
			buildSparseLabelLine({
				width: numRows,
				items: options.xLabels.map((label, index) => ({
					label,
					center: index,
				})),
			}),
		);
	}

	if (options?.xAxisLabel) {
		lines.push(centerText(options.xAxisLabel, Math.max(totalWidth, options.xAxisLabel.length)));
	}

	// options.width is accepted but not used to resize (data drives width)
	void options;

	return lines.join('\n');
}

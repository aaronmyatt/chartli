import {
	type ChartAnnotations,
	buildSparseLabelLine,
	centerText,
	formatValue,
} from './chart-annotations.js';
import { type NormalizeResult } from './normalize.js';

export interface AsciiOptions extends ChartAnnotations {
	readonly width?: number;
	readonly height?: number;
}

function tryPlaceCenteredText(
	grid: string[][],
	rowIndex: number,
	label: string,
	center: number,
): boolean {
	const row = grid[rowIndex];
	if (!row || !label) return false;

	const unclampedStart = Math.round(center - label.length / 2);
	const start = Math.max(0, Math.min(row.length - label.length, unclampedStart));
	if (start < 0 || start + label.length > row.length) return false;

	for (let idx = 0; idx < label.length; idx++) {
		if (row[start + idx] !== ' ') return false;
	}

	for (let idx = 0; idx < label.length; idx++) {
		row[start + idx] = label[idx] ?? ' ';
	}

	return true;
}

export function renderAscii({
	normalized,
	options,
}: {
	normalized: NormalizeResult;
	options?: AsciiOptions;
}): string {
	const width = options?.width ?? 60;
	const height = options?.height ?? 15;
	const { data, raw, min, max } = normalized;
	const numCols = data[0]?.length ?? 0;
	const numRows = data.length;

	// Build a grid for each column
	const grid: string[][] = Array.from({ length: height }, () =>
		Array(width).fill(' ') as string[],
	);

	const colChars = ['●', '○', '◆', '◇', '▲'];

	for (let colIdx = 0; colIdx < numCols; colIdx++) {
		const char = colChars[colIdx % colChars.length] ?? '●';
		for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
			const y = data[rowIdx]?.[colIdx] ?? 0;
			const x = Math.floor(
				(rowIdx / Math.max(numRows - 1, 1)) * (width - 1),
			);
			const yPos = height - 1 - Math.floor(y * (height - 1));
			const safeY = Math.max(0, Math.min(height - 1, yPos));
			const safeX = Math.max(0, Math.min(width - 1, x));
			if (grid[safeY] && grid[safeY][safeX] !== undefined) {
				grid[safeY][safeX] = char;
			}

			if (options?.showDataLabels) {
				const label = formatValue(raw[rowIdx]?.[colIdx] ?? 0);
				const candidateRows = [safeY - 1, safeY + 1, safeY - 2];
				for (const labelRow of candidateRows) {
					if (
						labelRow >= 0 &&
						labelRow < height &&
						tryPlaceCenteredText(grid, labelRow, label, safeX)
					) {
						break;
					}
				}
			}
		}
	}

	const tickLabels =
		numCols === 1
			? [
					formatValue(max[0] ?? 1),
					formatValue(((max[0] ?? 1) + (min[0] ?? 0)) / 2),
					formatValue(min[0] ?? 0),
				]
			: ['1.00', '0.50', '0.00'];
	const yAxisWidth = Math.max(6, ...tickLabels.map((label) => label.length));
	const lines = grid.map((row, i) => {
		const label =
			i === 0
				? tickLabels[0] ?? ''
				: i === Math.floor(height / 2)
					? tickLabels[1] ?? ''
					: i === height - 1
						? tickLabels[2] ?? ''
						: '    ';
		return `${label.padStart(yAxisWidth)} │${row.join('')}`;
	});

	const shouldShowLegend =
		numCols > 1 && (options?.seriesLabels?.length ?? 0) > 0;

	if (shouldShowLegend && options?.seriesLabels) {
		const legend = options.seriesLabels
			.slice(0, numCols)
			.map(
				(label, index) =>
					`${label}=${colChars[index % colChars.length] ?? '●'}`,
			)
			.join('  ');
		lines.unshift(`${' '.repeat(yAxisWidth + 2)}${legend}`);
	}

	if (options?.yAxisLabel) {
		lines.unshift(`${' '.repeat(yAxisWidth + 2)}${options.yAxisLabel}`);
	}

	lines.push(`${' '.repeat(yAxisWidth)} └${'─'.repeat(width)}`);

	if (options?.xLabels && numRows > 0) {
		lines.push(
			`${' '.repeat(yAxisWidth + 2)}${buildSparseLabelLine({
				width,
				items: options.xLabels.map((label, index) => ({
					label,
					center:
						numRows === 1 ? 0 : (index / Math.max(numRows - 1, 1)) * (width - 1),
				})),
			})}`,
		);
	}

	if (options?.xAxisLabel) {
		lines.push(`${' '.repeat(yAxisWidth + 2)}${centerText(options.xAxisLabel, width)}`);
	}

	return lines.join('\n');
}

import { type ChartAnnotations, formatValue } from './chart-annotations.js';
import { type NormalizeResult } from './normalize.js';

// Bang Wong's colour-safe palette
const COLORS = [
	'#0072B2',
	'#F0E442',
	'#009E73',
	'#CC79A7',
	'#D55E00',
	'#eeeeee',
] as const;

export interface SvgOptions extends ChartAnnotations {
	readonly width?: number;
	readonly height?: number;
	readonly mode?: 'circles' | 'lines';
}

function getColor(colIdx: number, numCols: number): string {
	if (numCols === 1) return '#eeeeee';
	return COLORS[colIdx % COLORS.length] ?? '#eeeeee';
}

function point({
	x,
	y,
	plotWidth,
	plotHeight,
	leftMargin,
	topMargin,
}: {
	x: number;
	y: number;
	plotWidth: number;
	plotHeight: number;
	leftMargin: number;
	topMargin: number;
}): string {
	const px = x * plotWidth + leftMargin;
	const py = topMargin + plotHeight - y * plotHeight;
	return `${Math.round(px)},${Math.round(py)}`;
}

function renderCircles({
	colIdx,
	data,
	color,
	plotWidth,
	plotHeight,
	leftMargin,
	topMargin,
}: {
	colIdx: number;
	data: ReadonlyArray<ReadonlyArray<number>>;
	color: string;
	plotWidth: number;
	plotHeight: number;
	leftMargin: number;
	topMargin: number;
}): string {
	return data
		.map((_, rowIdx) => {
			const y = data[rowIdx]?.[colIdx] ?? 0;
			const p = point({
				x: rowIdx / Math.max(data.length - 1, 1),
				y,
				plotWidth,
				plotHeight,
				leftMargin,
				topMargin,
			});
			const [cx, cy] = p.split(',');
			return `  <circle cx='${cx}' cy='${cy}' r='1.2' fill='${color}ff' stroke='${color}ff'/>`;
		})
		.join('\n');
}

function renderLine({
	colIdx,
	data,
	color,
	plotWidth,
	plotHeight,
	leftMargin,
	topMargin,
}: {
	colIdx: number;
	data: ReadonlyArray<ReadonlyArray<number>>;
	color: string;
	plotWidth: number;
	plotHeight: number;
	leftMargin: number;
	topMargin: number;
}): string {
	const points = data
		.map((_, rowIdx) => {
			const y = data[rowIdx]?.[colIdx] ?? 0;
			return point({
				x: rowIdx / Math.max(data.length - 1, 1),
				y,
				plotWidth,
				plotHeight,
				leftMargin,
				topMargin,
			});
		})
		.join(' ');
	return `  <polyline stroke='${color}ff' stroke-width='1.5' fill='none' points='${points}'/>`;
}

function renderLegend({
	title,
	color,
	minVal,
	maxVal,
	legendX,
	rowY,
	lineHeight,
	fontSize,
}: {
	title: string;
	color: string;
	minVal: number;
	maxVal: number;
	legendX: number;
	rowY: number;
	lineHeight: number;
	fontSize: number;
}): string {
	return [
		`  <g transform='translate(${legendX} ${rowY})'>`,
		`    <circle cx='-10' cy='${-lineHeight / 2 + 5}' r='3.5' fill='${color}' stroke='${color}'/>`,
		`    <text style='fill: #eeeeee; font-size: ${fontSize}px; font-family: mono' xml:space='preserve'>${escapeXml(title)} [${formatValue(minVal)}, ${formatValue(maxVal)}]</text>`,
		`  </g>`,
	].join('\n');
}

function escapeXml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll("'", '&apos;')
		.replaceAll('"', '&quot;');
}

export function renderSvg({
	normalized,
	options,
}: {
	normalized: NormalizeResult;
	options?: SvgOptions;
}): string {
	const plotWidth = options?.width ?? 320;
	const plotHeight = options?.height ?? 120;
	const mode = options?.mode ?? 'circles';
	const seriesLabels = options?.seriesLabels ?? [];
	const numCols = normalized.data[0]?.length ?? 0;
	const showLegend = numCols > 1 && seriesLabels.length > 0;

	const leftMargin = options?.yAxisLabel ? 56 : 44;
	const topMargin = options?.showDataLabels ? 22 : 12;
	const bottomMargin =
		options?.xAxisLabel || options?.xLabels?.length ? 42 : 24;
	const gutter = 30;
	const legendWidth = showLegend ? 300 : 0;
	const lineHeight = 20;
	const fontSize = 15;

	const { data, raw, min, max } = normalized;
	const totalWidth =
		leftMargin + plotWidth + (showLegend ? gutter + legendWidth : 24);
	const totalHeight = topMargin + plotHeight + bottomMargin;
	const axisX = leftMargin;
	const axisY = topMargin + plotHeight;
	const yTickLabels =
		numCols === 1
			? [
					formatValue(max[0] ?? 1),
					formatValue(((max[0] ?? 1) + (min[0] ?? 0)) / 2),
					formatValue(min[0] ?? 0),
				]
			: ['1.00', '0.50', '0.00'];

	const lines: string[] = [
		`<?xml version='1.0'?>`,
		`<svg xmlns='http://www.w3.org/2000/svg' width='${totalWidth}' height='${totalHeight}' version='1.1'>`,
		`  <rect width='100%' height='100%' fill='#111111'/>`,
		`  <line x1='${axisX}' y1='${topMargin}' x2='${axisX}' y2='${axisY}' stroke='#666666' stroke-width='1'/>`,
		`  <line x1='${axisX}' y1='${axisY}' x2='${axisX + plotWidth}' y2='${axisY}' stroke='#666666' stroke-width='1'/>`,
	];

	const yTickYPositions = [topMargin, topMargin + plotHeight / 2, axisY];
	for (let index = 0; index < yTickLabels.length; index++) {
		const tickY = Math.round(yTickYPositions[index] ?? axisY);
		lines.push(
			`  <line x1='${axisX - 4}' y1='${tickY}' x2='${axisX}' y2='${tickY}' stroke='#999999' stroke-width='1'/>`,
		);
		lines.push(
			`  <text x='${axisX - 8}' y='${tickY + 4}' fill='#eeeeee' font-size='11' font-family='mono' text-anchor='end'>${escapeXml(yTickLabels[index] ?? '')}</text>`,
		);
	}

	if (options?.yAxisLabel) {
		lines.push(
			`  <text x='18' y='${topMargin + plotHeight / 2}' fill='#eeeeee' font-size='12' font-family='mono' text-anchor='middle' transform='rotate(-90 18 ${topMargin + plotHeight / 2})'>${escapeXml(options.yAxisLabel)}</text>`,
		);
	}

	for (let colIdx = 0; colIdx < numCols; colIdx++) {
		const color = getColor(colIdx, numCols);
		const renderArgs = {
			colIdx,
			data,
			color,
			plotWidth,
			plotHeight,
			leftMargin,
			topMargin,
		};
		if (mode === 'lines') {
			lines.push(renderLine(renderArgs));
		} else {
			lines.push(renderCircles(renderArgs));
		}

		if (options?.showDataLabels) {
			for (let rowIdx = 0; rowIdx < data.length; rowIdx++) {
				const [cx, cy] = point({
					x: rowIdx / Math.max(data.length - 1, 1),
					y: data[rowIdx]?.[colIdx] ?? 0,
					plotWidth,
					plotHeight,
					leftMargin,
					topMargin,
				}).split(',');
				lines.push(
					`  <text x='${cx}' y='${Math.max(10, Number(cy) - 6)}' fill='${color}' font-size='10' font-family='mono' text-anchor='middle'>${escapeXml(formatValue(raw[rowIdx]?.[colIdx] ?? 0))}</text>`,
				);
			}
		}
	}

	if (options?.xLabels) {
		for (let rowIdx = 0; rowIdx < options.xLabels.length; rowIdx++) {
			const x =
				leftMargin +
				Math.round(
					(rowIdx / Math.max(options.xLabels.length - 1, 1)) * plotWidth,
				);
			lines.push(
				`  <text x='${x}' y='${axisY + 16}' fill='#eeeeee' font-size='11' font-family='mono' text-anchor='middle'>${escapeXml(options.xLabels[rowIdx] ?? '')}</text>`,
			);
		}
	}

	if (options?.xAxisLabel) {
		lines.push(
			`  <text x='${leftMargin + plotWidth / 2}' y='${totalHeight - 8}' fill='#eeeeee' font-size='12' font-family='mono' text-anchor='middle'>${escapeXml(options.xAxisLabel)}</text>`,
		);
	}

	if (showLegend) {
		const legendX = leftMargin + plotWidth + gutter;
		for (let colIdx = 0; colIdx < numCols; colIdx++) {
			const title = seriesLabels[colIdx] ?? `S${colIdx + 1}`;
			const color = getColor(colIdx, numCols);
			lines.push(
				renderLegend({
					title,
					color,
					minVal: min[colIdx] ?? 0,
					maxVal: max[colIdx] ?? 0,
					legendX,
					rowY: topMargin + (colIdx + 1) * lineHeight,
					lineHeight,
					fontSize,
				}),
			);
		}
	}

	lines.push(`</svg>`);
	return lines.join('\n');
}

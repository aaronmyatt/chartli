import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import ora from 'ora';
import pc from 'picocolors';
import { z } from 'zod';
import {
	type ChartAnnotations,
	formatValue,
	normalizeLabels,
} from '../utils/chart-annotations.js';
import { normalizeData, parseChartInput } from '../utils/normalize.js';
import { renderSvg } from '../utils/svg.js';
import { renderAscii } from '../utils/ascii.js';
import { renderUnicode } from '../utils/unicode.js';
import { renderBraille } from '../utils/braille.js';
import { renderSpark } from '../utils/spark.js';
import { renderBars } from '../utils/bars.js';
import { renderColumns } from '../utils/columns.js';
import { renderHeatmap } from '../utils/heatmap.js';

const ChartTypeSchema = z.enum([
	'svg',
	'ascii',
	'unicode',
	'braille',
	'spark',
	'bars',
	'columns',
	'heatmap',
]);
type ChartType = z.infer<typeof ChartTypeSchema>;
type ChartMode = 'circles' | 'lines';

function parseLabelList(value: string | undefined): ReadonlyArray<string> | undefined {
	if (!value) return undefined;

	const labels = value
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);

	return labels.length > 0 ? labels : undefined;
}

function prepareChartInput({
	input,
	xAxisLabel,
	yAxisLabel,
	xLabels,
	seriesLabels,
	firstColumnX,
}: {
	input: string;
	xAxisLabel?: string;
	yAxisLabel?: string;
	xLabels?: string;
	seriesLabels?: string;
	firstColumnX?: boolean;
}): {
	rows: ReadonlyArray<ReadonlyArray<number>>;
	annotations: ChartAnnotations;
} {
	const parsed = parseChartInput(input);
	const requestedXLabels = parseLabelList(xLabels);
	const requestedSeriesLabels = parseLabelList(seriesLabels);
	let rows = parsed.rows.map((row) => [...row]);

	if (firstColumnX) {
		const numCols = rows[0]?.length ?? 0;
		if (numCols < 2) {
			throw new Error(
				'The --first-column-x option requires at least two numeric columns.',
			);
		}

		rows = rows.map((row) => row.slice(1));
	}

	const numSeries = rows[0]?.length ?? 0;
	const annotations: ChartAnnotations = {
		xAxisLabel:
			xAxisLabel?.trim() ||
			(firstColumnX ? parsed.headers[0]?.trim() : undefined) ||
			undefined,
		yAxisLabel:
			yAxisLabel?.trim() ||
			(firstColumnX && parsed.headers.length === 2
				? parsed.headers[1]?.trim()
				: undefined) ||
			undefined,
		xLabels: requestedXLabels
			? normalizeLabels(requestedXLabels, rows.length, (index) => String(index + 1))
			: firstColumnX
				? normalizeLabels(
						parsed.rows.map((row, index) => formatValue(row[0] ?? index + 1)),
						rows.length,
						(index) => String(index + 1),
					)
				: undefined,
		seriesLabels: normalizeLabels(
			requestedSeriesLabels ??
				(firstColumnX ? parsed.headers.slice(1) : parsed.headers),
			numSeries,
			(index) => `S${index + 1}`,
		),
	};

	return { rows, annotations };
}

async function readStdin(): Promise<string> {
	const lines: string[] = [];
	const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
	for await (const line of rl) {
		lines.push(line);
	}
	return lines.join('\n');
}

function renderChart({
	input,
	type,
	width,
	height,
	mode,
	xAxisLabel,
	yAxisLabel,
	xLabels,
	seriesLabels,
	showDataLabels,
	firstColumnX,
}: {
	input: string;
	type: ChartType;
	width?: number;
	height?: number;
	mode?: ChartMode;
	xAxisLabel?: string;
	yAxisLabel?: string;
	xLabels?: string;
	seriesLabels?: string;
	showDataLabels?: boolean;
	firstColumnX?: boolean;
}): string {
	const { rows, annotations } = prepareChartInput({
		input,
		xAxisLabel,
		yAxisLabel,
		xLabels,
		seriesLabels,
		firstColumnX,
	});
	const normalized = normalizeData(rows);
	const chartOptions = {
		...annotations,
		showDataLabels,
	};

	if (type === 'svg')
		return renderSvg({ normalized, options: { width, height, mode, ...chartOptions } });
	if (type === 'ascii')
		return renderAscii({
			normalized,
			options: { width, height, ...chartOptions },
		});
	if (type === 'unicode')
		return renderUnicode({ normalized, options: { width, ...chartOptions } });
	if (type === 'braille')
		return renderBraille({
			normalized,
			options: { width, height, ...chartOptions },
		});
	if (type === 'spark') return renderSpark({ normalized, options: chartOptions });
	if (type === 'bars')
		return renderBars({ normalized, options: { width, ...chartOptions } });
	if (type === 'columns')
		return renderColumns({
			normalized,
			options: { height, ...chartOptions },
		});
	return renderHeatmap({ normalized, options: chartOptions });
}

function registerChartOptions(cmd: Command, withDescription = true): Command {
	if (withDescription) {
		cmd.description('Render charts from numeric data');
	}

	return cmd
		.argument('[file]', 'Input file (reads from stdin if not provided)')
		.option(
			'-t, --type <type>',
			'Chart type: svg, ascii, unicode, braille, spark, bars, columns, heatmap',
			'ascii',
		)
		.option('-w, --width <number>', 'Chart width', parseInt)
		.option('-h, --height <number>', 'Chart height', parseInt)
		.option('-m, --mode <mode>', 'SVG mode: circles or lines', 'circles')
		.option('--x-axis-label <label>', 'Title to render for the x-axis')
		.option('--y-axis-label <label>', 'Title to render for the y-axis')
		.option(
			'--x-labels <labels>',
			'Comma-separated labels for x-axis ticks or row labels',
		)
		.option(
			'--series-labels <labels>',
			'Comma-separated labels for plotted series or categories',
		)
		.option(
			'--data-labels',
			'Show raw values near plotted data when supported',
			false,
		)
		.option(
			'--first-column-x',
			'Treat the first numeric column as x labels instead of a plotted series',
			false,
		)
		.action(
			async (
				file: string | undefined,
				opts: {
					type: string;
					width?: number;
					height?: number;
					mode?: ChartMode;
					xAxisLabel?: string;
					yAxisLabel?: string;
					xLabels?: string;
					seriesLabels?: string;
					dataLabels?: boolean;
					firstColumnX?: boolean;
				},
				command: Command,
			) => {
				if (!file && process.stdin.isTTY) {
					command.help();
					return;
				}

				const typeResult = ChartTypeSchema.safeParse(opts.type);
				if (!typeResult.success) {
					console.error(
						pc.red(
							`Invalid chart type: ${opts.type}. Use svg, ascii, unicode, braille, spark, bars, columns, or heatmap.`,
						),
					);
					process.exit(1);
				}

				const type = typeResult.data;
				const spinner = ora(`Generating ${type} chart…`).start();

				try {
					const input = file ? readFileSync(file, 'utf-8') : await readStdin();
					const mode = opts.mode === 'lines' ? 'lines' : 'circles';
					const output = renderChart({
						input,
						type,
						width: opts.width,
						height: opts.height,
						mode,
						xAxisLabel: opts.xAxisLabel,
						yAxisLabel: opts.yAxisLabel,
						xLabels: opts.xLabels,
						seriesLabels: opts.seriesLabels,
						showDataLabels: opts.dataLabels,
						firstColumnX: opts.firstColumnX,
					});
					spinner.stop();
					console.log(output);
				} catch (err) {
					spinner.stop();
					const msg = err instanceof Error ? err.message : String(err);
					console.error(pc.red(`Error: ${msg}`));
					process.exit(1);
				}
			},
		);
}

export function configureRootChartCommand(program: Command): Command {
	return registerChartOptions(program, false);
}

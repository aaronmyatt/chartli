export interface ChartAnnotations {
	readonly xAxisLabel?: string;
	readonly yAxisLabel?: string;
	readonly xLabels?: ReadonlyArray<string>;
	readonly seriesLabels?: ReadonlyArray<string>;
	readonly showDataLabels?: boolean;
}

export function formatValue(value: number): string {
	if (!Number.isFinite(value)) return '';
	if (Number.isInteger(value)) return String(value);

	const abs = Math.abs(value);
	const decimals = abs >= 100 ? 0 : abs >= 10 ? 1 : abs >= 1 ? 2 : 3;
	return Number(value.toFixed(decimals)).toString();
}

export function centerText(text: string, width: number): string {
	if (width <= 0) return '';
	if (text.length >= width) return text.slice(0, width);

	const leftPadding = Math.floor((width - text.length) / 2);
	const rightPadding = width - text.length - leftPadding;
	return `${' '.repeat(leftPadding)}${text}${' '.repeat(rightPadding)}`;
}

export function buildSparseLabelLine({
	width,
	items,
}: {
	width: number;
	items: ReadonlyArray<{
		readonly label: string;
		readonly center: number;
	}>;
}): string {
	if (width <= 0) return '';

	const chars = Array.from({ length: width }, () => ' ');

	for (const item of items) {
		const label = item.label.trim();
		if (!label) continue;

		const unclampedStart = Math.round(item.center - label.length / 2);
		const start = Math.max(0, Math.min(width - label.length, unclampedStart));
		const end = start + label.length;

		let hasCollision = false;
		for (let idx = start; idx < end; idx++) {
			if (chars[idx] !== ' ') {
				hasCollision = true;
				break;
			}
		}

		if (hasCollision) continue;

		for (let idx = 0; idx < label.length; idx++) {
			chars[start + idx] = label[idx] ?? ' ';
		}
	}

	return chars.join('');
}

export function normalizeLabels(
	labels: ReadonlyArray<string> | undefined,
	count: number,
	fallback: (index: number) => string,
): ReadonlyArray<string> | undefined {
	if (count <= 0) return undefined;

	if (!labels || labels.length === 0) {
		return Array.from({ length: count }, (_, index) => fallback(index));
	}

	return Array.from({ length: count }, (_, index) => {
		const label = labels[index]?.trim();
		return label ? label : fallback(index);
	});
}

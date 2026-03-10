import { describe, it, expect } from 'vitest';
import { renderAscii } from '../src/utils/ascii.js';
import { normalizeData } from '../src/utils/normalize.js';

describe('renderAscii', () => {
	it('generates ascii chart with axis labels', () => {
		const normalized = normalizeData([[1], [5], [10]]);
		const result = renderAscii({ normalized });
		expect(result).toContain('│');
		expect(result).toContain('─');
	});

	it('places data point in chart', () => {
		const normalized = normalizeData([[0], [5], [10]]);
		const result = renderAscii({ normalized });
		expect(result).toContain('●');
	});

	it('renders configured axis and value labels', () => {
		const normalized = normalizeData([[10], [20], [15]]);
		const result = renderAscii({
			normalized,
			options: {
				xAxisLabel: 'Day',
				yAxisLabel: 'Sales',
				xLabels: ['Mon', 'Tue', 'Wed'],
				seriesLabels: ['Sales'],
				showDataLabels: true,
				width: 18,
				height: 8,
			},
		});
		expect(result).toContain('Sales');
		expect(result).toContain('Mon');
		expect(result).toContain('Wed');
		expect(result).toContain('20');
		expect(result).toContain('Day');
	});
});

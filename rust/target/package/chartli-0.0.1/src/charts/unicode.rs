use crate::normalize::NormalizeResult;

const BLOCKS: &[char] = &[' ', '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

pub fn render_unicode(normalized: &NormalizeResult) -> String {
    let data = &normalized.data;
    let num_cols = data.first().map_or(0, |r| r.len());
    let num_rows = data.len();
    let chart_height: usize = 8;

    let mut cols: Vec<Vec<String>> = Vec::new();

    for col_idx in 0..num_cols {
        let mut col_lines: Vec<String> = Vec::new();
        for h in (1..=chart_height).rev() {
            let mut row = String::new();
            for row_idx in 0..num_rows {
                let y = data[row_idx][col_idx];
                let filled = y * chart_height as f64;
                let block_idx =
                    ((filled - (h - 1) as f64) * 8.0).round().max(0.0).min(8.0) as usize;
                row.push(BLOCKS[block_idx]);
            }
            col_lines.push(row);
        }
        cols.push(col_lines);
    }

    if cols.is_empty() {
        return String::new();
    }

    let merged_lines: Vec<String> = (0..cols[0].len())
        .map(|line_idx| {
            cols.iter()
                .map(|col| col[line_idx].clone())
                .collect::<Vec<_>>()
                .join("  ")
        })
        .collect();

    merged_lines.join("\n")
}

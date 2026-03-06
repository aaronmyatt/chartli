use crate::normalize::NormalizeResult;

pub fn render_ascii(normalized: &NormalizeResult, width: usize, height: usize) -> String {
    let data = &normalized.data;
    let num_cols = data.first().map_or(0, |r| r.len());
    let num_rows = data.len();

    let mut grid: Vec<Vec<char>> = vec![vec![' '; width]; height];
    let col_chars = ['●', '○', '◆', '◇', '▲'];

    for col_idx in 0..num_cols {
        let ch = col_chars[col_idx % col_chars.len()];
        for row_idx in 0..num_rows {
            let y = data[row_idx][col_idx];
            let x = (row_idx as f64 / (num_rows - 1).max(1) as f64 * (width - 1) as f64) as usize;
            let y_pos =
                height - 1 - (y * (height - 1) as f64).round() as usize;
            let safe_y = y_pos.min(height - 1);
            let safe_x = x.min(width - 1);
            grid[safe_y][safe_x] = ch;
        }
    }

    let y_axis_width = 6;
    let mut lines: Vec<String> = grid
        .iter()
        .enumerate()
        .map(|(i, row)| {
            let label = if i == 0 {
                "1.00".to_string()
            } else if i == height / 2 {
                "0.50".to_string()
            } else if i == height - 1 {
                "0.00".to_string()
            } else {
                "    ".to_string()
            };
            let row_str: String = row.iter().collect();
            format!("{:>width$} │{}", label, row_str, width = y_axis_width)
        })
        .collect();

    lines.push(format!(
        "{} └{}",
        " ".repeat(y_axis_width),
        "─".repeat(width)
    ));
    lines.join("\n")
}

use crate::normalize::NormalizeResult;

const COLUMN_CHARS: &[char] = &['█', '▓', '▒', '░', '■', '□'];

pub fn render_columns(normalized: &NormalizeResult, height: usize) -> String {
    let data = &normalized.data;
    let num_cols = data.first().map_or(0, |r| r.len());
    let last_row = match data.last() {
        Some(r) => r,
        None => return String::new(),
    };

    if num_cols == 0 {
        return String::new();
    }

    let mut lines: Vec<String> = Vec::new();
    for level in (1..=height).rev() {
        let mut row = String::new();
        for col_idx in 0..num_cols {
            let value = last_row[col_idx].max(0.0).min(1.0);
            let filled = (value * height as f64).round() as usize >= level;
            if filled {
                row.push(COLUMN_CHARS[col_idx % COLUMN_CHARS.len()]);
            } else {
                row.push(' ');
            }
            row.push(' ');
        }
        lines.push(row.trim_end().to_string());
    }

    lines.push("─".repeat((num_cols * 2).saturating_sub(1).max(1)));
    lines.push(
        (1..=num_cols)
            .map(|i| i.to_string())
            .collect::<Vec<_>>()
            .join(" "),
    );

    lines.join("\n")
}

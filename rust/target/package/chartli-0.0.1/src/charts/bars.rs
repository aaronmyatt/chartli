use crate::normalize::NormalizeResult;

const BAR_CHARS: &[char] = &['█', '▓', '▒', '░', '■', '□'];

pub fn render_bars(normalized: &NormalizeResult, width: usize) -> String {
    let data = &normalized.data;
    let num_cols = data.first().map_or(0, |r| r.len());
    let last_row = match data.last() {
        Some(r) => r,
        None => return String::new(),
    };

    if num_cols == 0 {
        return String::new();
    }

    (0..num_cols)
        .map(|col_idx| {
            let value = last_row[col_idx].max(0.0).min(1.0);
            let units = (value * width as f64).round() as usize;
            let ch = BAR_CHARS[col_idx % BAR_CHARS.len()];
            let bar: String = std::iter::repeat(ch)
                .take(units)
                .chain(std::iter::repeat(' ').take(width.saturating_sub(units)))
                .collect();
            format!("S{} |{}| {:.2}", col_idx + 1, bar, value)
        })
        .collect::<Vec<_>>()
        .join("\n")
}

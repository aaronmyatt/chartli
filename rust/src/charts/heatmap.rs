use crate::normalize::NormalizeResult;

const SHADES: &[char] = &[' ', '░', '▒', '▓', '█'];

fn to_shade(value: f64) -> char {
    let clamped = value.max(0.0).min(1.0);
    let idx = (clamped * (SHADES.len() - 1) as f64).round() as usize;
    SHADES[idx]
}

pub fn render_heatmap(normalized: &NormalizeResult) -> String {
    let data = &normalized.data;
    let num_cols = data.first().map_or(0, |r| r.len());

    if num_cols == 0 {
        return String::new();
    }

    let header = format!(
        "    {}",
        (0..num_cols)
            .map(|i| format!("C{}", i + 1))
            .collect::<Vec<_>>()
            .join(" ")
    );

    let rows: Vec<String> = data
        .iter()
        .enumerate()
        .map(|(row_idx, row)| {
            let cells: String = row
                .iter()
                .map(|&v| to_shade(v).to_string())
                .collect::<Vec<_>>()
                .join(" ");
            format!("R{:02} {}", row_idx + 1, cells)
        })
        .collect();

    let mut result = vec![header];
    result.extend(rows);
    result.join("\n")
}

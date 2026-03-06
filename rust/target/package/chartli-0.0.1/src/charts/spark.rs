use crate::normalize::NormalizeResult;

const BLOCKS: &[char] = &['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

fn to_spark(v: f64) -> char {
    let idx = (v * 7.0).round().max(0.0).min(7.0) as usize;
    BLOCKS[idx]
}

pub fn render_spark(normalized: &NormalizeResult) -> String {
    let data = &normalized.data;
    let num_cols = data.first().map_or(0, |r| r.len());

    let mut lines: Vec<String> = Vec::new();
    for col_idx in 0..num_cols {
        let series: String = data.iter().map(|row| to_spark(row[col_idx])).collect();
        lines.push(format!("S{} {}", col_idx + 1, series));
    }

    lines.join("\n")
}

pub struct NormalizeResult {
    pub data: Vec<Vec<f64>>,
    pub min: Vec<f64>,
    pub max: Vec<f64>,
}

pub fn parse_data(input: &str) -> Vec<Vec<f64>> {
    let lines: Vec<&str> = input
        .trim()
        .lines()
        .filter(|line| !line.trim().is_empty())
        .collect();

    if lines.is_empty() {
        return vec![];
    }

    let first_line = lines[0];
    let is_header = first_line
        .split_whitespace()
        .any(|val| val.parse::<f64>().is_err());

    let data_lines = if is_header { &lines[1..] } else { &lines[..] };

    data_lines
        .iter()
        .map(|line| {
            line.trim()
                .split_whitespace()
                .map(|v| v.parse::<f64>().unwrap_or(0.0))
                .collect()
        })
        .collect()
}

pub fn normalize_data(raw_rows: &[Vec<f64>]) -> NormalizeResult {
    if raw_rows.is_empty() {
        return NormalizeResult {
            data: vec![],
            min: vec![],
            max: vec![],
        };
    }

    let num_cols = raw_rows[0].len();
    let num_rows = raw_rows.len();

    let columns: Vec<Vec<f64>> = (0..num_cols)
        .map(|col_idx| {
            raw_rows
                .iter()
                .map(|row| *row.get(col_idx).unwrap_or(&0.0))
                .collect()
        })
        .collect();

    let min_vals: Vec<f64> = columns
        .iter()
        .map(|col| col.iter().cloned().fold(f64::INFINITY, f64::min))
        .collect();

    let max_vals: Vec<f64> = columns
        .iter()
        .map(|col| col.iter().cloned().fold(f64::NEG_INFINITY, f64::max))
        .collect();

    let deltas: Vec<f64> = (0..num_cols)
        .map(|i| max_vals[i] - min_vals[i])
        .collect();

    let normalized_cols: Vec<Vec<f64>> = columns
        .iter()
        .enumerate()
        .map(|(i, col)| {
            let delta = deltas[i];
            let min_v = min_vals[i];
            col.iter()
                .map(|v| {
                    if delta == 0.0 {
                        0.0
                    } else {
                        (v - min_v) / delta
                    }
                })
                .collect()
        })
        .collect();

    let mut sorted_deltas: Vec<(f64, usize)> = deltas
        .iter()
        .enumerate()
        .map(|(i, &d)| (d, i))
        .collect();
    sorted_deltas.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));

    let mut scaled_cols: Vec<Vec<f64>> = normalized_cols.iter().map(|col| col.clone()).collect();
    let mut k: usize = 0;
    let mut prev_delta: f64 = -1.0;

    for &(delta, col_idx) in &sorted_deltas {
        if prev_delta >= 0.0 && format!("{:.3}", prev_delta) != format!("{:.3}", delta) {
            k += 1;
        }
        let scale = (num_cols + 2 - k) as f64 / (num_cols + 2) as f64;
        if (scale - 1.0).abs() > f64::EPSILON {
            for j in 0..scaled_cols[col_idx].len() {
                scaled_cols[col_idx][j] *= scale;
            }
        }
        prev_delta = delta;
    }

    let data: Vec<Vec<f64>> = (0..num_rows)
        .map(|row_idx| {
            (0..num_cols)
                .map(|col_idx| *scaled_cols[col_idx].get(row_idx).unwrap_or(&0.0))
                .collect()
        })
        .collect();

    NormalizeResult {
        data,
        min: min_vals,
        max: max_vals,
    }
}

use crate::normalize::NormalizeResult;

const DOT_BIT: [u32; 8] = [0x01, 0x02, 0x04, 0x40, 0x08, 0x10, 0x20, 0x80];

fn braille_char(dots: &[bool; 8]) -> char {
    let mut bits: u32 = 0;
    for (i, &d) in dots.iter().enumerate() {
        if d {
            bits |= DOT_BIT[i];
        }
    }
    char::from_u32(0x2800 + bits).unwrap_or(' ')
}

pub fn render_braille(
    normalized: &NormalizeResult,
    char_width: usize,
    char_height: usize,
) -> String {
    let data = &normalized.data;
    let num_rows = data.len();
    let num_cols = data.first().map_or(0, |r| r.len());

    let dot_width = char_width * 2;
    let dot_height = char_height * 4;

    let mut lines: Vec<String> = Vec::new();

    for col_idx in 0..num_cols {
        let mut dot_grid: Vec<Vec<bool>> = vec![vec![false; dot_width]; dot_height];

        for row_idx in 0..num_rows {
            let y = data[row_idx][col_idx];
            let dot_x =
                (row_idx as f64 / (num_rows - 1).max(1) as f64 * (dot_width - 1) as f64) as usize;
            let dot_y = dot_height
                - 1
                - (y * (dot_height - 1) as f64).round() as usize;
            let safe_y = dot_y.min(dot_height - 1);
            let safe_x = dot_x.min(dot_width - 1);
            dot_grid[safe_y][safe_x] = true;
        }

        if col_idx > 0 {
            lines.push(String::new());
        }

        for cy in 0..char_height {
            let mut row_str = String::new();
            for cx in 0..char_width {
                let dots: [bool; 8] = [
                    dot_grid[cy * 4][cx * 2],
                    dot_grid[cy * 4 + 1][cx * 2],
                    dot_grid[cy * 4 + 2][cx * 2],
                    dot_grid[cy * 4 + 3][cx * 2],
                    dot_grid[cy * 4][cx * 2 + 1],
                    dot_grid[cy * 4 + 1][cx * 2 + 1],
                    dot_grid[cy * 4 + 2][cx * 2 + 1],
                    dot_grid[cy * 4 + 3][cx * 2 + 1],
                ];
                row_str.push(braille_char(&dots));
            }
            lines.push(row_str);
        }
    }

    lines.join("\n")
}

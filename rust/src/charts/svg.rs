use crate::normalize::NormalizeResult;

const COLORS: &[&str] = &["#0072B2", "#F0E442", "#009E73", "#CC79A7", "#D55E00", "#eeeeee"];

fn get_color(col_idx: usize, num_cols: usize) -> &'static str {
    if num_cols == 1 {
        "#eeeeee"
    } else {
        COLORS[col_idx % COLORS.len()]
    }
}

fn point(
    x: f64,
    y: f64,
    chart_width: usize,
    height: usize,
    x_margin: usize,
    y_margin: usize,
) -> (i64, i64) {
    let px = x * (chart_width - 2 * x_margin) as f64 + x_margin as f64;
    let py = height as f64 - 2.0 * y_margin as f64 - y * (height as f64 - 2.0 * y_margin as f64)
        + y_margin as f64;
    (px.round() as i64, py.round() as i64)
}

fn render_circles(
    col_idx: usize,
    data: &[Vec<f64>],
    color: &str,
    chart_width: usize,
    height: usize,
    x_margin: usize,
    y_margin: usize,
) -> String {
    data.iter()
        .enumerate()
        .map(|(row_idx, _)| {
            let y = data[row_idx][col_idx];
            let (cx, cy) = point(
                row_idx as f64 / data.len() as f64,
                y,
                chart_width,
                height,
                x_margin,
                y_margin,
            );
            format!(
                "  <circle cx='{}' cy='{}' r='1.2' fill='{}ff' stroke='{}ff'/>",
                cx, cy, color, color
            )
        })
        .collect::<Vec<_>>()
        .join("\n")
}

fn render_line(
    col_idx: usize,
    data: &[Vec<f64>],
    color: &str,
    chart_width: usize,
    height: usize,
    x_margin: usize,
    y_margin: usize,
) -> String {
    let points: String = data
        .iter()
        .enumerate()
        .map(|(row_idx, _)| {
            let y = data[row_idx][col_idx];
            let (px, py) = point(
                row_idx as f64 / data.len() as f64,
                y,
                chart_width,
                height,
                x_margin,
                y_margin,
            );
            format!("{},{}", px, py)
        })
        .collect::<Vec<_>>()
        .join(" ");
    format!(
        "  <polyline stroke='{}ff' stroke-width='1.5' fill='none' points='{}'/>",
        color, points
    )
}

fn render_legend(
    col_idx: usize,
    title: &str,
    color: &str,
    min_val: f64,
    max_val: f64,
    chart_width: usize,
    gutter: usize,
    line_height: usize,
    font_size: usize,
) -> String {
    let x = chart_width + gutter;
    let y = col_idx * line_height;
    format!(
        "  <g transform='translate({} {})'>\n    <circle cx='-10' cy='{}' r='3.5' fill='{}' stroke='{}'/>\n    <text style='fill: #eeeeee; font-size: {}px; font-family: mono' xml:space='preserve'>{} [{:.3}, {:.3}]</text>\n  </g>",
        x,
        y,
        -(line_height as i64) / 2 + 5,
        color,
        color,
        font_size,
        title,
        min_val,
        max_val
    )
}

pub fn render_svg(
    normalized: &NormalizeResult,
    chart_width: usize,
    height: usize,
    mode: &str,
    titles: &[String],
) -> String {
    let x_margin = 0;
    let y_margin = 5;
    let gutter = 30;
    let legend_width = 300;
    let line_height = 20;
    let font_size = 15;

    let data = &normalized.data;
    let num_cols = data.first().map_or(0, |r| r.len());
    let total_width = chart_width + gutter + legend_width;

    let mut lines: Vec<String> = vec![
        "<?xml version='1.0'?>".to_string(),
        format!(
            "<svg xmlns='http://www.w3.org/2000/svg' width='{}' height='{}' version='1.1'>",
            total_width, height
        ),
    ];

    for col_idx in 0..num_cols {
        let color = get_color(col_idx, num_cols);
        if mode == "lines" {
            lines.push(render_line(
                col_idx,
                data,
                color,
                chart_width,
                height,
                x_margin,
                y_margin,
            ));
        } else {
            lines.push(render_circles(
                col_idx,
                data,
                color,
                chart_width,
                height,
                x_margin,
                y_margin,
            ));
        }
    }

    if !titles.is_empty() {
        for col_idx in 0..num_cols {
            let title = titles.get(col_idx).map_or("", |s| s.as_str());
            let color = get_color(col_idx, num_cols);
            lines.push(render_legend(
                col_idx,
                title,
                color,
                normalized.min[col_idx],
                normalized.max[col_idx],
                chart_width,
                gutter,
                line_height,
                font_size,
            ));
        }
    }

    lines.push("</svg>".to_string());
    lines.join("\n")
}

mod banner;
mod charts;
mod normalize;

use std::fs;
use std::io::{self, BufRead};

use clap::Parser;
use indicatif::{ProgressBar, ProgressStyle};

use banner::show_banner;
use charts::{ascii, bars, braille, columns, heatmap, spark, svg, unicode};
use normalize::{normalize_data, parse_data};

#[derive(Clone, Debug)]
enum ChartType {
    Svg,
    Ascii,
    Unicode,
    Braille,
    Spark,
    Bars,
    Columns,
    Heatmap,
}

impl std::str::FromStr for ChartType {
    type Err = String;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "svg" => Ok(ChartType::Svg),
            "ascii" => Ok(ChartType::Ascii),
            "unicode" => Ok(ChartType::Unicode),
            "braille" => Ok(ChartType::Braille),
            "spark" => Ok(ChartType::Spark),
            "bars" => Ok(ChartType::Bars),
            "columns" => Ok(ChartType::Columns),
            "heatmap" => Ok(ChartType::Heatmap),
            _ => Err(format!(
                "Invalid chart type: {}. Use svg, ascii, unicode, braille, spark, bars, columns, or heatmap.",
                s
            )),
        }
    }
}

#[derive(Parser, Debug)]
#[command(
    name = "chartli",
    about = "Render terminal charts from numeric data",
    version = env!("CARGO_PKG_VERSION"),
    disable_help_subcommand = true
)]
struct Cli {
    /// Input file (reads from stdin if not provided)
    file: Option<String>,

    /// Chart type: svg, ascii, unicode, braille, spark, bars, columns, heatmap
    #[arg(short = 't', long = "type", default_value = "ascii")]
    chart_type: ChartType,

    /// Chart width
    #[arg(short = 'w', long)]
    width: Option<usize>,

    /// Chart height
    #[arg(short = 'H', long)]
    height: Option<usize>,

    /// SVG mode: circles or lines
    #[arg(short = 'm', long, default_value = "circles")]
    mode: String,
}

fn read_stdin() -> String {
    let stdin = io::stdin();
    let lines: Vec<String> = stdin.lock().lines().filter_map(|l| l.ok()).collect();
    lines.join("\n")
}

fn render_chart(
    input: &str,
    chart_type: &ChartType,
    width: Option<usize>,
    height: Option<usize>,
    mode: &str,
) -> String {
    let rows = parse_data(input);
    let normalized = normalize_data(&rows);

    match chart_type {
        ChartType::Svg => {
            svg::render_svg(&normalized, width.unwrap_or(320), height.unwrap_or(120), mode, &[])
        }
        ChartType::Ascii => {
            ascii::render_ascii(&normalized, width.unwrap_or(60), height.unwrap_or(15))
        }
        ChartType::Unicode => unicode::render_unicode(&normalized),
        ChartType::Braille => {
            braille::render_braille(&normalized, width.unwrap_or(40), height.unwrap_or(8))
        }
        ChartType::Spark => spark::render_spark(&normalized),
        ChartType::Bars => bars::render_bars(&normalized, width.unwrap_or(28)),
        ChartType::Columns => columns::render_columns(&normalized, height.unwrap_or(8)),
        ChartType::Heatmap => heatmap::render_heatmap(&normalized),
    }
}

fn main() {
    let cli = Cli::parse();

    if cli.file.is_none() && atty::is(atty::Stream::Stdin) {
        show_banner();
        Cli::parse_from(["chartli", "--help"]);
        return;
    }

    show_banner();

    let spinner = ProgressBar::new_spinner();
    spinner.set_style(
        ProgressStyle::default_spinner()
            .template("{spinner:.cyan} {msg}")
            .unwrap(),
    );
    spinner.set_message(format!("Generating {:?} chart…", cli.chart_type));
    spinner.enable_steady_tick(std::time::Duration::from_millis(80));

    let input = match &cli.file {
        Some(path) => match fs::read_to_string(path) {
            Ok(content) => content,
            Err(err) => {
                spinner.finish_and_clear();
                eprintln!("\x1b[31mError: {}\x1b[0m", err);
                std::process::exit(1);
            }
        },
        None => read_stdin(),
    };

    let mode = if cli.mode == "lines" {
        "lines"
    } else {
        "circles"
    };

    let output = render_chart(&input, &cli.chart_type, cli.width, cli.height, mode);
    spinner.finish_and_clear();
    println!("{}", output);
}

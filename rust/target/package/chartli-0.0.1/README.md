# chartli (Rust)

CLI for rendering charts in terminals from numeric text data. Rust port of the Node.js [chartli](https://github.com/ahmadawais/chartli).

## Build

```sh
cargo build --release
```

The binary will be at `target/release/chartli`.

## Usage

```sh
chartli [file] [options]
```

```text
Render terminal charts from numeric data

Arguments:
  [FILE]  Input file (reads from stdin if not provided)

Options:
  -t, --type <TYPE>    Chart type: svg, ascii, unicode, braille, spark, bars, columns, heatmap [default: ascii]
  -w, --width <WIDTH>  Chart width
  -H, --height <HEIGHT> Chart height
  -m, --mode <MODE>    SVG mode: circles or lines [default: circles]
  -h, --help           Print help
  -V, --version        Print version
```

## Examples

```sh
chartli examples/assets/core-single-series.txt -t ascii -w 24 -H 8
chartli examples/assets/core-multi-series.txt -t spark
chartli examples/assets/core-multi-series.txt -t bars -w 28
chartli examples/assets/core-multi-series.txt -t columns -H 8
chartli examples/assets/core-multi-series.txt -t heatmap
chartli examples/assets/core-multi-series.txt -t unicode
chartli examples/assets/core-single-series.txt -t braille -w 16 -H 6
chartli examples/assets/core-multi-series.txt -t svg -m lines -w 320 -H 120
```

Stdin works too:

```sh
cat data.txt | chartli -t spark
```

## Chart Types

| Type | Description |
|------|-------------|
| `ascii` | ASCII line chart with axes |
| `spark` | Sparkline per series |
| `bars` | Horizontal bar chart |
| `columns` | Vertical column chart |
| `heatmap` | Grid heatmap with shading |
| `unicode` | Unicode block bar chart |
| `braille` | Braille dot plot |
| `svg` | SVG output (circles or lines mode) |

## Distribution

### Install from crates.io

Once published:

```sh
cargo install chartli
```

To publish:

```sh
cargo publish
```

### Install from source

```sh
git clone https://github.com/ahmadawais/chartli.git
cd chartli/rust
cargo install --path .
```

### Homebrew (macOS/Linux)

Create a formula or tap:

```sh
brew tap ahmadawais/tap
brew install chartli
```

### Pre-built binaries

Build for multiple targets and attach to GitHub releases:

```sh
# macOS ARM
cargo build --release --target aarch64-apple-darwin

# macOS Intel
cargo build --release --target x86_64-apple-darwin

# Linux
cargo build --release --target x86_64-unknown-linux-gnu

# Windows
cargo build --release --target x86_64-pc-windows-msvc
```

Then upload the binaries to a [GitHub Release](https://github.com/ahmadawais/chartli/releases). Users download and put in their `$PATH`.

### Cross-compile with `cross`

```sh
cargo install cross
cross build --release --target x86_64-unknown-linux-gnu
cross build --release --target aarch64-unknown-linux-gnu
```

## License

Apache-2.0

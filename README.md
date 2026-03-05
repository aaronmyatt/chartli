![npx chartli](https://raw.githubusercontent.com/ahmadawais/chartli/main/.github/chartli.jpg)

# chartli

CLI for rendering charts in terminals from numeric text data. `chartli` turns plain numbers into terminal charts. ascii, spark, bars, columns, heatmap, unicode, braille, svg. 


## Install

Run instantly:

```sh
npx chartli --help
```

Or install globally:

```sh
pnpm add -g chartli
```

Quick start:

```sh
npx chartli
npx chartli --help
```

## Usage

```sh
npx chartli [file] [options]
```

```text
Usage: chartli [options] [file]

Render terminal charts from numeric data

Arguments:
  file                   Input file (reads from stdin if not provided)

Options:
  -v, --version          Output the version number
  -t, --type <type>      Chart type: svg, ascii, unicode, braille, spark, bars,
                         columns, heatmap (default: "ascii")
  -w, --width <number>   Chart width
  -h, --height <number>  Chart height
  -m, --mode <mode>      SVG mode: circles or lines (default: "circles")
  --help                 Display help for command
```

## Types

- `ascii`
- `spark`
- `bars`
- `columns`
- `heatmap`
- `unicode`
- `braille`
- `svg`

## Example data files

- `examples/assets/core-single-series.txt`
- `examples/assets/core-multi-series.txt`
- `examples/assets/image-data.txt`
- `examples/assets/image-columns-variant.txt`

## Image chart set (text diagrams)

### ASCII Line

```sh
pnpm chartli examples/assets/image-data.txt -t ascii -w 24 -h 8
```

```text
  1.00 │                       ○
       │
       │             ◇         ◇
       │                  ◆    ●
  0.50 │                  ●    ◆
       │    ◇    ◆   ●
       │         ○   ◆
  0.00 │◇   ◆    ◇        ◇
       └────────────────────────
```

### Sparklines

```sh
pnpm chartli examples/assets/image-data.txt -t spark
```

```text
S1 ▁▂▃▄▅▆
S2 ▁▄▂▇▅█
S3 ▁▂▄▃▆▅
S4 ▁▄▂▇▂▇
```

### Horizontal Bars

```sh
pnpm chartli examples/assets/image-data.txt -t bars -w 28
```

```text
S1 |███████████████████         | 0.67
S2 |▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓| 1.00
S3 |▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒             | 0.53
S4 |░░░░░░░░░░░░░░░░░░░░░░░     | 0.83
```

### Columns

```sh
pnpm chartli examples/assets/image-data.txt -t columns -h 8
```

```text
  ▓
  ▓   ░
  ▓   ░
█ ▓   ░
█ ▓ ▒ ░
█ ▓ ▒ ░
█ ▓ ▒ ░
█ ▓ ▒ ░
───────
1 2 3 4
```

### Columns (Variant)

```sh
pnpm chartli examples/assets/image-columns-variant.txt -t columns -h 8
```

```text
  ▓   ░
█ ▓   ░
█ ▓   ░
█ ▓ ▒ ░
█ ▓ ▒ ░
█ ▓ ▒ ░
───────
1 2 3 4
```

### Heatmap

```sh
pnpm chartli examples/assets/image-data.txt -t heatmap
```

```text
    C1 C2 C3 C4
R01
R02 ░ ▒ ░ ▒
R03 ░ ░ ▒ ░
R04 ▒ ▓ ░ ▓
R05 ▒ ▒ ▓ ░
R06 ▓ █ ▒ ▓
```

### Unicode Bars

```sh
pnpm chartli examples/assets/image-data.txt -t unicode
```

```text
             █
           ▃ █             ▅ ▅
     ▃     █ █      ▃      █ █
    ▂█     █▆█      █▂     █ █
   ▂██   ▂ ███    ▂ ██   ▃ █ █
  ▁███   █ ███    █▁██   █ █ █
 ▁████   █▅███   ▁████   █▁█▁█
 █████   █████   █████   █████
```

### Braille

```sh
pnpm chartli examples/assets/image-data.txt -t braille -w 16 -h 6
```

```text
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠈
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠄⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀
⡀⠀⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
...
```

### SVG Chart

```sh
pnpm chartli examples/assets/image-data.txt -t svg -m lines -w 320 -h 120 | sed -n '/^<?xml/,$p' > examples/assets/output/image-chart.svg
```

```text
<?xml version='1.0'?>
<svg xmlns='http://www.w3.org/2000/svg' width='650' height='120' version='1.1'>
  <polyline ... />
  <polyline ... />
  <polyline ... />
  <polyline ... />
</svg>
```

# Examples

All examples are data-file driven from `examples/assets/`.

## Data files

- `examples/assets/core-single-series.txt`
- `examples/assets/core-multi-series.txt`
- `examples/assets/image-data.txt`
- `examples/assets/image-columns-variant.txt`
- `examples/assets/output/`

## Core commands

- `pnpm chartli examples/assets/core-single-series.txt -t ascii -w 24 -h 8`
- `pnpm chartli examples/assets/core-multi-series.txt -t spark`
- `pnpm chartli examples/assets/core-multi-series.txt -t bars -w 28`
- `pnpm chartli examples/assets/core-multi-series.txt -t columns -h 8`
- `pnpm chartli examples/assets/core-multi-series.txt -t heatmap`
- `pnpm chartli examples/assets/core-multi-series.txt -t unicode`
- `pnpm chartli examples/assets/core-single-series.txt -t braille -w 16 -h 6`
- `pnpm chartli examples/assets/core-multi-series.txt -t svg -m lines -w 320 -h 120 | sed -n '/^<?xml/,$p' > examples/assets/output/core-chart.svg`

## Image commands

- `pnpm chartli examples/assets/image-data.txt -t ascii -w 24 -h 8`
- `pnpm chartli examples/assets/image-data.txt -t spark`
- `pnpm chartli examples/assets/image-data.txt -t bars -w 28`
- `pnpm chartli examples/assets/image-data.txt -t columns -h 8`
- `pnpm chartli examples/assets/image-columns-variant.txt -t columns -h 8`
- `pnpm chartli examples/assets/image-data.txt -t heatmap`
- `pnpm chartli examples/assets/image-data.txt -t unicode`
- `pnpm chartli examples/assets/image-data.txt -t braille -w 16 -h 6`
- `pnpm chartli examples/assets/image-data.txt -t svg -m lines -w 320 -h 120 | sed -n '/^<?xml/,$p' > examples/assets/output/image-chart.svg`

## Run grouped examples

- `pnpm run example:kitchen-sink`
- `pnpm run example:image-set:kitchen-sink`
- `pnpm run example:all-kitchen-sink`

## Run all examples

Image-set chart run:

```sh
pnpm run example:image-set:kitchen-sink
```

Core + image run:

```sh
pnpm run example:all-kitchen-sink
```

## Agent skill install

Install the repository skill for agents:

```sh
npx skills add ahmadawais/chartli
```

## License

Apache-2.0 by [Ahmad Awais](https://x.com/MrAhmadAwais) built with [Command Code](https://commandcode.ai).

# chartlir

CLI for rendering charts in terminals from numeric text data. Rust port of [chartli](https://github.com/ahmadawais/chartli).

## Install

```sh
npm i -g chartlir
```

Or run directly:

```sh
npx chartlir data.txt -t spark
```

Works on macOS (ARM + Intel), Linux (x64 + ARM64), and Windows (x64).

## Usage

```sh
chartlir [file] [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `-t, --type <type>` | Chart type: svg, ascii, unicode, braille, spark, bars, columns, heatmap | ascii |
| `-w, --width <n>` | Chart width | varies |
| `-H, --height <n>` | Chart height | varies |
| `-m, --mode <mode>` | SVG mode: circles or lines | circles |

## Examples

```sh
chartlir data.txt -t ascii -w 24 -H 8
chartlir data.txt -t spark
chartlir data.txt -t bars -w 28
chartlir data.txt -t columns -H 8
chartlir data.txt -t heatmap
chartlir data.txt -t unicode
chartlir data.txt -t braille -w 16 -H 6
chartlir data.txt -t svg -m lines -w 320 -H 120
cat data.txt | chartlir -t spark
```

## How It Works

```
npm package: chartlir
├── bin/chartlir.js        ← Node entry point
└── binaries/
    ├── chartlir-darwin-arm64   ← macOS Apple Silicon
    ├── chartlir-darwin-x64     ← macOS Intel
    ├── chartlir-linux-x64      ← Linux x64
    ├── chartlir-linux-arm64    ← Linux ARM64
    └── chartlir-win32-x64.exe  ← Windows x64

npx chartlir → Node detects your OS → runs matching binary
```

## License

Apache-2.0

# Build & Release

The npm package ships pre-built Rust binaries for all platforms. Here's how to build them.

## How it works

```
rust/src/*.rs
     │
     │  cargo build --release --target <each-target>
     │
     ▼
rust/npm/binaries/
├── chartlir-darwin-arm64      ← macOS Apple Silicon
├── chartlir-darwin-x64        ← macOS Intel
├── chartlir-linux-x64         ← Linux x64
├── chartlir-linux-arm64       ← Linux ARM64
└── chartlir-win32-x64.exe     ← Windows x64
```

## Option 1: Build locally (macOS)

You can build macOS targets locally. Linux/Windows need cross-compilation or CI.

```sh
cd rust

# Install targets
rustup target add aarch64-apple-darwin x86_64-apple-darwin

# Build macOS ARM (Apple Silicon)
cargo build --release --target aarch64-apple-darwin

# Build macOS Intel
cargo build --release --target x86_64-apple-darwin

# Copy binaries into npm package
mkdir -p npm/binaries
cp target/aarch64-apple-darwin/release/chartli npm/binaries/chartlir-darwin-arm64
cp target/x86_64-apple-darwin/release/chartli npm/binaries/chartlir-darwin-x64

# Make executable
chmod +x npm/binaries/*
```

## Option 2: Build all targets locally with `cross`

[cross](https://github.com/cross-rs/cross) uses Docker to cross-compile for any target.

```sh
# Install cross (requires Docker running)
cargo install cross

cd rust

# Build all targets
cross build --release --target aarch64-apple-darwin
cross build --release --target x86_64-apple-darwin
cross build --release --target x86_64-unknown-linux-gnu
cross build --release --target aarch64-unknown-linux-gnu
cross build --release --target x86_64-pc-windows-msvc

# Assemble npm package
mkdir -p npm/binaries
cp target/aarch64-apple-darwin/release/chartli    npm/binaries/chartlir-darwin-arm64
cp target/x86_64-apple-darwin/release/chartli     npm/binaries/chartlir-darwin-x64
cp target/x86_64-unknown-linux-gnu/release/chartli npm/binaries/chartlir-linux-x64
cp target/aarch64-unknown-linux-gnu/release/chartli npm/binaries/chartlir-linux-arm64
cp target/x86_64-pc-windows-msvc/release/chartli.exe npm/binaries/chartlir-win32-x64.exe

chmod +x npm/binaries/chartlir-*
```

## Option 3: Build via GitHub Actions (recommended)

This is the easiest — CI builds all 5 targets on native runners.

1. Add `NPM_TOKEN` to repo Settings > Secrets > Actions
2. Go to Actions > "Release Rust CLI" > Run workflow
3. Enter the version (e.g. `0.0.5`)
4. CI builds all binaries, assembles `npm/binaries/`, and publishes

The workflow is at `.github/workflows/release-rust.yml`.

## Verify the build

After building, check the `npm/binaries/` folder:

```sh
ls -lh rust/npm/binaries/
```

Expected:

```
chartlir-darwin-arm64      ~5MB
chartlir-darwin-x64        ~5MB
chartlir-linux-arm64       ~5MB
chartlir-linux-x64         ~5MB
chartlir-win32-x64.exe     ~5MB
```

Test locally:

```sh
cd rust/npm
node bin/chartlir.js ../../examples/assets/core-single-series.txt -t spark
```

## Version bump

Before publishing, update the version in `rust/npm/package.json`:

```sh
cd rust/npm
npm version 0.0.5 --no-git-tag-version
```

#!/usr/bin/env node

const { execFileSync } = require('child_process');
const path = require('path');
const os = require('os');

const platform = os.platform();
const arch = os.arch();
const ext = platform === 'win32' ? '.exe' : '';
const name = `chartlir-${platform}-${arch}${ext}`;
const bin = path.join(__dirname, '..', 'binaries', name);

try {
	execFileSync(bin, process.argv.slice(2), { stdio: 'inherit' });
} catch (err) {
	if (err.code === 'ENOENT') {
		console.error(`No binary for ${platform}-${arch}`);
		console.error(`Supported: darwin-arm64, darwin-x64, linux-x64, linux-arm64, win32-x64`);
		console.error(`Build from source: cd rust && cargo install --path .`);
		process.exit(1);
	}
	if (err.status !== undefined) {
		process.exit(err.status);
	}
	throw err;
}

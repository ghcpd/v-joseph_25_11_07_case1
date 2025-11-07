# FileWatcher Pro v1.2 (Corrected Documentation)

Small Node.js utility for watching file changes in a directory.

## Installation

```bash
npm install filewatcher-pro
```

> Note: This project exports an ES module. Use Node.js >= 14 with `--experimental-modules` or set `"type": "module"` in `package.json`.

## Quick Start

```javascript
import { FileWatcher } from "./filewatcher.js"; // or from 'filewatcher-pro' when installed

// Correct option name: `recursive`
const watcher = new FileWatcher("./logs", { recursive: true });

watcher.on("change", (event) => {
  console.log("File changed:", event.filename);
});

watcher.start();
```

## API Reference

**Constructor**: `new FileWatcher(targetDir, options)`
- `targetDir` (string): directory to watch.
- `options` (object):
  - `recursive` (boolean): enable recursive watching. Default: `false`.
  - `filter` (RegExp|null): optional RegExp to filter filenames. Only matching filenames will emit events.
  - `logFile` (string|null): optional path to append log messages produced by the watcher.
  - `usePolling` (boolean) [DEPRECATED]: legacy option, kept for backward compatibility. Prefer using native watchers.

**start()**: Begin watching the `targetDir`. Returns nothing.

**stop()**: Stops all active watchers, emits a `stopped` event, and appends a log entry.

**debounceEvents(delayMs = 100)**: Registers an internal listener that aggregates rapid `change` events and emits a `debouncedChange` event with the last event object after `delayMs` milliseconds.

**waitForFile(filename, timeoutMs = 5000)**: Returns a Promise that resolves when `filename` appears inside `targetDir` or rejects after `timeoutMs` milliseconds.

**watchOnce(filename)** [DEPRECATED]: Alias for `waitForFile(filename)`. Emits a console warning when used.

Events emitted by FileWatcher (EventEmitter):
- `change`: emitted for every low-level change with `{ eventType, filename }`.
- `debouncedChange`: emitted if `debounceEvents()` was used — fires with the last event after the debounce delay.
- `stopped`: emitted when `stop()` finishes.

## Examples

1) Simple watch (corrected):

```javascript
import { FileWatcher } from './filewatcher.js';
const w = new FileWatcher('./logs', { recursive: true });
w.on('change', e => console.log('changed', e.filename));
w.start();

// ...later
w.stop();
```

2) Using `debounceEvents`:

```javascript
const w2 = new FileWatcher('./logs', { recursive: true });
w2.debounceEvents(200);
w2.on('debouncedChange', e => console.log('debounced', e.filename));
w2.start();
```

3) Waiting for a file to appear:

```javascript
const w3 = new FileWatcher('./logs');
await w3.waitForFile('myfile.txt', 10000);
console.log('file is present');
```

4) Filtering and logging:

```javascript
const w4 = new FileWatcher('./logs', { filter: /\.log$/, logFile: './watcher.log' });
w4.on('change', e => console.log('log changed:', e.filename));
w4.start();
```

## Notes & Known Issues
- The README in the release mistakenly used `recursiveMode` as the option name — the implementation expects `recursive`.
- `filter` and `logFile` are implemented but were missing from earlier docs; they're added here.
- `watchOnce` is deprecated in favor of `waitForFile`.

If you'd like, I can also create a small test harness and setup scripts to run these examples automatically.

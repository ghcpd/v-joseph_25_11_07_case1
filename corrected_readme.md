# FileWatcher Pro v1.2 — Documentation (Corrected)

FileWatcher Pro is a minimal Node.js utility to watch file changes in a directory and perform simple file-based sync tasks or CI triggers.

## Installation

```bash
# If published to npm:
npm install filewatcher-pro

# Locally (for development):
# Use the repository root and import with the relative path in examples
```

## Quick Usage

```javascript
import { FileWatcher } from "./filewatcher.js";

// Create a watcher for './logs' with recursion enabled (option name: `recursive`)
const watcher = new FileWatcher("./logs", { recursive: true });

watcher.on("change", (event) => {
  console.log("File changed:", event.filename); // event: { eventType, filename }
});

watcher.start();

// Stop when finished
// watcher.stop();
```

---

## Full API Reference

### new FileWatcher(targetDir, options)
Constructs a `FileWatcher` instance.

Parameters
- `targetDir` (string) - Directory path to watch.
- `options` (object) - Optional settings:
  - `recursive` (boolean) - Watch subdirectories recursively (default: false). *Note:* older docs use `recursiveMode`; this library expects `recursive`.
  - `filter` (RegExp) - Filter pattern to accept only filenames that match (e.g., `/.*\\.log$/`).
  - `logFile` (string) - Path to an append log file where internal messages are saved.
  - `usePolling` (boolean) - Deprecated: previously suggested a polling-based watcher mode; now ignored and retained for compatibility.

Properties
- `logs` (Array) - In-memory array of log entries that have been recorded by the internal `_log()` calls.

Events
- `change` - Emitted on each raw change event: `(event) => { eventType, filename }`.
- `debouncedChange` - Emitted when `debounceEvents()` is enabled and combined into a single event after a debounce delay.
- `stopped` - Emitted when `stop()` is called after watchers are closed.

### start()
Start watching `targetDir`. Adds an `fs.watch` instance internally and pushes it into `this.watchers`.

### stop()
Stop all watchers. Closes internal watchers, clears the watchers list, emits `stopped` event, and logs that watchers stopped.

### debounceEvents(delayMs = 100)
Enable a simple debouncing mechanism by listening to `change` events and emitting `debouncedChange` after `delayMs`. Use this to group multiple rapid events (e.g., multiple writes) into a single emitted event.

Example:
```javascript
const w = new FileWatcher('./testdir');
w.debounceEvents(200);
w.on('debouncedChange', (e) => console.log('debounced', e));
w.start();
```

### waitForFile(filename, timeoutMs = 5000)
Wait asynchronously for a specific file to appear in `targetDir`. Returns a Promise that resolves to `true` if the file is found before `timeoutMs` elapses; otherwise rejects with a timeout error.

Example:
```javascript
const w = new FileWatcher('./testdir');
w.start();
await w.waitForFile('done.txt', 10000);
```

### watchOnce(filename)
Deprecated: A small wrapper around `waitForFile()` with a console warning. It will still work but it's recommended to use `waitForFile()` instead.

### _log(message)
Internally used to record runtime messages in the in-memory `logs` property and optionally append to `logFile`.

---

## Examples and Usage Patterns

1) Basic watch
```javascript
import { FileWatcher } from './filewatcher.js';
const w = new FileWatcher('./logs', { recursive: true });
w.on('change', (e) => console.log('File changed', e.filename));
w.start();
```

2) Filter event by filename pattern
```javascript
const _w = new FileWatcher('./logs', { recursive: true, filter: /.*\\.log$/ });
_w.on('change', e => console.log('log event', e.filename));
_w.start();
```

3) Write to log file and inspect logs
```javascript
const l = new FileWatcher('./logs', { recursive: true, logFile: './logs/fs.log' });
l.start();
// After some events:
console.log('Recent log entries:', l.logs.slice(-5));
```

4) Debounce frequent events
```javascript
const db = new FileWatcher('./logs', { recursive: true });
db.debounceEvents(200); // 200 ms grouping
db.on('debouncedChange', e => console.log('Debounced =>', e.filename));
db.start();
```

5) Wait for a file to be created
```javascript
const w2 = new FileWatcher('./logs');
w2.start();
await w2.waitForFile('report.txt', 5000);
console.log('report.txt created');
```

6) Deprecated watcher flow
```javascript
const w3 = new FileWatcher('./logs');
// watchOnce is deprecated
w3.watchOnce('hello.txt').then(() => console.log('hello.txt created - note: watchOnce is deprecated'));
```

---

## Notes & Compatibility
- This library uses Node's `fs.watch` (OS dependent). On Windows, a single write can emit several `change` events for the same action; use `debounceEvents` to group them.
- Avoid relying on `usePolling`; it is a legacy option.
- `watchOnce()` is deprecated; prefer `waitForFile()`.

---

## Contributing & Testing
- Please run unit and integration tests using `run_tests.sh` (Linux/macOS shell) or `.











This README corrects the main API mismatches and documents all implemented behaviors as of v1.2.```node ./test/test_examples.js```bash## Example test run (quick)---- If modifying behavior around `fs.watch` make sure to include platform-specific tests and document expected runtime behavior.un_tests.ps1` on PowerShell.
# FileWatcher Pro v1.2 — Documentation (Corrected)

A simple Node.js utility for watching file changes in a directory, with filtering, debouncing, logging, and wait-for-file utilities.

## Installation

```bash
npm install filewatcher-pro
```

If you are using this repository directly, ensure your project `package.json` has `"type": "module"` so you can use `import` syntax, or use `require()` (CommonJS) if not.

## Quick Usage

```javascript
// ES module (requires `type: module` in package.json)
import { FileWatcher } from "./filewatcher.js";

const watcher = new FileWatcher("./logs", { recursive: true, filter: /\\.log$/i, logFile: './logs/watch.log' });

// `change` events include { eventType, filename }
watcher.on("change", (event) => {
  console.log("File changed:", event.filename, "type:", event.eventType);
});

// `debouncedChange` is emitted when you use debounceEvents()
watcher.on("debouncedChange", (event) => console.log('Debounced change:', event.filename));

// `stopped` event is emitted when stop() is called
watcher.on('stopped', () => console.log('Watchers stopped'));

watcher.start();

// Stop later
setTimeout(() => watcher.stop(), 5000);
```

## API Reference

### new FileWatcher(targetDir, options)

Create a FileWatcher for the specified directory.

Options (all optional):
- `recursive` (boolean): Enable recursive watching (maps to native `fs.watch` `recursive` option). Default: false. NOTE: The README previously mentioned `recursiveMode`; the actual implemented property is `recursive`.
- `filter` (RegExp): Only emit events for filenames matching the regex. If not provided, all files trigger events.
- `logFile` (string): When set, the watcher will append human-readable log entries to this file.
- `usePolling` (boolean) (DEPRECATED): Previously used option. The library still accepts it but it has no effect; please avoid using it.

### start()
Begin watching for file changes. Returns nothing.

### stop()
Stop all watchers. This will close file watchers, clear the `watchers` array and emit a `stopped` event. It also appends a log entry if `logFile` is set.

### debounceEvents(delayMs = 100)
Enable a simple debounce of rapid `change` events. After calling this, the watcher will emit `debouncedChange` events instead of raw `change` bursts. Example:

```javascript
const w = new FileWatcher('./logs');
w.debounceEvents(200);
w.on('debouncedChange', (e)=>console.log('debounced', e.filename));
```

### waitForFile(filename, timeoutMs = 5000)
Return a Promise that resolves when the specified filename exists in the target directory, or rejects after timeout.

```javascript
await new FileWatcher('./logs').waitForFile('ready.txt', 5000);
```

### watchOnce(filename)
Deprecated helper (calls `waitForFile`). It will print a deprecation message to stderr. Example:

```javascript
watcher.watchOnce('ready.txt').then(()=>console.log('file ready'));
```

### Events
- `change`: Emitted for each raw `fs.watch` event. Payload: `{ eventType, filename }`.
- `debouncedChange`: Emitted when `debounceEvents()` is used; similar payload as `change`.
- `stopped`: Emitted when `stop()` is called.

## Examples

1) Basic (ESM)

```javascript
import { FileWatcher } from './filewatcher.js';
const watcher = new FileWatcher('./logs', { recursive: true });
watcher.on('change', event => console.log('File changed', event.filename));
watcher.start();
```

2) Filtering only `*.log`

```javascript
const watcher = new FileWatcher('./logs', { filter: /\\.log$/i });
watcher.on('change', (e)=>console.log('log changed', e.filename));
watcher.start();
```

3) Logging to file

```javascript
const watcher = new FileWatcher('./logs', { logFile: './logs/watcher.log' });
watcher.start();
```

4) Debounce example

```javascript
const watcher = new FileWatcher('./logs');
watcher.debounceEvents(250);
watcher.on('debouncedChange', (e)=>console.log('debouncedChange', e.filename));
watcher.start();
```

5) Wait for file

```javascript
const watcher = new FileWatcher('./logs');
await watcher.waitForFile('sync.ready', 4000);
console.log('File present');
```

## Notes & Compatibility
- The library re-exposes native `fs.watch` semantics for `eventType` and `filename`. The exact `eventType` values depend on the underlying OS (usually 'change'/'rename').
- If using `import` (ES modules), ensure `package.json` includes `"type": "module"`.

---

If you discover a change in behavior on your OS (e.g., Windows vs Linux) with `recursive` watching, please file an issue. This README was updated to document all public APIs implemented in `filewatcher.js`.

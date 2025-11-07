# FileWatcher Pro v1.2 — Documentation (Corrected)

A small Node.js utility for watching file changes in a directory.

## Installation
```bash
npm install filewatcher-pro
```

> NOTE: If you're using the local source file (`./filewatcher.js`) or running tests, add `"type": "module"` to `package.json` or use `.mjs` extensions. See `setup.sh` for an automated helper.

## Quick usage
```javascript
import { FileWatcher } from './filewatcher.js'; // local file
// or
import { FileWatcher } from 'filewatcher-pro'; // published module

const watcher = new FileWatcher('./logs', { recursive: true });

// will be emitted for every matching event
watcher.on('change', (event) => {
  console.log('File changed:', event.eventType, event.filename);
});

watcher.start();

// stop() will close watchers and emit 'stopped'
watcher.stop();
```

---

## API Reference

### new FileWatcher(targetDir, options)
Create a watcher for the specified directory.

Options:
- `recursive` (boolean): Enable recursive watching. Default: `false`.
  - README used `recursiveMode` previously — this was incorrect. Use `recursive`.
- `filter` (RegExp | string): Only allow events where the filename matches the regex or string. Example: `/\\.log$/` to watch only `.log` files.
- `logFile` (string): A path to append human-readable log entries to on each event.
- `usePolling` (boolean): A deprecated option kept for backwards compatibility — avoid using it.

Properties:
- `logs` (Array<string>): In-memory array of log entries. Useful for tests/debugging.

Events:
- `change` — (event) fired on any change; event object: `{ eventType, filename }`.
- `debouncedChange` — (event) fired when `debounceEvents()` is used. Only emits once after changes stop.
- `stopped` — emitted after `stop()` completes.

Example with `filter` and `logFile`:
```javascript
const watcher = new FileWatcher('./logs', { filter: /\\.log$/, logFile: './fw-activity.log' });
watcher.start();
```

### start()
Begin watching for file changes.

Behavior: Uses Node's `fs.watch` — remember that `fs.watch` has platform quirks. On many systems, file creation shows as `rename` + filename.

### stop()
Stop all watchers. Also emits `stopped`.

### debounceEvents(delayMs = 100)
Add a debounced handler to `change` events; when multiple changes happen in quick succession, only a single `debouncedChange` event will be emitted after `delayMs` ms. Use when you expect bursty writes.

### waitForFile(filename, timeoutMs = 5000)
Returns a Promise that resolves when a file with name `filename` appears under the watched directory. Useful for test scripts that wait for asynchronous creators. Example:
```javascript
await watcher.waitForFile('file_done.txt');
```

### watchOnce(filename) — deprecated
This function waits for the file and returns a Promise but logs a deprecation warning. Use `waitForFile()` instead.

---

## Testing & Examples
See `test_files/` for runnable examples and scripts. Run the tests using `./run_tests.sh` (on bash) after `./setup.sh`.

Examples in `test_files` cover:
- Basic change detection
- `filter` option
- `logFile` writing
- `debounceEvents` + `debouncedChange`
- `waitForFile`
- `watchOnce` deprecation

---

## Notes
- The README earlier used `recursiveMode` — the implementation uses `recursive`. The corrected examples above fix this.
- If you publish the package to npm, provide usage examples showing both ESM and CommonJS imports and validate module type.

# FileWatcher Pro v1.2 (Corrected README)

A simple Node.js utility for watching file changes in a directory.

## Installation

```bash
npm install filewatcher-pro
```

## Usage (examples)

```javascript
import { FileWatcher } from './filewatcher.js';

// Basic watcher (recursive)
const watcher = new FileWatcher('./logs', { recursive: true });
watcher.on('change', e => console.log('File changed:', e.filename));
watcher.start();

// Using filter to only receive .txt files
const txtWatcher = new FileWatcher('./logs', { filter: /\.txt$/ });
txtWatcher.on('change', e => console.log('TXT change:', e.filename));
txtWatcher.start();

// Debounced notifications
const d = new FileWatcher('./logs');
d.debounceEvents(200); // emit 'debouncedChange' instead of many 'change'
d.on('debouncedChange', e => console.log('Debounced:', e.filename));
d.start();

// Wait for a file to appear
const w = new FileWatcher('./logs');
w.waitForFile('special.log', 5000).then(()=> console.log('file created'))

// Log to a file
const logged = new FileWatcher('./logs', { logFile: './watch.log' });
logged.start();

// Stop watchers
watcher.stop();
```

## API Reference

### `new FileWatcher(targetDir, options)`
Create a watcher for the specified directory.

Options:
- `recursive` (boolean): Enable recursive watching. (README previously said `recursiveMode` — this is incorrect.)
- `filter` (RegExp): Only accept filenames matching this regex (undocumented in prior README).
- `logFile` (string): Path to append timestamped logs for internal events.
- `usePolling` (boolean): Deprecated (legacy option), present for backward compatibility.

### Events
- `change` — Emitted when a change occurs: (eventType, filename) object is passed.
- `debouncedChange` — Emitted when `debounceEvents()` is used and multiple rapid changes are collapsed into one.
- `stopped` — Emitted when `stop()` is called and watchers are torn down.

### Methods
- `start()` — Begin watching for file changes.
- `stop()` — Stop all watchers, emits `stopped`.
- `debounceEvents(delayMs = 100)` — Register a debounce on 'change' events; emits 'debouncedChange' instead.
- `waitForFile(filename, timeoutMs = 5000)` — Returns a Promise which resolves when the file appears.
- `watchOnce(filename)` — Deprecated. Use `waitForFile()` instead. (It still works and will warn to console.)


## Notes
- The README originally referenced a non-existent option `recursiveMode` and omitted several exposed features such as `filter`, `logFile`, new events, and deprecated behavior. This corrected README adds full usage examples and documents all available options.


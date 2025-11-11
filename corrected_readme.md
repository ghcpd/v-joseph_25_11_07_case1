# FileWatcher Pro v1.2

A simple Node.js utility for watching file changes in a directory.

## Installation

```bash
npm install filewatcher-pro
```

## Quick Start

```javascript
import { FileWatcher } from "./filewatcher.js";

const watcher = new FileWatcher("./logs", { recursive: true });

watcher.on("change", (event) => {
  console.log("File changed:", event.filename);
  console.log("Event type:", event.eventType);
});

watcher.start();
```

## API Reference

### `new FileWatcher(targetDir, options)`

Create a watcher for the specified directory.

**Parameters:**
- `targetDir` (string): The directory path to watch
- `options` (object, optional): Configuration options

**Options:**
- `recursive` (boolean, default: `false`): Enable recursive watching of subdirectories
- `filter` (RegExp, optional): Filter files by regex pattern. Only files matching the pattern will trigger events
- `logFile` (string, optional): Path to a log file where all events will be written
- `usePolling` (boolean, default: `false`): **DEPRECATED** - This option is deprecated and will be removed in a future version

**Example:**
```javascript
// Basic usage
const watcher = new FileWatcher("./logs");

// Recursive watching
const watcher = new FileWatcher("./logs", { recursive: true });

// Filter only .txt files
const watcher = new FileWatcher("./logs", { filter: /\.txt$/ });

// Enable logging to file
const watcher = new FileWatcher("./logs", { logFile: "./watcher.log" });

// Combined options
const watcher = new FileWatcher("./logs", {
  recursive: true,
  filter: /\.(txt|json)$/,
  logFile: "./watcher.log"
});
```

### `start()`

Begin watching for file changes. This method must be called after setting up event listeners.

**Example:**
```javascript
const watcher = new FileWatcher("./logs");
watcher.on("change", (event) => {
  console.log("Change detected:", event.filename);
});
watcher.start();
```

### `stop()`

Stop all watchers and emit a `stopped` event.

**Example:**
```javascript
watcher.stop();
watcher.on("stopped", () => {
  console.log("Watcher stopped");
});
```

### `debounceEvents(delayMs = 100)`

Debounce change events to reduce the number of events fired during rapid file changes. After calling this method, change events will be debounced and emitted as `debouncedChange` events.

**Parameters:**
- `delayMs` (number, default: `100`): Delay in milliseconds before emitting the debounced event

**Example:**
```javascript
const watcher = new FileWatcher("./logs");
watcher.debounceEvents(200); // 200ms debounce delay

watcher.on("debouncedChange", (event) => {
  console.log("Debounced change:", event.filename);
});

watcher.start();
```

### `async waitForFile(filename, timeoutMs = 5000)`

Wait for a specific file to appear in the watched directory. Returns a Promise that resolves when the file exists or rejects if the timeout is exceeded.

**Parameters:**
- `filename` (string): Name of the file to wait for
- `timeoutMs` (number, default: `5000`): Maximum time to wait in milliseconds

**Returns:**
- `Promise<boolean>`: Resolves to `true` when file is found

**Example:**
```javascript
const watcher = new FileWatcher("./logs");
watcher.start();

try {
  await watcher.waitForFile("important.txt", 10000);
  console.log("File appeared!");
} catch (error) {
  console.error("Timeout waiting for file:", error.message);
}
```

### `watchOnce(filename)` ⚠️ DEPRECATED

**Deprecated:** Use `waitForFile()` instead. This method will be removed in a future version.

Wait for a file to appear once. This is a deprecated wrapper around `waitForFile()`.

## Events

### `change`

Emitted when a file change is detected in the watched directory.

**Event Object:**
- `eventType` (string): Type of change (`"rename"` or `"change"`)
- `filename` (string): Name of the file that changed

**Example:**
```javascript
watcher.on("change", (event) => {
  console.log(`File ${event.filename} was ${event.eventType}d`);
});
```

### `debouncedChange`

Emitted after debouncing change events. Only available after calling `debounceEvents()`.

**Event Object:**
- Same structure as `change` event

**Example:**
```javascript
watcher.debounceEvents(300);
watcher.on("debouncedChange", (event) => {
  console.log("Debounced:", event.filename);
});
```

### `stopped`

Emitted when `stop()` is called and all watchers have been closed.

**Example:**
```javascript
watcher.on("stopped", () => {
  console.log("All watchers stopped");
});
```

## Properties

### `logs` (read-only)

An array containing log entries. Logs are automatically added when events occur, especially when `logFile` option is enabled.

**Example:**
```javascript
watcher.on("change", () => {
  console.log("Recent logs:", watcher.logs.slice(-5));
});
```

## Complete Examples

### Example 1: Basic File Watching

```javascript
import { FileWatcher } from "./filewatcher.js";
import fs from "fs";

const watcher = new FileWatcher("./logs", { recursive: true });

watcher.on("change", (event) => {
  console.log(`[${event.eventType}] ${event.filename}`);
});

watcher.start();

// Create a test file
setTimeout(() => {
  fs.writeFileSync("./logs/test.txt", "Hello World");
}, 1000);

// Stop after 5 seconds
setTimeout(() => {
  watcher.stop();
}, 5000);
```

### Example 2: Filtered File Watching

```javascript
import { FileWatcher } from "./filewatcher.js";

// Only watch .json files
const watcher = new FileWatcher("./data", {
  recursive: true,
  filter: /\.json$/
});

watcher.on("change", (event) => {
  console.log("JSON file changed:", event.filename);
});

watcher.start();
```

### Example 3: Debounced Events

```javascript
import { FileWatcher } from "./filewatcher.js";
import fs from "fs";

const watcher = new FileWatcher("./uploads");
watcher.debounceEvents(500); // Wait 500ms after last change

let changeCount = 0;
watcher.on("debouncedChange", (event) => {
  changeCount++;
  console.log(`Debounced change #${changeCount}: ${event.filename}`);
});

watcher.start();

// Rapid file changes will be debounced
for (let i = 0; i < 10; i++) {
  fs.writeFileSync(`./uploads/file${i}.txt`, `content ${i}`);
}
// Only one debouncedChange event will fire
```

### Example 4: Waiting for Files

```javascript
import { FileWatcher } from "./filewatcher.js";

const watcher = new FileWatcher("./output");
watcher.start();

async function processWhenReady() {
  try {
    await watcher.waitForFile("result.json", 10000);
    console.log("Result file is ready!");
    // Process the file
  } catch (error) {
    console.error("File did not appear in time");
  }
}

processWhenReady();
```

### Example 5: Logging to File

```javascript
import { FileWatcher } from "./filewatcher.js";

const watcher = new FileWatcher("./logs", {
  recursive: true,
  logFile: "./watcher.log"
});

watcher.on("change", (event) => {
  console.log("Change detected:", event.filename);
});

watcher.start();

// All events are also logged to ./watcher.log
```

### Example 6: Error Handling

```javascript
import { FileWatcher } from "./filewatcher.js";

const watcher = new FileWatcher("./logs");

watcher.on("change", (event) => {
  console.log("Change:", event.filename);
});

watcher.start();

// Wait for file with timeout
watcher.waitForFile("important.txt", 5000)
  .then(() => {
    console.log("File found!");
  })
  .catch((error) => {
    console.error("Error:", error.message);
  })
  .finally(() => {
    watcher.stop();
  });
```

## Notes

- The watcher uses Node.js `fs.watch()` under the hood
- On some platforms, `fs.watch()` may not be completely reliable
- The `recursive` option may not work on all platforms (Windows, macOS, and Linux support it)
- File events may fire multiple times for a single file operation (e.g., both `rename` and `change` events)
- Use `debounceEvents()` to handle rapid file changes more efficiently

## Version History

- **v1.2**: Current version
  - Added `debounceEvents()` method
  - Added `waitForFile()` method
  - Added `filter` option
  - Added `logFile` option
  - Deprecated `watchOnce()` in favor of `waitForFile()`
  - Deprecated `usePolling` option


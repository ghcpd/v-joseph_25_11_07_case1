# FileWatcher Pro v1.2

A robust Node.js utility for watching file changes in a directory with advanced features like filtering, debouncing, and event logging.

## Installation

```bash
npm install filewatcher-pro
```

## Quick Start

```javascript
import { FileWatcher } from "./filewatcher.js";

const watcher = new FileWatcher("./logs", { recursive: true });

watcher.on("change", (event) => {
  console.log("File changed:", event.filename, "Event type:", event.eventType);
});

watcher.start();

// Later, stop watching
watcher.stop();
```

## API Reference

### Constructor: `new FileWatcher(targetDir, options)`

Creates a watcher for the specified directory.

**Parameters:**
- `targetDir` (string): Path to the directory to watch
- `options` (object, optional): Configuration options

**Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `recursive` | boolean | `false` | Enable recursive watching of subdirectories |
| `filter` | RegExp | `null` | Optional regex pattern to filter watched files (e.g., `/\.log$/` for .log files only) |
| `logFile` | string | `null` | Optional file path to log all watcher events to disk |
| `usePolling` | boolean | `false` | **DEPRECATED**: Use native fs.watch instead |

**Example with Options:**
```javascript
const watcher = new FileWatcher("./logs", {
  recursive: true,
  filter: /\.log$/,        // Only watch .log files
  logFile: "watcher.log"   // Log events to file
});
```

---

### Methods

#### `start()`

Begin watching for file changes. Emits "change" event for each detected change.

**Behavior:**
- Starts the internal file system watcher
- Applies filter if configured
- Logs events if logFile option was set

**Example:**
```javascript
const watcher = new FileWatcher("./logs", { recursive: true });
watcher.start();
```

---

#### `stop()`

Stop all watchers and cleanup resources.

**Behavior:**
- Closes all internal fs.watch instances
- Clears watcher array
- Emits "stopped" event
- Logs shutdown message

**Example:**
```javascript
watcher.stop();
```

---

#### `debounceEvents(delayMs)`

Debounce rapid file change events into a single event after a delay period.

**Parameters:**
- `delayMs` (number): Delay in milliseconds (default: 100)

**Behavior:**
- When enabled, emits "debouncedChange" event instead of rapid "change" events
- Useful when multiple changes happen in quick succession
- Automatically resets timer if new changes occur during delay period

**Example:**
```javascript
const watcher = new FileWatcher("./logs", { recursive: true });
watcher.debounceEvents(300); // Debounce with 300ms delay

watcher.on("debouncedChange", (event) => {
  console.log("Debounced change:", event.filename);
});

watcher.start();
```

---

#### `async waitForFile(filename, timeoutMs)`

Wait for a specific file to appear in the watched directory.

**Parameters:**
- `filename` (string): Name of the file to wait for
- `timeoutMs` (number): Timeout in milliseconds (default: 5000)

**Returns:** Promise<boolean>

**Behavior:**
- Polls the file system every 200ms
- Resolves immediately if file exists
- Rejects with error if timeout is exceeded
- Does not require watcher to be running

**Example:**
```javascript
const watcher = new FileWatcher("./downloads");

try {
  await watcher.waitForFile("report.pdf", 10000);
  console.log("File appeared!");
} catch (error) {
  console.log("File did not appear within timeout");
}
```

---

#### `watchOnce(filename)` - DEPRECATED

**Status:** Deprecated. Use `waitForFile()` instead.

**Previous behavior:** Waited for a single file to appear.

**Migration:**
```javascript
// Old (deprecated)
watcher.watchOnce("file.txt");

// New (recommended)
await watcher.waitForFile("file.txt");
```

---

### Events

#### `"change"` Event

Emitted when a file change is detected.

**Event Payload:**
```javascript
{
  eventType: "rename" | "change",  // Type of change detected
  filename: string                  // Name of the changed file
}
```

**Example:**
```javascript
watcher.on("change", (event) => {
  console.log(`${event.eventType}: ${event.filename}`);
});
```

---

#### `"debouncedChange"` Event

Emitted when debounce timer fires (only if `debounceEvents()` is called).

**Event Payload:** Same as "change" event

**Example:**
```javascript
watcher.debounceEvents(200);

watcher.on("debouncedChange", (event) => {
  console.log("Final change after debounce:", event.filename);
});
```

---

#### `"stopped"` Event

Emitted when the watcher is stopped via `stop()` method.

**Example:**
```javascript
watcher.on("stopped", () => {
  console.log("Watcher has been stopped");
});

watcher.stop(); // Triggers "stopped" event
```

---

### Properties

#### `logs` (Array<string>)

Read-only property containing history of all watcher events with timestamps.

**Example:**
```javascript
const watcher = new FileWatcher("./logs", { logFile: "debug.log" });

watcher.on("change", () => {
  // ... events logged internally ...
});

// Access logs
console.log(watcher.logs);
// Output: ["[2024-01-15T10:30:22.123Z] Event: change -> file.txt", ...]
```

---

## Complete Example

```javascript
import { FileWatcher } from "./filewatcher.js";
import fs from "fs";

async function main() {
  const watcher = new FileWatcher("./data", {
    recursive: true,
    filter: /\.json$/,        // Only watch JSON files
    logFile: "events.log"     // Log to file
  });

  // Listen for debounced changes
  watcher.debounceEvents(500);

  watcher.on("debouncedChange", (event) => {
    console.log(`Updated: ${event.filename}`);
  });

  watcher.on("stopped", () => {
    console.log("Monitoring stopped.");
  });

  watcher.start();
  console.log("Watching directory...");

  // Wait for specific file
  try {
    await watcher.waitForFile("config.json", 30000);
    console.log("Config file detected!");
  } catch (error) {
    console.log("Config file not found:", error.message);
  }

  // Later: stop watching
  setTimeout(() => {
    watcher.stop();
    
    // Show logs
    console.log("\nEvent History:");
    watcher.logs.forEach(log => console.log(log));
  }, 60000);
}

main();
```

---

## Differences from v1.1

- Added `filter` option for regex-based file filtering
- Added `logFile` option for persistent event logging
- Added `debounceEvents()` method for event throttling
- Added `waitForFile()` async method for file detection
- Deprecated `watchOnce()` in favor of `waitForFile()`
- Added event emission on watcher stop
- Added internal event logging to `logs` array

---

## Error Handling

All methods handle errors gracefully:

```javascript
try {
  await watcher.waitForFile("file.txt", 5000);
} catch (error) {
  console.error("Error:", error.message);
  // Possible error: "Timeout waiting for file.txt"
}
```

---

## Performance Notes

- Use `filter` option to reduce unnecessary event processing
- Use `recursive: false` for top-level directory only to improve performance
- Use `debounceEvents()` to reduce processing for rapid changes
- Event logging to disk (`logFile`) has minimal performance impact

---

## License

MIT

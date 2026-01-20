// test_files/test-stopped-event.js
// Test 6: "stopped" event emission

import { FileWatcher } from "../filewatcher.js";
import fs from "fs";

const testDir = "./test_data";

async function test() {
  console.log("TEST 6: Stopped Event");
  console.log("=====================\n");

  // Setup
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  const watcher = new FileWatcher(testDir);
  let stoppedEventEmitted = false;

  watcher.on("stopped", () => {
    stoppedEventEmitted = true;
    console.log("✓ 'stopped' event emitted");
  });

  watcher.start();
  console.log("✓ Watcher started");

  // Wait a moment then stop
  await new Promise(resolve => setTimeout(resolve, 100));

  watcher.stop();
  console.log("✓ Watcher stop() called");

  // Wait to ensure event processing
  await new Promise(resolve => setTimeout(resolve, 100));

  if (stoppedEventEmitted) {
    console.log("✓ PASS: 'stopped' event was properly emitted");
  } else {
    console.log("✗ FAIL: 'stopped' event was not emitted");
  }

  // Cleanup
  fs.rmSync(testDir, { recursive: true, force: true });
  console.log("✓ Test cleanup complete\n");

  return stoppedEventEmitted;
}

export default test;

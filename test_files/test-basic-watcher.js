// test_files/test-basic-watcher.js
// Test 1: Basic watcher functionality with correct parameter names

import { FileWatcher } from "../filewatcher.js";
import fs from "fs";
import path from "path";

const testDir = "./test_data";

async function test() {
  console.log("TEST 1: Basic Watcher (Correct Parameter)");
  console.log("==========================================\n");

  // Setup
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  const watcher = new FileWatcher(testDir, { recursive: true });
  let changeDetected = false;
  let eventDetails = null;

  watcher.on("change", (event) => {
    changeDetected = true;
    eventDetails = event;
    console.log("✓ Change event detected:", event.filename, `(${event.eventType})`);
  });

  watcher.start();
  console.log("✓ Watcher started successfully");

  // Trigger a change
  const testFile = path.join(testDir, "test.txt");
  fs.writeFileSync(testFile, "test content");
  console.log("✓ Test file created");

  // Wait for event
  await new Promise(resolve => setTimeout(resolve, 500));

  if (changeDetected) {
    console.log("✓ PASS: Event was properly emitted");
  } else {
    console.log("✗ FAIL: Event was not emitted");
  }

  watcher.stop();
  console.log("✓ Watcher stopped");

  // Cleanup
  fs.rmSync(testDir, { recursive: true, force: true });
  console.log("✓ Test cleanup complete\n");

  return changeDetected;
}

export default test;

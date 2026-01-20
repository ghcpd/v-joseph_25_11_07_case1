// test_files/test-logfile-option.js
// Test 3: LogFile option for persistent event logging

import { FileWatcher } from "../filewatcher.js";
import fs from "fs";
import path from "path";

const testDir = "./test_data";
const logFile = "./test_watcher.log";

async function test() {
  console.log("TEST 3: LogFile Option (Event Persistence)");
  console.log("==========================================\n");

  // Setup
  if (fs.existsSync(logFile)) {
    fs.unlinkSync(logFile);
  }
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  const watcher = new FileWatcher(testDir, {
    recursive: true,
    logFile: logFile
  });

  watcher.start();
  console.log(`✓ Watcher started with logFile: ${logFile}`);

  // Create a test file
  const testFile = path.join(testDir, "logged-event.txt");
  fs.writeFileSync(testFile, "content");
  console.log("✓ Test file created");

  // Wait for logging
  await new Promise(resolve => setTimeout(resolve, 500));

  watcher.stop();
  console.log("✓ Watcher stopped");

  // Check if log file was created and has content
  let logFileExists = fs.existsSync(logFile);
  let logContent = "";
  let hasEvents = false;

  if (logFileExists) {
    logContent = fs.readFileSync(logFile, "utf-8");
    hasEvents = logContent.includes("Event:");
    console.log("✓ Log file created");
    console.log("✓ Log file content preview:");
    console.log("  " + logContent.split("\n")[0]);
  } else {
    console.log("✗ Log file was not created");
  }

  if (logFileExists && hasEvents) {
    console.log("✓ PASS: Events were logged to file");
  } else {
    console.log("✗ FAIL: Events were not properly logged");
  }

  // Cleanup
  if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
  if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
  console.log("✓ Test cleanup complete\n");

  return logFileExists && hasEvents;
}

export default test;

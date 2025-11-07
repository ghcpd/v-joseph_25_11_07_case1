// test_files/test-filter-option.js
// Test 2: Filter option for regex matching

import { FileWatcher } from "../filewatcher.js";
import fs from "fs";
import path from "path";

const testDir = "./test_data";

async function test() {
  console.log("TEST 2: Filter Option (Regex Filtering)");
  console.log("=======================================\n");

  // Setup
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  const watcher = new FileWatcher(testDir, {
    recursive: true,
    filter: /\.log$/ // Only .log files
  });

  let logFileDetected = false;
  let txtFileDetected = false;

  watcher.on("change", (event) => {
    if (event.filename.match(/\.log$/)) {
      logFileDetected = true;
      console.log("✓ .log file change detected:", event.filename);
    }
    if (event.filename.match(/\.txt$/)) {
      txtFileDetected = true;
      console.log("✗ .txt file change detected (should be filtered):", event.filename);
    }
  });

  watcher.start();
  console.log("✓ Watcher started with filter: /\\.log$/");

  // Create .log file
  const logFile = path.join(testDir, "app.log");
  fs.writeFileSync(logFile, "log content");
  console.log("✓ Created .log file");

  // Create .txt file (should not trigger due to filter)
  const txtFile = path.join(testDir, "readme.txt");
  fs.writeFileSync(txtFile, "text content");
  console.log("✓ Created .txt file");

  // Wait for events
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (logFileDetected && !txtFileDetected) {
    console.log("✓ PASS: Filter correctly allowed .log and blocked .txt");
  } else {
    console.log("✗ FAIL: Filter behavior incorrect");
  }

  watcher.stop();
  console.log("✓ Watcher stopped");

  // Cleanup
  fs.rmSync(testDir, { recursive: true, force: true });
  console.log("✓ Test cleanup complete\n");

  return logFileDetected && !txtFileDetected;
}

export default test;

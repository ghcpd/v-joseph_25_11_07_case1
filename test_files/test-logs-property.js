// test_files/test-logs-property.js
// Test 7: logs property access

import { FileWatcher } from "../filewatcher.js";
import fs from "fs";
import path from "path";

const testDir = "./test_data";

async function test() {
  console.log("TEST 7: Logs Property");
  console.log("=====================\n");

  // Setup
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  const watcher = new FileWatcher(testDir, { recursive: true });

  console.log("✓ Watcher created");
  console.log(`✓ Initial logs array: ${watcher.logs.length} entries`);

  watcher.start();
  console.log("✓ Watcher started");

  // Trigger some changes
  const testFile1 = path.join(testDir, "log-test1.txt");
  const testFile2 = path.join(testDir, "log-test2.txt");

  fs.writeFileSync(testFile1, "content1");
  await new Promise(resolve => setTimeout(resolve, 100));
  fs.writeFileSync(testFile2, "content2");
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log("✓ Created 2 test files");

  watcher.stop();
  console.log("✓ Watcher stopped");

  // Check logs
  const logsCount = watcher.logs.length;
  console.log(`✓ Logs array contains: ${logsCount} entries`);

  if (logsCount > 0) {
    console.log("✓ First log entry:");
    console.log(`  ${watcher.logs[0]}`);
    console.log("✓ Last log entry:");
    console.log(`  ${watcher.logs[logsCount - 1]}`);
  }

  if (logsCount >= 3) { // At least 2 change events + 1 stop event
    console.log("✓ PASS: Logs property captures events correctly");
  } else {
    console.log("✗ FAIL: Insufficient log entries");
  }

  // Cleanup
  fs.rmSync(testDir, { recursive: true, force: true });
  console.log("✓ Test cleanup complete\n");

  return logsCount >= 3;
}

export default test;

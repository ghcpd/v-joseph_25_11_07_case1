// test_files/test-wait-for-file.js
// Test 5: waitForFile() async method

import { FileWatcher } from "../filewatcher.js";
import fs from "fs";
import path from "path";

const testDir = "./test_data";

async function test() {
  console.log("TEST 5: waitForFile() Async Method");
  console.log("==================================\n");

  // Setup
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  const watcher = new FileWatcher(testDir);

  console.log("✓ Watcher created (not started)");

  let testPassed = false;
  let errorOccurred = false;

  // Test 1: File appears before timeout
  console.log("Test 5a: Waiting for file that appears...");
  try {
    // Create file after a small delay (simulating async operation)
    setTimeout(() => {
      const testFile = path.join(testDir, "delayed-file.txt");
      fs.writeFileSync(testFile, "delayed content");
      console.log("  ✓ File created after 300ms");
    }, 300);

    const result = await watcher.waitForFile("delayed-file.txt", 5000);
    if (result === true) {
      console.log("  ✓ waitForFile() resolved successfully");
      testPassed = true;
    }
  } catch (error) {
    console.log("  ✗ Unexpected error:", error.message);
    errorOccurred = true;
  }

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 500));

  // Test 2: Timeout when file doesn't appear
  console.log("Test 5b: Waiting for file that doesn't appear (should timeout)...");
  try {
    await watcher.waitForFile("nonexistent-file.txt", 500);
    console.log("  ✗ Should have timed out");
    testPassed = false;
  } catch (error) {
    if (error.message.includes("Timeout")) {
      console.log("  ✓ Timeout error caught as expected:", error.message);
    } else {
      console.log("  ✗ Wrong error:", error.message);
    }
  }

  if (testPassed && !errorOccurred) {
    console.log("✓ PASS: waitForFile() works correctly");
  } else {
    console.log("✗ FAIL: waitForFile() behavior incorrect");
  }

  // Cleanup
  fs.rmSync(testDir, { recursive: true, force: true });
  console.log("✓ Test cleanup complete\n");

  return testPassed;
}

export default test;

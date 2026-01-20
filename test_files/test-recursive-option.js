// test_files/test-recursive-option.js
// Test 8: recursive option for subdirectories

import { FileWatcher } from "../filewatcher.js";
import fs from "fs";
import path from "path";

const testDir = "./test_data";
const subDir = path.join(testDir, "subdir");

async function test() {
  console.log("TEST 8: Recursive Option");
  console.log("========================\n");

  // Setup
  if (!fs.existsSync(subDir)) {
    fs.mkdirSync(subDir, { recursive: true });
  }

  console.log("Test 8a: Non-recursive watcher");
  const watcher1 = new FileWatcher(testDir, { recursive: false });
  let subDirChangeDetected = false;

  watcher1.on("change", (event) => {
    if (event.filename.includes("subdir")) {
      subDirChangeDetected = true;
    }
  });

  watcher1.start();
  console.log("✓ Watcher started (recursive: false)");

  const subFile = path.join(subDir, "sub-file.txt");
  fs.writeFileSync(subFile, "sub content");
  console.log("✓ Created file in subdirectory");

  await new Promise(resolve => setTimeout(resolve, 500));
  watcher1.stop();

  if (!subDirChangeDetected) {
    console.log("✓ PASS: Non-recursive watcher did not detect subdirectory changes");
  } else {
    console.log("! NOTE: Non-recursive watcher detected subdirectory change (platform-dependent)");
  }

  // Clean subdirectory
  fs.rmSync(subDir, { recursive: true, force: true });
  fs.mkdirSync(subDir, { recursive: true });

  await new Promise(resolve => setTimeout(resolve, 300));

  console.log("\nTest 8b: Recursive watcher");
  const watcher2 = new FileWatcher(testDir, { recursive: true });
  let recursiveChangeDetected = false;

  watcher2.on("change", (event) => {
    recursiveChangeDetected = true;
    console.log("✓ Change detected in:", event.filename);
  });

  watcher2.start();
  console.log("✓ Watcher started (recursive: true)");

  const subFile2 = path.join(subDir, "sub-file2.txt");
  fs.writeFileSync(subFile2, "sub content 2");
  console.log("✓ Created file in subdirectory");

  await new Promise(resolve => setTimeout(resolve, 500));
  watcher2.stop();

  if (recursiveChangeDetected) {
    console.log("✓ PASS: Recursive watcher detected subdirectory changes");
  } else {
    console.log("✗ FAIL: Recursive watcher did not detect subdirectory changes");
  }

  // Cleanup
  fs.rmSync(testDir, { recursive: true, force: true });
  console.log("✓ Test cleanup complete\n");

  return recursiveChangeDetected;
}

export default test;

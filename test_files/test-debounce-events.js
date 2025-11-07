// test_files/test-debounce-events.js
// Test 4: debounceEvents() method

import { FileWatcher } from "../filewatcher.js";
import fs from "fs";
import path from "path";

const testDir = "./test_data";

async function test() {
  console.log("TEST 4: debounceEvents() Method");
  console.log("================================\n");

  // Setup
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  const watcher = new FileWatcher(testDir, { recursive: true });

  let regularChangeCount = 0;
  let debouncedChangeCount = 0;

  watcher.on("change", () => {
    regularChangeCount++;
  });

  watcher.debounceEvents(200);

  watcher.on("debouncedChange", (event) => {
    debouncedChangeCount++;
    console.log(`✓ Debounced event emitted (count: ${debouncedChangeCount})`, event.filename);
  });

  watcher.start();
  console.log("✓ Watcher started with debounce(200ms)");

  // Rapidly create multiple files to trigger multiple changes
  const testFile1 = path.join(testDir, "file1.txt");
  const testFile2 = path.join(testDir, "file2.txt");
  const testFile3 = path.join(testDir, "file3.txt");

  fs.writeFileSync(testFile1, "content1");
  await new Promise(resolve => setTimeout(resolve, 50));
  fs.writeFileSync(testFile2, "content2");
  await new Promise(resolve => setTimeout(resolve, 50));
  fs.writeFileSync(testFile3, "content3");

  console.log("✓ Created 3 files rapidly (50ms apart)");

  // Wait for debounce to complete
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log(`✓ Regular events detected: ${regularChangeCount}`);
  console.log(`✓ Debounced events detected: ${debouncedChangeCount}`);

  if (regularChangeCount > debouncedChangeCount) {
    console.log("✓ PASS: Debouncing reduced event count");
  } else if (debouncedChangeCount > 0) {
    console.log("✓ PASS: Debounced events were emitted");
  } else {
    console.log("✗ FAIL: No debounced events detected");
  }

  watcher.stop();
  console.log("✓ Watcher stopped");

  // Cleanup
  fs.rmSync(testDir, { recursive: true, force: true });
  console.log("✓ Test cleanup complete\n");

  return debouncedChangeCount > 0;
}

export default test;

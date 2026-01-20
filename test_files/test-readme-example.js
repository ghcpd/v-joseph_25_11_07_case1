// test_files/test-readme-example.js
// Test 9: Verify the corrected README example works correctly

import { FileWatcher } from "../filewatcher.js";
import fs from "fs";
import path from "path";

const testDir = "./logs";

async function test() {
  console.log("TEST 9: Corrected README Example");
  console.log("================================\n");

  // Setup
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  console.log("Running the corrected README Quick Start example...\n");

  // This is the corrected example from corrected_readme.md
  const watcher = new FileWatcher("./logs", { recursive: true }); // FIXED: recursive (not recursiveMode)

  let changeEventFired = false;
  let eventData = null;

  watcher.on("change", (event) => {
    changeEventFired = true;
    eventData = event;
    console.log("✓ Event captured - File changed:", event.filename, "Event type:", event.eventType);
  });

  console.log("✓ Event listener registered");

  watcher.start();
  console.log("✓ Watcher started");

  // Trigger a change
  const logFile = path.join(testDir, "app.log");
  fs.writeFileSync(logFile, "log entry");
  console.log("✓ Created test file");

  // Wait for event
  await new Promise(resolve => setTimeout(resolve, 500));

  // Stop watcher
  watcher.stop();
  console.log("✓ Watcher stopped");

  if (changeEventFired && eventData) {
    console.log("\n✓ PASS: README example works correctly!");
    console.log(`  Event details: {eventType: "${eventData.eventType}", filename: "${eventData.filename}"}`);
  } else {
    console.log("\n✗ FAIL: README example did not work");
  }

  // Cleanup
  fs.rmSync(testDir, { recursive: true, force: true });
  console.log("✓ Test cleanup complete\n");

  return changeEventFired;
}

export default test;

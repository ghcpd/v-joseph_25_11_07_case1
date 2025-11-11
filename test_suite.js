// Comprehensive test suite for FileWatcher Pro v1.2
import { FileWatcher } from "./filewatcher.js";
import fs from "fs";
import path from "path";

const testDir = "./logs";
const testFilesDir = "./test_files";
const testOutputDir = "./test_output";

// Ensure directories exist
[testDir, testFilesDir, testOutputDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

let testsPassed = 0;
let testsFailed = 0;
const failures = [];
let pendingTests = 0;

function test(name, fn) {
  pendingTests++;
  const isAsync = fn.length > 0; // Function expects a callback
  
  if (isAsync) {
    try {
      fn((error) => {
        pendingTests--;
        if (error) {
          testsFailed++;
          failures.push({ name, error: error.message || error });
          console.log(`✗ ${name}: ${error.message || error}`);
        } else {
          testsPassed++;
          console.log(`✓ ${name}`);
        }
        checkCompletion();
      });
    } catch (error) {
      pendingTests--;
      testsFailed++;
      failures.push({ name, error: error.message });
      console.log(`✗ ${name}: ${error.message}`);
      checkCompletion();
    }
  } else {
    try {
      fn();
      pendingTests--;
      testsPassed++;
      console.log(`✓ ${name}`);
      checkCompletion();
    } catch (error) {
      pendingTests--;
      testsFailed++;
      failures.push({ name, error: error.message });
      console.log(`✗ ${name}: ${error.message}`);
      checkCompletion();
    }
  }
}

function checkCompletion() {
  if (pendingTests === 0) {
    printSummary();
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

console.log("==========================================");
console.log("FileWatcher Pro v1.2 - Test Suite");
console.log("==========================================\n");

// Test 1: Basic instantiation
test("Test 1: Basic instantiation", () => {
  const watcher = new FileWatcher(testDir);
  assert(watcher instanceof FileWatcher, "Should create FileWatcher instance");
  assertEqual(watcher.targetDir, testDir, "targetDir should be set");
});

// Test 2: Recursive option (correct name)
test("Test 2: Recursive option (correct)", () => {
  const watcher = new FileWatcher(testDir, { recursive: true });
  assertEqual(watcher.recursive, true, "recursive should be true");
});

// Test 3: RecursiveMode option (incorrect - should not work)
test("Test 3: RecursiveMode option (incorrect name)", () => {
  const watcher = new FileWatcher(testDir, { recursiveMode: true });
  assertEqual(watcher.recursive, false, "recursiveMode should not work, recursive should be false");
});

// Test 4: Filter option
test("Test 4: Filter option", () => {
  const watcher = new FileWatcher(testDir, { filter: /\.txt$/ });
  assert(watcher.filter instanceof RegExp, "filter should be a RegExp");
  assert(watcher.filter.test("test.txt"), "filter should match .txt files");
  assert(!watcher.filter.test("test.js"), "filter should not match .js files");
});

// Test 5: logFile option
test("Test 5: logFile option", () => {
  const logFile = path.join(testOutputDir, "test.log");
  if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
  
  const watcher = new FileWatcher(testDir, { logFile });
  assertEqual(watcher.logFile, logFile, "logFile should be set");
});

// Test 6: start() method
test("Test 6: start() method", () => {
  const watcher = new FileWatcher(testDir);
  watcher.start();
  assert(watcher.watchers.length > 0, "watchers array should have entries");
  watcher.stop();
});

// Test 7: stop() method and stopped event
test("Test 7: stop() method and stopped event", (done) => {
  try {
    const watcher = new FileWatcher(testDir);
    watcher.start();
    
    let stoppedFired = false;
    watcher.on("stopped", () => {
      try {
        stoppedFired = true;
        assert(stoppedFired, "stopped event should fire");
        assertEqual(watcher.watchers.length, 0, "watchers should be cleared");
        done();
      } catch (error) {
        done(error);
      }
    });
    
    watcher.stop();
  } catch (error) {
    done(error);
  }
});

// Test 8: change event
test("Test 8: change event", (done) => {
  try {
    const watcher = new FileWatcher(testDir);
    let eventReceived = false;
    
    watcher.on("change", (event) => {
      try {
        assert(event.hasOwnProperty("filename"), "event should have filename");
        assert(event.hasOwnProperty("eventType"), "event should have eventType");
        eventReceived = true;
      } catch (error) {
        watcher.stop();
        done(error);
      }
    });
    
    watcher.start();
    
    setTimeout(() => {
      fs.writeFileSync(path.join(testDir, "change-test.txt"), "test");
    }, 100);
    
    setTimeout(() => {
      try {
        watcher.stop();
        assert(eventReceived, "change event should be received");
        done();
      } catch (error) {
        done(error);
      }
    }, 500);
  } catch (error) {
    done(error);
  }
});

// Test 9: debounceEvents method
test("Test 9: debounceEvents method", (done) => {
  try {
    const watcher = new FileWatcher(testDir);
    watcher.debounceEvents(200);
    
    let debouncedCount = 0;
    watcher.on("debouncedChange", () => {
      debouncedCount++;
    });
    
    watcher.start();
    
    // Create multiple files rapidly
    setTimeout(() => {
      for (let i = 0; i < 5; i++) {
        fs.writeFileSync(path.join(testDir, `debounce-${i}.txt`), "test");
      }
    }, 100);
    
    setTimeout(() => {
      try {
        watcher.stop();
        assert(debouncedCount > 0, "debouncedChange event should fire");
        done();
      } catch (error) {
        done(error);
      }
    }, 600);
  } catch (error) {
    done(error);
  }
});

// Test 10: waitForFile method
test("Test 10: waitForFile method", async () => {
  const watcher = new FileWatcher(testDir);
  watcher.start();
  
  setTimeout(() => {
    fs.writeFileSync(path.join(testDir, "wait-test.txt"), "test");
  }, 100);
  
  try {
    const result = await watcher.waitForFile("wait-test.txt", 2000);
    assertEqual(result, true, "waitForFile should resolve to true");
    watcher.stop();
  } catch (error) {
    watcher.stop();
    throw error;
  }
});

// Test 11: waitForFile timeout
test("Test 11: waitForFile timeout", async () => {
  const watcher = new FileWatcher(testDir);
  watcher.start();
  
  try {
    await watcher.waitForFile("nonexistent.txt", 500);
    watcher.stop();
    throw new Error("Should have timed out");
  } catch (error) {
    watcher.stop();
    assert(error.message.includes("Timeout"), "Should throw timeout error");
  }
});

// Test 12: watchOnce deprecated method
test("Test 12: watchOnce deprecated method", () => {
  const watcher = new FileWatcher(testDir);
  assert(typeof watcher.watchOnce === "function", "watchOnce should exist");
});

// Test 13: logs property
test("Test 13: logs property", () => {
  const watcher = new FileWatcher(testDir);
  assert(Array.isArray(watcher.logs), "logs should be an array");
});

// Test 14: Filter functionality
test("Test 14: Filter functionality", (done) => {
  try {
    const watcher = new FileWatcher(testDir, { filter: /\.txt$/ });
    let txtCount = 0;
    let jsCount = 0;
    
    watcher.on("change", (event) => {
      if (event.filename.endsWith(".txt")) txtCount++;
      if (event.filename.endsWith(".js")) jsCount++;
    });
    
    watcher.start();
    
    setTimeout(() => {
      fs.writeFileSync(path.join(testDir, "filter-test.txt"), "test");
      fs.writeFileSync(path.join(testDir, "filter-test.js"), "test");
    }, 100);
    
    setTimeout(() => {
      try {
        watcher.stop();
        assert(txtCount > 0, "Should receive .txt file events");
        assertEqual(jsCount, 0, "Should not receive .js file events when filtered");
        done();
      } catch (error) {
        done(error);
      }
    }, 500);
  } catch (error) {
    done(error);
  }
});

// Test 15: logFile functionality
test("Test 15: logFile functionality", (done) => {
  try {
    const logFile = path.join(testOutputDir, "log-test.log");
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
    
    const watcher = new FileWatcher(testDir, { logFile });
    watcher.start();
    
    setTimeout(() => {
      fs.writeFileSync(path.join(testDir, "log-test.txt"), "test");
    }, 100);
    
    setTimeout(() => {
      try {
        watcher.stop();
        assert(fs.existsSync(logFile), "Log file should be created");
        const logContent = fs.readFileSync(logFile, "utf8");
        assert(logContent.includes("log-test.txt"), "Log should contain file name");
        done();
      } catch (error) {
        done(error);
      }
    }, 500);
  } catch (error) {
    done(error);
  }
});

// Summary
function printSummary() {
  setTimeout(() => {
    console.log("\n==========================================");
    console.log("Test Summary");
    console.log("==========================================");
    console.log(`Total tests: ${testsPassed + testsFailed}`);
    console.log(`Passed: ${testsPassed}`);
    console.log(`Failed: ${testsFailed}`);
    
    if (failures.length > 0) {
      console.log("\nFailures:");
      failures.forEach(f => {
        console.log(`  - ${f.name}: ${f.error}`);
      });
      process.exit(1);
    } else {
      console.log("\nAll tests passed! ✓");
      process.exit(0);
    }
  }, 500);
}

// Fallback timeout in case async tests don't complete
setTimeout(() => {
  if (pendingTests > 0) {
    console.log(`\nWARNING: ${pendingTests} test(s) did not complete`);
    printSummary();
  }
}, 10000);


# Fuzz and Mutation Testing Guide

## What is Fuzz Testing?

**Fuzz testing** (or "fuzzing") is an automated testing technique that feeds **randomly generated inputs** to your code to discover bugs, edge cases, and unexpected behaviors that you might not think to test manually.

Instead of writing specific test cases like:
```typescript
expect(movePosition(50, 'L', 10)).toBe(40);
```

Fuzz testing generates **thousands of random inputs** and verifies that certain **properties always hold true**.

---

## How It Works in This Project

This project uses **[fast-check](https://github.com/dubzzz/fast-check)** — a property-based testing library for JavaScript/TypeScript.

### Key Concepts

#### 1. **Arbitraries** — Random Data Generators

```typescript
fc.integer({ min: 0, max: 99 })     // Random integer 0-99
fc.constantFrom('L', 'R')            // Randomly picks 'L' or 'R'
fc.string()                          // Random string (any characters)
fc.array(validInstruction)           // Array of random instructions
```

#### 2. **Properties** — Assertions That Must Always Be True

Instead of testing specific values, you test **invariants** — things that should *always* be true:

```typescript
// "Position should ALWAYS be between 0 and 99"
fc.assert(
  fc.property(
    fc.integer({ min: 0, max: 99 }),           // random position
    fc.constantFrom('L', 'R'),                  // random direction
    fc.integer({ min: 0, max: 10000 }),         // random distance
    (position, direction, distance) => {
      const result = movePosition(position, direction, distance);
      return result >= 0 && result < 100;       // ← Property that must hold
    }
  )
);
```

#### 3. **Custom Arbitraries** — Domain-Specific Generators

```typescript
// Generate valid instructions like "L45", "R123"
const validInstruction = fc.tuple(
  fc.constantFrom('L', 'R'),
  fc.integer({ min: 1, max: 1000 })
).map(([dir, dist]) => `${dir}${dist}`);
```

---

## Examples from This Codebase

### Test 1: Bounds Checking
```typescript
it('should always return position between 0 and 99', () => {
  // Tests 1000 random combinations
  // Ensures movePosition never returns invalid positions
});
```

### Test 2: Reversibility
```typescript
it('should be reversible: L then R with same distance returns to start', () => {
  // Moving left then right by same amount = back to start
  // Tests mathematical correctness
});
```

### Test 3: Crash Resistance
```typescript
it('should handle any string without throwing', () => {
  // Feeds garbage strings to parseInstruction
  // Ensures code doesn't crash on bad input
});
```

### Test 4: Chaos Testing
```typescript
it('should handle extremely large distances', () => {
  // Tests with distances up to 100,000,000
  // Catches integer overflow bugs
});
```

---

## Benefits of Fuzz Testing

| Benefit | Description |
|---------|-------------|
| **Finds Edge Cases** | Discovers inputs you'd never think to test (empty strings, huge numbers, special characters) |
| **Catches Regressions** | Random inputs cover more code paths than manual tests |
| **Tests Invariants** | Verifies properties that should *always* be true, not just specific examples |
| **Reduces Bias** | Human testers often miss edge cases; randomness doesn't |
| **Crash Detection** | Finds inputs that cause crashes, hangs, or exceptions |
| **Confidence** | 1000 random tests give more confidence than 10 hand-picked ones |

---

## When to Use Fuzz Testing

**Good for:**
- Functions with mathematical properties (reversibility, bounds)
- Parsers and input handlers
- Code that must handle untrusted input
- Finding edge cases in algorithms

---

## Running the Fuzz Tests

```bash
npm test -- --testPathPatterns=fuzz
```

Or run all tests:
```bash
npm test
```

---

## Configuration Options

```typescript
fc.assert(property, {
  numRuns: 1000,                    // Number of random tests
  verbose: fc.VerbosityLevel.Verbose // Show all generated values (for debugging)
});
```

# Mutation Testing with Stryker

## What is Mutation Testing?

**Mutation testing** measures the quality of your tests by intentionally introducing bugs (called "mutants") into your code and checking if your tests catch them.

Think of it as **testing your tests**:
- If a test fails when a bug is introduced → the mutant is **killed** ✅
- If all tests still pass with a bug → the mutant **survived** ❌ (your tests missed something!)

---

## How It Works

### 1. Stryker Creates Mutants

Stryker modifies your source code in small ways:

| Original Code | Mutant (Bug Introduced) |
|--------------|-------------------------|
| `if (direction === 'L')` | `if (direction !== 'L')` |
| `currentPosition - distance` | `currentPosition + distance` |
| `return zeroCount` | `return 0` |
| `position === 0` | `position !== 0` |
| `zeroCount++` | `zeroCount--` |

### 2. Tests Run Against Each Mutant

For each mutant, Stryker runs your entire test suite:
- **Killed**: At least one test fails → Good! Your tests caught the bug.
- **Survived**: All tests pass → Bad! Your tests didn't notice the bug.
- **Timeout**: Tests hang → Usually counts as killed.
- **No Coverage**: No tests run that code path.

### 3. Mutation Score

```
Mutation Score = (Killed Mutants / Total Mutants) × 100%
```

A higher score means your tests are better at catching bugs.

---

## How It's Configured in This Project

### Configuration File: `stryker.config.json`

```json
{
  "packageManager": "pnpm",
  "reporters": ["clear-text", "progress"],
  "testRunner": "command",
  "commandRunner": {
    "command": "pnpm test"
  },
  "mutate": ["src/day-1-testability.ts"],
  "ignorePatterns": [
    "src/**/*.test.ts",
    "src/**/*.fuzz.ts",
    "src/fuzz/**"
  ],
  "concurrency": 1,
  "timeoutMS": 30000
}
```

### Key Settings Explained

| Setting | Value | Purpose |
|---------|-------|---------|
| `mutate` | `["src/day-1-testability.ts"]` | Which files to mutate |
| `ignorePatterns` | Test files, fuzz files | Don't mutate test code |
| `testRunner` | `command` | Uses `pnpm test` to run tests |
| `concurrency` | `1` | Run one mutant at a time |
| `timeoutMS` | `30000` | Kill test if it takes >30s |

---

## Example: Mutations in This Project

### Source Code (`day-1-testability.ts`)

```typescript
export function movePosition(currentPosition: number, direction: 'L' | 'R', distance: number): number {
  if (direction === 'L') {
    return ((currentPosition - distance) % 100 + 100) % 100;
  } else {
    return (currentPosition + distance) % 100;
  }
}
```

### Possible Mutants Stryker Creates

| Location | Original | Mutant |
|----------|----------|--------|
| Line 10 | `direction === 'L'` | `direction !== 'L'` |
| Line 11 | `currentPosition - distance` | `currentPosition + distance` |
| Line 11 | `% 100` | `% 99` or removed |
| Line 11 | `+ 100` | `- 100` |
| Line 13 | `currentPosition + distance` | `currentPosition - distance` |

### Test That Kills the Mutant

```typescript
it('should handle zero distance', () => {
  expect(movePosition(50, 'L', 0)).toBe(50);  // Catches operator mutations
  expect(movePosition(50, 'R', 0)).toBe(50);
});

it('should handle negative distance', () => {
  expect(movePosition(50, 'L', -10)).toBe(60); // Catches +/- swap
});
```

---

## Running Mutation Tests

```bash
# Run Stryker
npx stryker run

# Or with pnpm
pnpm dlx stryker run
```

### Sample Output

```
All tests
  ✓ parseInstruction - negative cases
  ✓ movePosition - negative cases  
  ✓ countZeroPassings - negative cases

Mutation testing  [====================] 100% (42 mutants)

Killed:   38
Survived: 4
Timeout:  0

Mutation score: 90.48%
```

---

## Benefits of Mutation Testing

| Benefit | Description |
|---------|-------------|
| **Measures Test Quality** | Code coverage shows *what* runs, mutation testing shows if tests *catch bugs* |
| **Finds Weak Tests** | Reveals tests that pass even when code is broken |
| **Identifies Missing Tests** | Survived mutants show exactly where you need better tests |
| **Improves Confidence** | High mutation score = tests actually verify behavior |
| **Better Than Coverage** | 100% coverage ≠ good tests; mutation testing proves it |

---

## Mutation Testing vs Code Coverage

| Metric | Code Coverage | Mutation Testing |
|--------|--------------|------------------|
| Measures | Lines executed | Bugs detected |
| Question | "Did tests run this code?" | "Would tests catch a bug here?" |
| 100% means | All lines ran | All bugs caught |
| False sense of security? | Yes, often | No |

### Example

```typescript
// This code has 100% coverage but 0% mutation score:
function add(a, b) { return a + b; }

test('add works', () => {
  add(1, 2);  // Runs the code but doesn't check the result!
});

// This test kills mutants:
test('add works', () => {
  expect(add(1, 2)).toBe(3);  // Actually verifies the behavior
});
```

---

## Surviving Mutants: What To Do

When mutants survive, you have options:

1. **Write better tests** — Add assertions that catch the mutation
2. **Accept the survivor** — Sometimes mutations don't matter (dead code, equivalent mutants)
3. **Refactor code** — Simpler code = easier to test completely

### Example: Killing a Survivor

Suppose this mutant survives:
```typescript
// Original: position === 0
// Mutant:   position !== 0
```

Add a test that specifically checks the boundary:
```typescript
it('should count exactly when position reaches zero', () => {
  // Starting at 50, moving R50 lands exactly on 0
  expect(countZeroPassings(['R50'], 50)).toBe(1);
  // Moving R49 lands on 99, not 0
  expect(countZeroPassings(['R49'], 50)).toBe(0);
});
```

---

## Quick Reference

```bash
# Install Stryker
pnpm add -D @stryker-mutator/core

# Initialize config
npx stryker init

# Run mutation testing
npx stryker run
```




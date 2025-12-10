# Fuzz and Mutation Testing Experimentation Day

## What is Fuzz Testing?

**Fuzz testing** (or "fuzzing") is an automated testing technique that feeds **randomly generated inputs** to your code to discover bugs, edge cases and unexpected behaviors that you might not think to test.

Instead of writing specific test cases like:
```typescript
expect(movePosition(50, 'L', 10)).toBe(40);
```

Fuzz testing generates **thousands of random inputs** and verifies that certain **properties always hold true**.

---

## How It Works in This Project

This project uses **[fast-check](https://github.com/dubzzz/fast-check)** is a property-based testing library for JavaScript/TypeScript. 
As you see from the explanation is not oure fuzzing library, but can be used to simulate fuzzing testing. I gound it as a nice entry point to exploring fuzzing concept and trying it ouy with a small subset of test input.

### Key Concepts

#### 1. **Arbitraries**. Random data generators

```typescript
fc.integer({ min: 0, max: 99 })     // Random integer between 0 and 99
fc.constantFrom('L', 'R')            // Randomly picks 'L' or 'R'
fc.string()                          // Random string (any characters)
fc.array(validInstruction)           // Array of random instructions
```

#### 2. **Properties**. Assertions that must always be true

Instead of testing specific values, you test **invariants**, things that should *always* be true:

```typescript
// "Position should ALWAYS be between 0 and 99"
fc.assert(
  fc.property(
    fc.integer({ min: 0, max: 99 }),           // will pick random position
    fc.constantFrom('L', 'R'),                  // will pick random direction
    fc.integer({ min: 0, max: 10000 }),         // will pick random distance
    (position, direction, distance) => {
      const result = movePosition(position, direction, distance);
      return result >= 0 && result < 100;       // Property that must hold true based on our number range
    }
  )
);
```

## Day 1 examples in advent of test experimentation project

### Test 1: Positive boundary value testing
```typescript
it('should always return position between 0 and 99', () => {
  // Tests 1000 random combinations
  // Ensures movePosition never returns invalid positions
});
```
Fast-check library randomly generates a set of test inputs to meet the condition. There is not need to think by yourself and write a lot of tests for each test input. You can define what is the number of test input you want to be generated - e.g. 10, 20, etc

### Test 2: Random and negative input value testing
```typescript
it('should handle any string without crashing or throwig an error', () => {
  // Feeds garbage strings to parseInstruction
  // Ensures code doesn't crash on bad input
});
```
There isn't any valudation in the code, so this test will test for random or negative values as well to make sure code can handle it gracefully even though it's not expected use case in real life, you can;t turn dial into a negative direction.

In case there was a validation in the code not to allow to turn the dial into whatever direction, the concept of test would be remain the same, only assertions would be different.

### Test 4: Out of boundary value or chaos testing
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
| **Edge case testing** | Discovers inputs you can miss to test (empty strings, huge numbers, special characters) |
| **Better code robustness** | Random inputs cover more code paths than manual tests |
| **Invariants testing** | Verifies properties that should *always* be true, not just specific examples |
| **Guard against mistakes** | We are humans, we make mistakes, let machine help us not do them |
| **Increases confidence** | 1000 random tests give more confidence than 10 hand-picked ones |

---

## When to Use Fuzz Testing

**Use fuxx testing for:**
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
- If a test fails when a bug is introduced → the mutant is **killed**
- If all tests still pass with an intoroduced bug → the mutant **survived** (your tests missed something!)

---

## How It Works

### 1. Stryker creates mutants

Stryker modifies your source code in small ways:

| Original Code | Mutant (Bug introduced) |
|--------------|-------------------------|
| `if (direction === 'L')` | `if (direction !== 'L')` |
| `currentPosition - distance` | `currentPosition + distance` |
| `return zeroCount` | `return 0` |
| `position === 0` | `position !== 0` |
| `zeroCount++` | `zeroCount--` |

### 2. Tests run against each mutant

For each mutant, Stryker runs your entire test suite:
- **Killed**: At least one test fails. Good! The tests caught a bug.
- **Survived**: All tests pass. Not Good at all! The tests didn't notice a bug.
- **Timeout**: Tests hang. Usually counts as killed.
- **No Coverage**: No tests run that code path.

### 3. Mutation Score

```
Mutation Score = (Killed Mutants / Total Mutants) × 100%
```

A higher score means the tests are better at catching bugs.

---

## How It's Configured in This Project

### Configuration File: `stryker.config.json`

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
npx stryker run
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
| **Measures test quality** | Mutation testing shows how good your tests are and whether they catch real bugs |
| **Finds weak tests** | Helps to understand weak tests that always pass even when code is broken |
| **Identifies missing tests** | Survived mutants show exactly where you need better tests |
| **Improves Confidence** | High mutation score = tests actually test behaviour |

---

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

## Surviving Mutants. What you can do

When mutants survive, you have options:

1. **Impove your tests** — improve assertions; improve arrange block; add boundary tests
2. **Refactor code for testability** — simpler code, function with single responsiblity is clearer and easier to test

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

## Stryker installation and usage

```bash
# Install Stryker
pnpm add -D @stryker-mutator/core

# Initialize config
npx stryker init

# Run mutation testing
npx stryker run
```




# Refactoring for Testability

## What is Refactoring?

**Refactoring** is restructuring existing code without changing its external behavior. The goal is to improve code quality, readability, and **testability** — making it easier to write unit tests.

---

## The Problem: Untestable Code

### Before: `day-1.ts` (4,121 lines)

```typescript
const input = `L45
R35
...`;  // 4000+ lines of hardcoded data

const lines = input.split('\n').filter(line => line.trim() !== '');

let position = 50;
let zeroCount = 0;

for (const line of lines) {
  const direction = line[0];
  const distance = parseInt(line.slice(1));
  
  if (direction === 'L') {
    position = ((position - distance) % 100 + 100) % 100;
  } else {
    position = (position + distance) % 100;
  }
  
  if (position === 0) {
    zeroCount++;
  }
}

console.log("The password is:", zeroCount);
```

### Why This Is Hard to Test

| Problem | Impact |
|---------|--------|
| **Hardcoded input** | Can't test with different data |
| **Global variables** | State is shared, tests interfere |
| **No functions** | Nothing to call in tests |
| **No exports** | Can't import into test files |
| **Mixed concerns** | Parsing, logic, and output are tangled |
| **Side effects** | `console.log` runs on import |

---

## The Solution: Testable Code

### After: `day-1-testability.ts` (36 lines)

```typescript
import { input } from './input';

export function parseInstruction(instruction: string): { direction: 'L' | 'R'; distance: number } {
  const direction = instruction[0] as 'L' | 'R';
  const distance = parseInt(instruction.slice(1));
  return { direction, distance };
}

export function movePosition(currentPosition: number, direction: 'L' | 'R', distance: number): number {
  if (direction === 'L') {
    return ((currentPosition - distance) % 100 + 100) % 100;
  } else {
    return (currentPosition + distance) % 100;
  }
}

export function countZeroPassings(instructions: string[], startPosition: number = 50): number {
  let position = startPosition;
  let zeroCount = 0;

  for (const instruction of instructions) {
    const { direction, distance } = parseInstruction(instruction);
    position = movePosition(position, direction, distance);
    
    if (position === 0) {
      zeroCount++;
    }
  }

  return zeroCount;
}

// Main execution
const lines = input.split('\n').filter(line => line.trim() !== '');
const result = countZeroPassings(lines);
console.log("The password is:", result);
```

---

## What Changed: Before vs After

| Aspect | Before (`day-1.ts`) | After (`day-1-testability.ts`) |
|--------|---------------------|-------------------------------|
| **Input** | Hardcoded in file | Imported from `input.ts` |
| **Functions** | None | 3 small, focused functions |
| **Exports** | None | All functions exported |
| **State** | Global variables | Local to functions |
| **Testability** | ❌ Impossible | ✅ Easy |
| **Lines of code** | 4,121 | 36 |

---

## The Three Extracted Functions

### 1. `parseInstruction()`
**Single responsibility**: Convert string to structured data

```typescript
// Input:  "L45"
// Output: { direction: 'L', distance: 45 }
```

**Testable because**: Pure function, no dependencies, predictable output

### 2. `movePosition()`
**Single responsibility**: Calculate new position with wrapping

```typescript
// Input:  position=50, direction='L', distance=60
// Output: 90 (wraps around from -10)
```

**Testable because**: Pure function, mathematical logic isolated

### 3. `countZeroPassings()`
**Single responsibility**: Orchestrate the algorithm

```typescript
// Input:  ['L50', 'R100'], startPosition=50
// Output: 2 (lands on 0 twice)
```

**Testable because**: Accepts parameters, returns value, no side effects

---

## How This Enables Testing

### Now We Can Write Tests Like:

```typescript
import { parseInstruction, movePosition, countZeroPassings } from './day-1-testability';

describe('parseInstruction', () => {
  it('should parse L45 correctly', () => {
    expect(parseInstruction('L45')).toEqual({ direction: 'L', distance: 45 });
  });

  it('should handle invalid input', () => {
    expect(parseInstruction('LABC').distance).toBeNaN();
  });
});

describe('movePosition', () => {
  it('should move left correctly', () => {
    expect(movePosition(50, 'L', 10)).toBe(40);
  });

  it('should wrap around at boundaries', () => {
    expect(movePosition(10, 'L', 20)).toBe(90);  // Wraps from -10
  });
});

describe('countZeroPassings', () => {
  it('should count when position hits zero', () => {
    expect(countZeroPassings(['R50'], 50)).toBe(1);  // 50 + 50 = 100 % 100 = 0
  });
});
```

---

## Refactoring Principles Applied

### 1. **Extract Function**
Break large code blocks into small, named functions

```
BEFORE: Inline loop with all logic
AFTER:  parseInstruction() + movePosition() + countZeroPassings()
```

### 2. **Separate Data from Logic**
Move input data to its own module

```
BEFORE: 4000 lines of data mixed with code
AFTER:  import { input } from './input'
```

### 3. **Use Pure Functions**
Functions that:
- Take inputs as parameters
- Return outputs (no `console.log`)
- Don't modify external state

### 4. **Export for Testing**
Use `export` so test files can import functions

### 5. **Single Responsibility**
Each function does ONE thing well

---

## Benefits of Refactoring for Testability

| Benefit | Description |
|---------|-------------|
| **Unit Testing** | Test each function in isolation |
| **Fuzz Testing** | Generate random inputs for functions |
| **Mutation Testing** | Verify tests catch bugs in specific functions |
| **Debugging** | Isolate which function has the bug |
| **Reusability** | Functions can be used elsewhere |
| **Readability** | Self-documenting function names |
| **Maintainability** | Change one function without breaking others |

---

## Quick Refactoring Checklist

When refactoring for testability:

- [ ] **Extract functions** from inline code
- [ ] **Export** all functions you want to test
- [ ] **Move data** to separate files
- [ ] **Use parameters** instead of global variables
- [ ] **Return values** instead of using `console.log`
- [ ] **Keep functions pure** (same input → same output)
- [ ] **Single responsibility** (one function = one job)

---

## Summary

```
Untestable Code                    Testable Code
─────────────────                  ──────────────
❌ Hardcoded data                  ✅ Imported data
❌ Global variables                ✅ Function parameters
❌ Inline logic                    ✅ Named functions
❌ No exports                      ✅ Exported functions
❌ Side effects                    ✅ Pure functions
❌ 4,121 lines                     ✅ 36 lines
```

**The code does the same thing, but now it's testable.**


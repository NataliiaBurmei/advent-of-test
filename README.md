# Advent of Test

A hands-on experimentation project that uses variety of challenges in [Advent of Code](https://adventofcode.com/) as a base to explore testing like **unit testing** **fuzz testing** and **mutation testing**.

It's worth mentioning the challanges are solved with AI and they do not showcase perfect solutions. It never was a goal.

## Key ideas for exploration

### Property-based/Fuzz testing

Rather than writing fixed examples, fuzz tests define *properties*, invariants that must hold for any input. A library generates thousands of random cases automatically. This surfaces bugs that hand-picked inputs would never reach: integer overflow, unexpected string characters, boundary collisions.

This project uses **[fast-check](https://github.com/dubzzz/fast-check)** as a property-based testing library that simulates fuzzing behaviour in TypeScript.

### Mutation testing

Mutation testing answers the question: *"Do my tests actually catch bugs?"* A tool (Stryker) silently introduces small bugs into the source code like flipping operators, swapping conditions, changing return values and checks whether the test suite notices. Tests that let mutants survive are weak tests.

```
Mutation Score = (Killed Mutants / Total Mutants) × 100%
```

### Edge case discovery through negative testing

Even without fuzz or mutation tooling, deliberately testing negative inputs (invalid types, negative numbers, empty arrays, enormous values) reveals assumptions baked into parsers and algorithms that standard happy-path tests never exercise. Day 2 demonstrates this: a simple `split('-')` call silently broke for negative numbers until a targeted edge-case test exposed it.

## Days

| Day | Problem | Testing Highlight |
|-----|---------|-------------------|
| [Day 1](src/day-1/README.md) | Circular dial puzzle. Follow L/R instructions on a 0–99 dial, count zero crossings | Fuzz testing with fast-check, mutation testing with Stryker |
| [Day 2](src/day-2/README.md) | Invalid ID finder — locate numbers whose digit string is a repeated half, sum them across ranges | Edge case & negative input testing; bug discovered and fixed via targeted test |

## Running the Tests

```bash
# Run all tests
pnpm test

# Run fuzz tests only
pnpm test:fuzz

# Run mutation tests
npx stryker run
```
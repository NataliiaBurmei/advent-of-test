# Day 2 — Invalid IDs

## The Problem

Given a comma-separated list of number ranges, find all "invalid" IDs within those ranges and return their sum.

A number is **invalid** if its digit string has even length and the first half of the digits is identical to the second half.

| Number | Digits | Invalid? |
|--------|--------|----------|
| `1212` | `12` + `12` | Yes |
| `9999` | `99` + `99` | Yes |
| `1234` | `12` ≠ `34` | No |
| `123`  | odd length   | No |

## Solution

Four functions work together:

- **`parseInvalidIds`** — parses the raw comma-separated range strings into `{ start, end }` objects
- **`isInvalidId`** — checks whether a single number meets the mirrored-halves rule
- **`findInvalidIdsInRange`** — collects all invalid IDs within a single range
- **`sumAllInvalidIds`** — sums every invalid ID across all ranges

## Tests

The test suite covers `parseInvalidIds` with these cases:

- Multiple ranges parsed correctly
- Single range
- Empty input returns `[]`
- Very small numbers (`1-2`)
- Very large numbers (`6666660113-6666682086`)
- Decimal numbers (`132454.5-182049.5`)
- **Negative start number** (`-132454-182049`) ← this test exposed a bug

## Bug

`parseInvalidIds` used `id.split('-')` to separate the start and end of each range. For a negative start like `-132454-182049`, this produces three parts — `['', '132454', '182049']` — because the leading minus sign is also treated as a separator. The result was `{ start: 0, end: 132454 }` instead of `{ start: -132454, end: 182049 }`.

## Fix

Replace the plain `split('-')` with a lookbehind regex that only splits on a `-` preceded by a digit:

```typescript
const [start, end] = id.split(/(?<=\d)-/).map(Number);
```

This leaves the leading `-` intact, correctly parsing negative start values.

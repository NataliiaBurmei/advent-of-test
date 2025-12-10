import fc from 'fast-check';
import { parseInstruction, movePosition, countZeroPassings } from './day-1-testability';

// generated data for understanding the data that is being generated
const validInstruction = fc
  .tuple(fc.constantFrom('L', 'R'), fc.integer({ min: 1, max: 1000 }))
  .map(([dir, dist]) => `${dir}${dist}`);

console.log('Sample instructions:', fc.sample(validInstruction, 10));
console.log('Sample strings:', fc.sample(fc.string(), 10));
console.log('Sample positions:', fc.sample(fc.integer({ min: 0, max: 99 }), 10));

describe('Fuzz Testing - parseInstruction', () => {
  it('should always return position between 0 and 99', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 99 }),
        fc.constantFrom('L', 'R') as fc.Arbitrary<'L' | 'R'>,
        fc.integer({ min: 0, max: 10000 }),
        (position, direction, distance) => {
          const result = movePosition(position, direction, distance);
          return result >= 0 && result < 100;
        }
      ),
      {
        numRuns: 10, // Reduce runs to avoid spam
        verbose: fc.VerbosityLevel.Verbose, // Show all generated values
      }
    );
  });

  it('should always return a direction and distance for valid format', () => {
    fc.assert(
      fc.property(fc.constantFrom('L', 'R'), fc.integer({ min: 0, max: 10000 }), (dir, dist) => {
        const instruction = `${dir}${dist}`;
        const result = parseInstruction(instruction);

        return result.direction === dir && result.distance === dist;
      }),
      { numRuns: 1000 }
    );
  });

  it('should handle any string without throwing', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        // Should not throw, even with garbage input
        try {
          parseInstruction(input);
          return true;
        } catch {
          return false; // Fail if it throws
        }
      }),
      { numRuns: 500 }
    );
  });
});

describe('Fuzz Testing - movePosition', () => {
  it('should always return position between 0 and 99 for valid inputs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 99 }), // valid start position
        fc.constantFrom('L', 'R') as fc.Arbitrary<'L' | 'R'>,
        fc.integer({ min: 0, max: 10000 }), // distance
        (position, direction, distance) => {
          const result = movePosition(position, direction, distance);
          return result >= 0 && result < 100;
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('should be reversible: L then R with same distance returns to start', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 99 }),
        fc.integer({ min: 0, max: 10000 }),
        (startPos, distance) => {
          const afterLeft = movePosition(startPos, 'L', distance);
          const afterRight = movePosition(afterLeft, 'R', distance);
          return afterRight === startPos;
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('should wrap correctly: moving 100 returns to same position', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 99 }),
        fc.constantFrom('L', 'R') as fc.Arbitrary<'L' | 'R'>,
        (position, direction) => {
          const result = movePosition(position, direction, 100);
          return result === position;
        }
      ),
      { numRuns: 500 }
    );
  });
});

describe('Fuzz Testing - countZeroPassings', () => {
  // Custom arbitrary for valid instructions
  const validInstruction = fc
    .tuple(fc.constantFrom('L', 'R'), fc.integer({ min: 1, max: 1000 }))
    .map(([dir, dist]) => `${dir}${dist}`);

  it('should return non-negative count for any valid instructions', () => {
    fc.assert(
      fc.property(
        fc.array(validInstruction, { minLength: 0, maxLength: 100 }),
        fc.integer({ min: 0, max: 99 }),
        (instructions, startPos) => {
          const result = countZeroPassings(instructions, startPos);
          return result >= 0 && Number.isInteger(result);
        }
      ),
      { numRuns: 500 }
    );
  });

  it('should never count more zeros than instructions', () => {
    fc.assert(
      fc.property(fc.array(validInstruction, { minLength: 1, maxLength: 100 }), (instructions) => {
        const result = countZeroPassings(instructions, 50);
        return result <= instructions.length;
      }),
      { numRuns: 500 }
    );
  });

  it('should be deterministic: same input = same output', () => {
    fc.assert(
      fc.property(
        fc.array(validInstruction, { minLength: 0, maxLength: 50 }),
        fc.integer({ min: 0, max: 99 }),
        (instructions, startPos) => {
          const result1 = countZeroPassings(instructions, startPos);
          const result2 = countZeroPassings(instructions, startPos);
          return result1 === result2;
        }
      ),
      { numRuns: 200 }
    );
  });
});

describe('Fuzz Testing - Chaos/Edge Cases', () => {
  it('should handle extremely large distances', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 99 }),
        fc.constantFrom('L', 'R') as fc.Arbitrary<'L' | 'R'>,
        fc.integer({ min: 1000000, max: 100000000 }),
        (position, direction, distance) => {
          const result = movePosition(position, direction, distance);
          return result >= 0 && result < 100 && Number.isFinite(result);
        }
      ),
      { numRuns: 500 }
    );
  });

  it('should survive malformed instruction arrays', () => {
    fc.assert(
      fc.property(fc.array(fc.string(), { minLength: 0, maxLength: 20 }), (instructions) => {
        try {
          const result = countZeroPassings(instructions, 50);
          // Result might be NaN or a number, but should not throw
          return typeof result === 'number';
        } catch {
          return false;
        }
      }),
      { numRuns: 300 }
    );
  });
});

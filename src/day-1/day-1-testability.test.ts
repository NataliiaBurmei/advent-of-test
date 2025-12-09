import { parseInstruction, movePosition, countZeroPassings } from './day-1-testability';

describe('parseInstruction - negative cases', () => {
    it('should return NaN distance for non-numeric input', () => {
      const result = parseInstruction('LABC');
      expect(result.direction).toBe('L');
      expect(result.distance).toBeNaN();
    });
  
    it('should handle empty string (returns undefined direction)', () => {
      const result = parseInstruction('');
      expect(result.direction).toBeUndefined();
      expect(result.distance).toBeNaN();
    });
  
    it('should treat invalid direction as the first character', () => {
      // Current implementation doesn't validate - it just takes first char
      const result = parseInstruction('X50');
      expect(result.direction).toBe('X');
      expect(result.distance).toBe(50);
    });
  
    it('should return NaN for instruction with only direction', () => {
      const result = parseInstruction('L');
      expect(result.direction).toBe('L');
      expect(result.distance).toBeNaN();
    });
  });
  
  describe('movePosition - negative cases', () => {
    it('should handle negative starting position', () => {
      // Behavior may be unexpected - returns negative modulo result
      const result = movePosition(-10, 'R', 5);
      expect(result).toBe(-5); // Or test what actually happens
    });
  
    it('should handle starting position >= 100', () => {
      // Position 150 + 10 = 160 % 100 = 60
      expect(movePosition(150, 'R', 10)).toBe(60);
    });
  
    it('should handle negative distance', () => {
      // L with negative distance acts like R
      expect(movePosition(50, 'L', -10)).toBe(60);
    });
  
    it('should handle zero distance', () => {
      expect(movePosition(50, 'L', 0)).toBe(50);
      expect(movePosition(50, 'R', 0)).toBe(50);
    });
  
    it('should handle very large distance values', () => {
      // R 1000050 from position 50 = (50 + 1000050) % 100 = 0
      expect(movePosition(50, 'R', 1000050)).toBe(0);
    });
  });
  
  describe('countZeroPassings - negative cases', () => {
    it('should handle instructions with NaN distances (position becomes NaN)', () => {
      const instructions = ['L50', 'LABC', 'R10'];
      const result = countZeroPassings(instructions, 50);
      // Once NaN enters, all subsequent positions are NaN
      // NaN === 0 is false, so zeroCount stays at 1
      expect(result).toBe(1);
    });
  
    it('should handle negative start position', () => {
      const instructions = ['R10'];
      const result = countZeroPassings(instructions, -50);
      expect(result).toBe(0); // -50 + 10 = -40, which !== 0
    });
  
    it('should handle whitespace-only instructions', () => {
      const instructions = ['   ', 'L50'];
      // '   '[0] = ' ', parseInt('  ') = NaN
      const result = countZeroPassings(instructions, 50);
      expect(result).toBe(0); // position becomes NaN after first instruction
    });
  });

  describe('parseInstruction - positive cases', () => {
    it('should parse L45 correctly', () => {
      const result = parseInstruction('L45');
      expect(result.direction).toBe('L');
      expect(result.distance).toBe(45);
    });
  
    it('should parse R100 correctly', () => {
      const result = parseInstruction('R100');
      expect(result.direction).toBe('R');
      expect(result.distance).toBe(100);
    });
  });
  
  describe('movePosition - positive cases', () => {
    it('should move left correctly', () => {
      expect(movePosition(50, 'L', 10)).toBe(40);
    });
  
    it('should move right correctly', () => {
      expect(movePosition(50, 'R', 10)).toBe(60);
    });
  
    it('should wrap around when moving left past 0', () => {
      expect(movePosition(10, 'L', 20)).toBe(90);
    });
  
    it('should wrap around when moving right past 99', () => {
      expect(movePosition(90, 'R', 20)).toBe(10);
    });
  });
  
describe('countZeroPassings - positive cases', () => {
    it('should count when position lands on zero', () => {
      expect(countZeroPassings(['R50'], 50)).toBe(1);  // 50+50=100%100=0
    });
  
    it('should not count when position misses zero', () => {
      expect(countZeroPassings(['R49'], 50)).toBe(0);  // 50+49=99
    });
  
    it('should count multiple zero landings', () => {
      expect(countZeroPassings(['R50', 'R100'], 50)).toBe(2);
    });
  });


describe('parseInstruction', () => {
  it('should parse left instruction correctly', () => {
    const result = parseInstruction('L45');
    expect(result).toEqual({ direction: 'L', distance: 45 });
  });

  it('should parse right instruction correctly', () => {
    const result = parseInstruction('R100');
    expect(result).toEqual({ direction: 'R', distance: 100 });
  });

  it('should parse single digit distance', () => {
    const result = parseInstruction('R5');
    expect(result).toEqual({ direction: 'R', distance: 5 });
  });
});

describe('movePosition', () => {
  it('should move right without wrapping', () => {
    expect(movePosition(50, 'R', 10)).toBe(60);
  });

  it('should move left without wrapping', () => {
    expect(movePosition(50, 'L', 10)).toBe(40);
  });

  it('should wrap around when moving right past 99', () => {
    expect(movePosition(90, 'R', 15)).toBe(5);
  });

  it('should wrap around when moving left past 0', () => {
    expect(movePosition(10, 'L', 15)).toBe(95);
  });

  it('should land exactly on 0', () => {
    expect(movePosition(50, 'L', 50)).toBe(0);
  });

  it('should land exactly on 0 from right wrap', () => {
    expect(movePosition(50, 'R', 50)).toBe(0);
  });
});

describe('countZeroPassings', () => {
  it('should return 0 when no instructions land on zero', () => {
    const instructions = ['R10', 'L5', 'R3'];
    expect(countZeroPassings(instructions, 50)).toBe(0);
  });

  it('should count single zero passing', () => {
    // Start at 50, move left 50 = lands on 0
    const instructions = ['L50'];
    expect(countZeroPassings(instructions, 50)).toBe(1);
  });

  it('should count multiple zero passings', () => {
    // Start at 50, L50 -> 0, R100 -> 0
    const instructions = ['L50', 'R100'];
    expect(countZeroPassings(instructions, 50)).toBe(2);
  });

  it('should handle empty instructions', () => {
    expect(countZeroPassings([], 50)).toBe(0);
  });
});




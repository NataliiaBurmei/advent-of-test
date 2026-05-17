import { parseInvalidIds } from './day-2-solution';

describe('parseInvalidIds', () => {
  it('should parse multiple invalid ids correctly', () => {
    expect(parseInvalidIds(['132454-182049', '42382932-42449104', '685933-804865'])).toStrictEqual([
      { start: 132454, end: 182049 },
      { start: 42382932, end: 42449104 },
      { start: 685933, end: 804865 },
    ]);
  });

  it('should parse single invalid id correctly', () => {
    expect(parseInvalidIds(['132454-182049'])).toStrictEqual([{ start: 132454, end: 182049 }]);
  });

  it('should parse invalid id with negative numbers correctly', () => {
    expect(parseInvalidIds(['-132454-182049'])).toStrictEqual([{ start: -132454, end: 182049 }]);
  });

  it('should parse invalid id with decimal numbers correctly', () => {
    expect(parseInvalidIds(['132454.5-182049.5'])).toStrictEqual([
      { start: 132454.5, end: 182049.5 },
    ]);
  });

  it('should return empty array for empty input', () => {
    expect(parseInvalidIds([])).toStrictEqual([]);
  });

  it('should handle very large numbers', () => {
    expect(parseInvalidIds(['6666660113-6666682086'])).toStrictEqual([
      { start: 6666660113, end: 6666682086 },
    ]);
  });

  it('should handle very small numbers', () => {
    expect(parseInvalidIds(['1-2'])).toStrictEqual([{ start: 1, end: 2 }]);
  });
});

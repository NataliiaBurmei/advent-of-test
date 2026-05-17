import { invalidIds } from './day-2-input';

const input = invalidIds.split(',');

export function parseInvalidIds(invalidIds: string[]): { start: number; end: number }[] {
  return invalidIds.map((id) => {
    const [start, end] = id.split('-').map(Number);
    return { start, end };
  });
}

export function isInvalidId(num: number): boolean {
  const str = num.toString();
  // Must have even length to be split in half
  if (str.length % 2 !== 0) return false;

  const half = str.length / 2;
  const firstHalf = str.slice(0, half);
  const secondHalf = str.slice(half);

  return firstHalf === secondHalf;
}

export function findInvalidIdsInRange(start: number, end: number): number[] {
  const invalidIds: number[] = [];
  for (let id = start; id <= end; id++) {
    if (isInvalidId(id)) {
      invalidIds.push(id);
    }
  }
  return invalidIds;
}

export function sumAllInvalidIds(ranges: { start: number; end: number }[]): number {
  let sum = 0;
  for (const range of ranges) {
    const invalidIds = findInvalidIdsInRange(range.start, range.end);
    sum += invalidIds.reduce((a, b) => a + b, 0);
  }
  return sum;
}

const ranges = parseInvalidIds(input);
const answer = sumAllInvalidIds(ranges);
console.log(answer);

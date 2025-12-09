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
  
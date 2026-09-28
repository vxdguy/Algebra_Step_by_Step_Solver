/**
 * Radical simplification utilities
 */
export interface SimplifiedRadical {
  coefficient: bigint;
  radicand: bigint; // inside the root
}

export function simplifySquareRoot(n: bigint): SimplifiedRadical {
  if (n < 0n) {
    throw new Error("Cannot take square root of negative number in real domain");
  }
  if (n === 0n) {
    return { coefficient: 0n, radicand: 0n };
  }
  if (n === 1n) {
    return { coefficient: 1n, radicand: 1n };
  }

  let coef = 1n;
  let rad = n;

  // Factor out squares
  let d = 2n;
  while (d * d <= rad) {
    const square = d * d;
    while (rad % square === 0n) {
      coef *= d;
      rad /= square;
    }
    d++;
  }

  return { coefficient: coef, radicand: rad };
}

export function formatRadicalTex(coef: bigint, radicand: bigint, divisor?: bigint): string {
  if (radicand === 0n) return '0';
  if (radicand === 1n) {
    if (divisor && divisor !== 1n) {
      return `\\frac{${coef}}{${divisor}}`;
    }
    return coef.toString();
  }

  let rootPart = `\\sqrt{${radicand}}`;
  let top = '';
  if (coef === 1n) {
    top = rootPart;
  } else if (coef === -1n) {
    top = `-${rootPart}`;
  } else {
    top = `${coef}${rootPart}`;
  }

  if (divisor && divisor !== 1n) {
    return `\\frac{${top}}{${divisor}}`;
  }
  return top;
}

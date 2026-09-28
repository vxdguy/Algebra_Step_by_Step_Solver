/**
 * Utilities for 8th Grade Pre-Algebra Fraction Arithmetic, LCD, and Reduction
 */

export function gcdBigInt(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x;
}

export function lcmBigInt(a: bigint, b: bigint): bigint {
  if (a === 0n || b === 0n) return 0n;
  const absA = a < 0n ? -a : a;
  const absB = b < 0n ? -b : b;
  return (absA * absB) / gcdBigInt(absA, absB);
}

export function gcdNumber(a: number, b: number): number {
  return Number(gcdBigInt(BigInt(Math.round(a)), BigInt(Math.round(b))));
}

export function lcmNumber(a: number, b: number): number {
  return Number(lcmBigInt(BigInt(Math.round(a)), BigInt(Math.round(b))));
}

export function formatFractionTex(num: bigint | number, den: bigint | number): string {
  const n = BigInt(num);
  const d = BigInt(den);

  if (d === 0n) throw new Error("Denominator cannot be 0");
  if (d === 1n) return n.toString();
  if (d === -1n) return (-n).toString();

  if (d < 0n) {
    return formatFractionTex(-n, -d);
  }

  if (n < 0n) {
    return `-\\frac{${(-n).toString()}}{${d.toString()}}`;
  }

  return `\\frac{${n.toString()}}{${d.toString()}}`;
}

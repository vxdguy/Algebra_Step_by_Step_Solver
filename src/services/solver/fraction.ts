/**
 * Exact Fraction representation for exact algebraic arithmetic
 */
export class Fraction {
  readonly num: bigint;
  readonly den: bigint;

  constructor(num: number | bigint | string, den: number | bigint | string = 1n) {
    let n: bigint;
    let d: bigint;

    if (typeof num === 'bigint') {
      n = num;
    } else if (typeof num === 'string' && num.includes('/')) {
      const parts = num.split('/');
      n = BigInt(parts[0].trim());
      d = BigInt(parts[1].trim());
    } else {
      const numVal = Number(num);
      if (!Number.isFinite(numVal)) throw new Error("Invalid number in Fraction");
      if (Number.isInteger(numVal)) {
        n = BigInt(numVal);
      } else {
        const s = numVal.toString();
        const decimals = s.includes('.') ? s.split('.')[1].length : 0;
        const factor = 10 ** Math.min(decimals, 8);
        n = BigInt(Math.round(numVal * factor));
        d = BigInt(factor);
      }
    }

    if (d === undefined) {
      if (typeof den === 'bigint') {
        d = den;
      } else {
        const denVal = Number(den);
        d = BigInt(Math.round(denVal));
      }
    }

    if (d === 0n) {
      throw new Error("Division by zero in Fraction");
    }

    if (d < 0n) {
      n = -n;
      d = -d;
    }

    const g = Fraction.gcd(n < 0n ? -n : n, d);
    this.num = n / g;
    this.den = d / g;
  }

  static fromNumber(val: number): Fraction {
    if (Number.isInteger(val)) {
      return new Fraction(BigInt(val), 1n);
    }
    const s = val.toString();
    if (s.includes('.')) {
      const decimals = s.split('.')[1].length;
      const factor = 10 ** Math.min(decimals, 8);
      return new Fraction(Math.round(val * factor), factor);
    }
    return new Fraction(Math.round(val), 1n);
  }

  private static gcd(a: bigint, b: bigint): bigint {
    while (b !== 0n) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  add(other: Fraction | number | bigint): Fraction {
    const o = other instanceof Fraction ? other : new Fraction(other);
    return new Fraction(this.num * o.den + o.num * this.den, this.den * o.den);
  }

  sub(other: Fraction | number | bigint): Fraction {
    const o = other instanceof Fraction ? other : new Fraction(other);
    return new Fraction(this.num * o.den - o.num * this.den, this.den * o.den);
  }

  mul(other: Fraction | number | bigint): Fraction {
    const o = other instanceof Fraction ? other : new Fraction(other);
    return new Fraction(this.num * o.num, this.den * o.den);
  }

  div(other: Fraction | number | bigint): Fraction {
    const o = other instanceof Fraction ? other : new Fraction(other);
    if (o.num === 0n) throw new Error("Division by zero");
    return new Fraction(this.num * o.den, this.den * o.num);
  }

  pow(exponent: number): Fraction {
    if (!Number.isInteger(exponent)) {
      throw new Error("Fraction exponent must be integer");
    }
    if (exponent === 0) return new Fraction(1n, 1n);
    if (exponent < 0) {
      const positivePow = this.pow(-exponent);
      return new Fraction(positivePow.den, positivePow.num);
    }
    const exp = BigInt(exponent);
    return new Fraction(this.num ** exp, this.den ** exp);
  }

  neg(): Fraction {
    return new Fraction(-this.num, this.den);
  }

  abs(): Fraction {
    return new Fraction(this.num < 0n ? -this.num : this.num, this.den);
  }

  isZero(): boolean {
    return this.num === 0n;
  }

  isOne(): boolean {
    return this.num === 1n && this.den === 1n;
  }

  isNegative(): boolean {
    return this.num < 0n;
  }

  isInteger(): boolean {
    return this.den === 1n;
  }

  equals(other: Fraction | number | bigint): boolean {
    const o = other instanceof Fraction ? other : new Fraction(other);
    return this.num === o.num && this.den === o.den;
  }

  toNumber(): number {
    return Number(this.num) / Number(this.den);
  }

  toTex(showSign: boolean = false): string {
    const isNeg = this.num < 0n;
    const absNum = isNeg ? -this.num : this.num;
    let signStr = '';
    if (showSign) {
      signStr = isNeg ? ' - ' : ' + ';
    } else if (isNeg) {
      signStr = '-';
    }

    if (this.den === 1n) {
      return `${signStr}${absNum.toString()}`;
    }
    return `${signStr}\\frac{${absNum.toString()}}{${this.den.toString()}}`;
  }

  toString(): string {
    if (this.den === 1n) return this.num.toString();
    return `${this.num}/${this.den}`;
  }
}

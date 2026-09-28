import { Fraction } from './fraction';

/**
 * Representation of a single-variable polynomial P(varName)
 * Map from degree (number) -> Fraction coefficient
 */
export class Polynomial {
  readonly terms: Map<number, Fraction>;
  readonly variable: string;

  constructor(terms: Map<number, Fraction> | Record<number, Fraction> = new Map(), variable = 'x') {
    this.variable = variable;
    this.terms = new Map();

    const entries = terms instanceof Map ? terms.entries() : Object.entries(terms).map(([k, v]) => [Number(k), v] as [number, Fraction]);
    for (const [deg, coeff] of entries) {
      if (!coeff.isZero()) {
        this.terms.set(deg, coeff);
      }
    }
  }

  static constant(val: Fraction | number | bigint, variable = 'x'): Polynomial {
    const f = val instanceof Fraction ? val : new Fraction(val);
    const m = new Map<number, Fraction>();
    if (!f.isZero()) {
      m.set(0, f);
    }
    return new Polynomial(m, variable);
  }

  static singleVar(variable = 'x', coeff: Fraction | number = 1, power = 1): Polynomial {
    const f = coeff instanceof Fraction ? coeff : new Fraction(coeff);
    const m = new Map<number, Fraction>();
    if (!f.isZero()) {
      m.set(power, f);
    }
    return new Polynomial(m, variable);
  }

  getDegree(): number {
    let max = 0;
    for (const deg of this.terms.keys()) {
      if (deg > max) max = deg;
    }
    return max;
  }

  getCoefficient(deg: number): Fraction {
    return this.terms.get(deg) || new Fraction(0n, 1n);
  }

  isZero(): boolean {
    return this.terms.size === 0;
  }

  isConstant(): boolean {
    return this.getDegree() === 0;
  }

  add(other: Polynomial): Polynomial {
    const res = new Map<number, Fraction>(this.terms);
    for (const [deg, coeff] of other.terms.entries()) {
      const current = res.get(deg) || new Fraction(0n, 1n);
      const sum = current.add(coeff);
      if (sum.isZero()) {
        res.delete(deg);
      } else {
        res.set(deg, sum);
      }
    }
    return new Polynomial(res, this.variable);
  }

  sub(other: Polynomial): Polynomial {
    return this.add(other.neg());
  }

  neg(): Polynomial {
    const res = new Map<number, Fraction>();
    for (const [deg, coeff] of this.terms.entries()) {
      res.set(deg, coeff.neg());
    }
    return new Polynomial(res, this.variable);
  }

  mul(other: Polynomial): Polynomial {
    const res = new Map<number, Fraction>();
    for (const [deg1, coeff1] of this.terms.entries()) {
      for (const [deg2, coeff2] of other.terms.entries()) {
        const newDeg = deg1 + deg2;
        const prod = coeff1.mul(coeff2);
        const current = res.get(newDeg) || new Fraction(0n, 1n);
        const sum = current.add(prod);
        if (sum.isZero()) {
          res.delete(newDeg);
        } else {
          res.set(newDeg, sum);
        }
      }
    }
    return new Polynomial(res, this.variable);
  }

  pow(exponent: number): Polynomial {
    if (exponent < 0 || !Number.isInteger(exponent)) {
      throw new Error("Only non-negative integer powers supported for polynomials");
    }
    if (exponent === 0) return Polynomial.constant(1, this.variable);
    let result = Polynomial.constant(1, this.variable);
    let base: Polynomial = this;
    let exp = exponent;
    while (exp > 0) {
      if (exp % 2 === 1) {
        result = result.mul(base);
      }
      base = base.mul(base);
      exp = Math.floor(exp / 2);
    }
    return result;
  }

  evaluate(val: Fraction | number): Fraction {
    const x = val instanceof Fraction ? val : new Fraction(val);
    let result = new Fraction(0n, 1n);
    for (const [deg, coeff] of this.terms.entries()) {
      result = result.add(coeff.mul(x.pow(deg)));
    }
    return result;
  }

  toTex(): string {
    if (this.isZero()) return '0';

    const sortedDegrees = Array.from(this.terms.keys()).sort((a, b) => b - a);
    let result = '';

    for (let i = 0; i < sortedDegrees.length; i++) {
      const deg = sortedDegrees[i];
      const coeff = this.terms.get(deg)!;
      const isFirst = i === 0;

      let sign = '';
      let absCoeff = coeff;
      if (coeff.isNegative()) {
        sign = isFirst ? '-' : ' - ';
        absCoeff = coeff.abs();
      } else if (!isFirst) {
        sign = ' + ';
      }

      let coeffStr = '';
      if (deg === 0) {
        coeffStr = absCoeff.toTex();
      } else {
        if (absCoeff.isOne()) {
          coeffStr = '';
        } else {
          coeffStr = absCoeff.toTex();
        }
      }

      let varStr = '';
      if (deg === 1) {
        varStr = this.variable;
      } else if (deg > 1) {
        varStr = `${this.variable}^{${deg}}`;
      }

      result += `${sign}${coeffStr}${varStr}`;
    }

    return result || '0';
  }

  toString(): string {
    return this.toTex();
  }
}

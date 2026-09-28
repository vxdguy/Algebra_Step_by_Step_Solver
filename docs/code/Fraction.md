# `Fraction`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/fraction.ts`](../../src/services/solver/fraction.ts)
- **Exported Entity**: `Fraction`

---

## Description

A high-precision rational number class built on JavaScript BigInt primitives. Automatically simplifies fractions to irreducible form via gcdBigInt, handles negative signs canonically in the numerator, and provides arithmetic methods (add, sub, mul, div, pow, abs, neg, inverse) without floating-point rounding errors. Also formats to LaTeX (toTex), mixed numbers (toMixedTex), and decimals.

---

## Why It Is Needed

Fundamental core datatype for the entire Computer Algebra System, ensuring 100% exact rational arithmetic across all fraction reductions, equation solving, and polynomial manipulations.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `num` | `bigint | number | string | Fraction` | Numerator or initial fraction representation (e.g. '3/4', 5, 2n). |
| `den` | `bigint | number (optional, default 1n)` | Denominator (must be non-zero). |

---

## Expected Outputs

- **Return Type**: `Fraction instance`
- **Description**: An immutable rational number object with exact BigInt numerator (num) and denominator (den) in reduced canonical form.

---

## Examples

### Example 1

**Input:**
```typescript
new Fraction(28n, 6n)
```

**Output:**
```typescript
Fraction { num: 14n, den: 3n } // renders as \frac{14}{3}
```

### Example 2

**Input:**
```typescript
new Fraction("3/4").add(new Fraction("2/3"))
```

**Output:**
```typescript
Fraction { num: 17n, den: 12n } // renders as \frac{17}{12}
```


---

## Related Functions & Modules

[gcdBigInt](gcdBigInt.md) • [lcmBigInt](lcmBigInt.md) • [formatFractionTex](formatFractionTex.md)

---

[Back to Table of Contents](_TOC.md)

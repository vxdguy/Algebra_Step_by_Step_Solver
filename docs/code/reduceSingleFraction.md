# `reduceSingleFraction`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/fractionSolver.ts`](../../src/services/solver/fractionSolver.ts)
- **Exported Entity**: `reduceSingleFraction`

---

## Description

Reduces numerical and algebraic fractions. For numerical fractions, shows greatest common divisor (GCD) calculation, prime factor breakdown, cancellation of common factors, and improper-to-mixed number conversions. For algebraic fractions, factors common numeric coefficients from polynomials.

---

## Why It Is Needed

Provides comprehensive 8th-grade fraction reduction reasoning required by pre-algebra curricula.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `input` | `string` | Single fraction expression string (e.g. '10/2', '11/3', '12/8', '3x/6', '(6x+9)/3'). |

---

## Expected Outputs

- **Return Type**: `SolverResult`
- **Description**: Complete solution showing prime factorizations, GCD extraction, cancellations, mixed numbers (if improper), and final simplified fraction.

---

## Examples

### Example 1

**Input:**
```typescript
12/8
```

**Output:**
```typescript
{
  expression: "\frac{12}{8} = \frac{3}{2}",
  finalAnswer: "\frac{3}{2}",
  steps: [ /* Step 1: GCD=4, Step 2: Factor & Cancel, Step 3: Mixed Number 1 1/2 */ ]
}
```


---

## Related Functions & Modules

[solveFractionArithmetic](solveFractionArithmetic.md) • [gcdBigInt](gcdBigInt.md) • [Fraction](Fraction.md)

---

[Back to Table of Contents](_TOC.md)

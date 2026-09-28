# `solveFractionArithmetic`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/fractionSolver.ts`](../../src/services/solver/fractionSolver.ts)
- **Exported Entity**: `solveFractionArithmetic`

---

## Description

Solves arithmetic between multiple fractions. For addition and subtraction, computes the Least Common Denominator (LCD), converts each fraction to an equivalent fraction with the common denominator, adds/subtracts numerators, and simplifies. For multiplication, multiplies across numerators and denominators. For division, multiplies by the reciprocal (Keep-Change-Flip).

---

## Why It Is Needed

Teaches standard pre-algebra fraction arithmetic methods with full intermediate step explanations.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `input` | `string` | Fraction arithmetic expression (e.g. '1/2 + 2/3', '5/6 - 1/4', '2/3 * 5/4', '3/4 / 2/5'). |

---

## Expected Outputs

- **Return Type**: `SolverResult`
- **Description**: Step-by-step arithmetic solution detailing LCD calculation, conversion to equivalent fractions, numerator combination, and final reduction.

---

## Examples

### Example 1

**Input:**
```typescript
1/2 + 2/3
```

**Output:**
```typescript
{
  expression: "\frac{1}{2} + \frac{2}{3} = \frac{7}{6}",
  finalAnswer: "\frac{7}{6}",
  steps: [ /* Step 1: LCD=6, Step 2: Equivalent fractions, Step 3: Combine, Step 4: Mixed Number */ ]
}
```


---

## Related Functions & Modules

[reduceSingleFraction](reduceSingleFraction.md) • [lcmBigInt](lcmBigInt.md) • [Fraction](Fraction.md)

---

[Back to Table of Contents](_TOC.md)

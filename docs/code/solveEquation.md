# `solveEquation`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/equationSolver.ts`](../../src/services/solver/equationSolver.ts)
- **Exported Entity**: `solveEquation`

---

## Description

Solves linear and quadratic single-variable equations. Handles fractional coefficients by computing the Least Common Multiple (LCM) of denominators to clear fractions in Step 1, moves variable terms to one side and constants to the other, simplifies coefficients, and computes exact solutions (including square roots and quadratic formulas with simplified radicals).

---

## Why It Is Needed

Solves standard 8th grade and high school algebra equations step-by-step, showing every algebraic manipulation clearly.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `rawLeft` | `string` | Left-hand side expression of the equation. |
| `rawRight` | `string` | Right-hand side expression of the equation. |

---

## Expected Outputs

- **Return Type**: `SolverResult`
- **Description**: Step-by-step solution containing cleared denominators (if fractional), collected variable terms, isolated constants, and final rational/radical answers.

---

## Examples

### Example 1

**Input:**
```typescript
rawLeft: "\frac{2}{3}x + \frac{1}{4}", rawRight: "\frac{5}{6}"
```

**Output:**
```typescript
{
  expression: "\frac{2}{3}x + \frac{1}{4} = \frac{5}{6}",
  finalAnswer: "x = \frac{7}{8}",
  steps: [ /* Clearing denominators with LCD 12, isolating x */ ]
}
```


---

## Related Functions & Modules

[solveAlgebra](solveAlgebra.md) • [simplifySquareRoot](simplifySquareRoot.md) • [Fraction](Fraction.md)

---

[Back to Table of Contents](_TOC.md)

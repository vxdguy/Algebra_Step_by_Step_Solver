# `simplifyExpression`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/expressionSimplifier.ts`](../../src/services/solver/expressionSimplifier.ts)
- **Exported Entity**: `simplifyExpression`

---

## Description

Simplifies algebraic expressions by expanding products of binomials/polynomials, distributing coefficients across parentheses, and combining like degree terms.

---

## Why It Is Needed

Provides rigorous step-by-step simplification for polynomial expressions like (2x+3)(x-4) or 3x^2 + 5x - x^2 + 2.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `rawExpr` | `string` | An algebraic polynomial expression to simplify. |

---

## Expected Outputs

- **Return Type**: `SolverResult`
- **Description**: Solution object showing expansion of parentheses, grouping of like terms, and canonical descending-degree simplified form.

---

## Examples

### Example 1

**Input:**
```typescript
3x + 4 - 2x + 7
```

**Output:**
```typescript
{
  expression: "3x + 4 - 2x + 7 = x + 11",
  finalAnswer: "x + 11",
  steps: [ /* Grouping terms, combining coefficients */ ]
}
```


---

## Related Functions & Modules

[Polynomial](Polynomial.md) • [solveAlgebra](solveAlgebra.md)

---

[Back to Table of Contents](_TOC.md)

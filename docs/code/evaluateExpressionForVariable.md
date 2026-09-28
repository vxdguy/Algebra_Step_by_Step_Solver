# `evaluateExpressionForVariable`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/expressionSimplifier.ts`](../../src/services/solver/expressionSimplifier.ts)
- **Exported Entity**: `evaluateExpressionForVariable`

---

## Description

Evaluates single-variable polynomial expressions for a given numerical value, detailing substitution, power evaluation, multiplication, and addition/subtraction.

---

## Why It Is Needed

Provides step-by-step PEMDAS evaluation for single-variable expressions.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `expr` | `string` | Expression to evaluate. |
| `varName` | `string` | Variable identifier to substitute. |
| `val` | `Fraction` | Numerical fraction value for the variable. |
| `originalExpr` | `string` | Original string entered by user. |

---

## Expected Outputs

- **Return Type**: `SolverResult`
- **Description**: Step-by-step substitution and evaluation steps.

---

## Examples

### Example 1

**Input:**
```typescript
expr: "2x + 7", varName: "x", val: Fraction(24, 1), originalExpr: "2x + 7 for x = 24"
```

**Output:**
```typescript
{ expression: "2x + 7 = 55", finalAnswer: "55", steps: [...] }
```


---

## Related Functions & Modules

[solveVariableEvaluation](solveVariableEvaluation.md) • [Fraction](Fraction.md)

---

[Back to Table of Contents](_TOC.md)

# `solveVariableEvaluation`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/variableEvaluator.ts`](../../src/services/solver/variableEvaluator.ts)
- **Exported Entity**: `solveVariableEvaluation`

---

## Description

Solves multi-variable systems where variables may depend on one another. Topologically identifies independent variables, simplifies them, substitutes them into dependent variables, and solves all variables to exact numbers. Restates all resolved variable values alongside the target expression, then evaluates the expression step-by-step with progressive line buildup.

---

## Why It Is Needed

Provides comprehensive step-by-step reasoning for multi-variable substitution problems in pre-algebra and algebra.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `req` | `EvaluationRequest` | Parsed evaluation request containing expr and vars dictionary. |
| `originalExpr` | `string` | Original raw input entered by the user. |

---

## Expected Outputs

- **Return Type**: `SolverResult`
- **Description**: Complete solution with topological variable resolution, restated solved values, and progressive expression evaluation steps.

---

## Examples

### Example 1

**Input:**
```typescript
req: { expr: "2x+3y+4z", vars: { x: "\frac{2y}{3}", y: "21/z", z: "3" } }
```

**Output:**
```typescript
{
  expression: "\begin{aligned} x &= \frac{2y}{3} \\ y &= \frac{21}{z} \\ z &= 3 \\ 2x+3y+4z &= \frac{127}{3} \end{aligned}",
  finalAnswer: "\frac{127}{3}",
  steps: [
    // Step 1: Given equations
    // Step 2: Solve y
    // Step 3: Solve x
    // Step 4: Restate solved values
    // Step 5: Substitution
    // Step 6: Multiplication
    // Step 7: Addition & final answer
  ]
}
```


---

## Related Functions & Modules

[parseEvaluationRequest](parseEvaluationRequest.md) • [solveAlgebra](solveAlgebra.md) • [Fraction](Fraction.md)

---

[Back to Table of Contents](_TOC.md)

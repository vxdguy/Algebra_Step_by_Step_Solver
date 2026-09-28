# `parseEvaluationRequest`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/variableEvaluator.ts`](../../src/services/solver/variableEvaluator.ts)
- **Exported Entity**: `parseEvaluationRequest`

---

## Description

Parses multi-line variable evaluation systems. Extracts variable definitions from preceding lines (e.g. 'x=\frac{2y}{3}', 'y=21/z', 'z=3') and the target expression from the final line (e.g. '2x+3y+4z'). Strips any optional trailing '=' on the expression line.

---

## Why It Is Needed

Enables multi-variable systems with interdependent variable equations and implied equals signs.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `raw` | `string` | Multi-line problem string where lines are separated by LaTeX \\ or newlines. |

---

## Expected Outputs

- **Return Type**: `EvaluationRequest | null`
- **Description**: Parsed object with expr, vars dictionary, and rawLines, or null.

---

## Examples

### Example 1

**Input:**
```typescript
x=\frac{2y}{3} \\ y=21/z \\ z=3 \\ 2x+3y+4z
```

**Output:**
```typescript
{
  expr: "2x+3y+4z",
  vars: { x: "\frac{2y}{3}", y: "21/z", z: "3" },
  rawLines: ["x=\frac{2y}{3}", "y=21/z", "z=3", "2x+3y+4z"]
}
```


---

## Related Functions & Modules

[solveVariableEvaluation](solveVariableEvaluation.md) • [solveAlgebra](solveAlgebra.md)

---

[Back to Table of Contents](_TOC.md)

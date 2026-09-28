# `parseVariableEvaluation`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/expressionSimplifier.ts`](../../src/services/solver/expressionSimplifier.ts)
- **Exported Entity**: `parseVariableEvaluation`

---

## Description

Detects legacy or inline variable evaluation requests using natural language keywords like '2x+7 when x=24'.

---

## Why It Is Needed

Serves as a fallback parser for natural language variable evaluation phrasing.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `raw` | `string` | Text input containing variable assignments. |

---

## Expected Outputs

- **Return Type**: `VariableEvalSpec | null`
- **Description**: Parsed object with expr, varName, and value, or null if not matching.

---

## Examples

### Example 1

**Input:**
```typescript
2x + 7 when x = 24
```

**Output:**
```typescript
{ expr: "2x + 7", varName: "x", value: Fraction(24, 1) }
```


---

## Related Functions & Modules

[evaluateExpressionForVariable](evaluateExpressionForVariable.md) • [parseEvaluationRequest](parseEvaluationRequest.md)

---

[Back to Table of Contents](_TOC.md)

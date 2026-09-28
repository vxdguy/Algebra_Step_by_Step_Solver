# `isFractionArithmeticInput`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/fractionSolver.ts`](../../src/services/solver/fractionSolver.ts)
- **Exported Entity**: `isFractionArithmeticInput`

---

## Description

Identifies multi-term fraction arithmetic problems (e.g. '1/2 + 2/3', '5/6 - 1/4', '2/3 * 5/4', '3/4 / 2/5').

---

## Why It Is Needed

Routes fraction arithmetic problems to solveFractionArithmetic.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `input` | `string` | Candidate expression string. |

---

## Expected Outputs

- **Return Type**: `boolean`
- **Description**: True if the string is a multi-term fraction arithmetic expression (+, -, *, /).

---

## Examples

### Example 1

**Input:**
```typescript
1/2 + 2/3
```

**Output:**
```typescript
true
```


---

## Related Functions & Modules

[solveFractionArithmetic](solveFractionArithmetic.md) • [isFractionReductionInput](isFractionReductionInput.md)

---

[Back to Table of Contents](_TOC.md)

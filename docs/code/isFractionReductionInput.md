# `isFractionReductionInput`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/fractionSolver.ts`](../../src/services/solver/fractionSolver.ts)
- **Exported Entity**: `isFractionReductionInput`

---

## Description

Detects if an input string is a single fraction needing reduction or algebraic factoring.

---

## Why It Is Needed

Allows solveAlgebra to route single fractions to reduceSingleFraction.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `input` | `string` | Candidate fraction expression string. |

---

## Expected Outputs

- **Return Type**: `boolean`
- **Description**: True if the string represents a single reducible fraction like '10/2', '12/8', '3x/6', or '(6x + 9)/3'.

---

## Examples

### Example 1

**Input:**
```typescript
10/2
```

**Output:**
```typescript
true
```

### Example 2

**Input:**
```typescript
1/2 + 2/3
```

**Output:**
```typescript
false
```


---

## Related Functions & Modules

[reduceSingleFraction](reduceSingleFraction.md) • [isFractionArithmeticInput](isFractionArithmeticInput.md)

---

[Back to Table of Contents](_TOC.md)

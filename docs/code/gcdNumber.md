# `gcdNumber`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/fractionUtils.ts`](../../src/services/solver/fractionUtils.ts)
- **Exported Entity**: `gcdNumber`

---

## Description

Calculates the Greatest Common Divisor of two standard JavaScript numbers using the Euclidean algorithm.

---

## Why It Is Needed

Provides lightweight number-level GCD calculation for non-BigInt routines.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `a` | `number` | First integer. |
| `b` | `number` | Second integer. |

---

## Expected Outputs

- **Return Type**: `number`
- **Description**: Greatest Common Divisor (number).

---

## Examples

### Example 1

**Input:**
```typescript
a: 18, b: 24
```

**Output:**
```typescript
6
```


---

## Related Functions & Modules

[gcdBigInt](gcdBigInt.md) • [lcmNumber](lcmNumber.md)

---

[Back to Table of Contents](_TOC.md)

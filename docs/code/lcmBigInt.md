# `lcmBigInt`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/fractionUtils.ts`](../../src/services/solver/fractionUtils.ts)
- **Exported Entity**: `lcmBigInt`

---

## Description

Calculates the Least Common Multiple (LCM) of two BigInt integers via (a * b) / gcdBigInt(a, b).

---

## Why It Is Needed

Used to determine the Least Common Denominator (LCD) when adding/subtracting fractions or clearing denominators in equations.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `a` | `bigint` | First BigInt value. |
| `b` | `bigint` | Second BigInt value. |

---

## Expected Outputs

- **Return Type**: `bigint`
- **Description**: Least Common Multiple (positive BigInt).

---

## Examples

### Example 1

**Input:**
```typescript
a: 4n, b: 6n
```

**Output:**
```typescript
12n
```


---

## Related Functions & Modules

[gcdBigInt](gcdBigInt.md) • [solveFractionArithmetic](solveFractionArithmetic.md)

---

[Back to Table of Contents](_TOC.md)

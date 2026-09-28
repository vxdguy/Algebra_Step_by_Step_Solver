# `gcdBigInt`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/fractionUtils.ts`](../../src/services/solver/fractionUtils.ts)
- **Exported Entity**: `gcdBigInt`

---

## Description

Computes the Greatest Common Divisor (GCD) of two BigInt numbers using the Euclidean algorithm.

---

## Why It Is Needed

Essential for fraction reduction, simplifying coefficients, and finding polynomial common factors.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `a` | `bigint` | First BigInt value. |
| `b` | `bigint` | Second BigInt value. |

---

## Expected Outputs

- **Return Type**: `bigint`
- **Description**: Greatest Common Divisor (positive BigInt).

---

## Examples

### Example 1

**Input:**
```typescript
a: 24n, b: 36n
```

**Output:**
```typescript
12n
```


---

## Related Functions & Modules

[lcmBigInt](lcmBigInt.md) • [Fraction](Fraction.md)

---

[Back to Table of Contents](_TOC.md)

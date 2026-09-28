# `lcmNumber`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/fractionUtils.ts`](../../src/services/solver/fractionUtils.ts)
- **Exported Entity**: `lcmNumber`

---

## Description

Calculates the Least Common Multiple of two numbers via (a * b) / gcdNumber(a, b).

---

## Why It Is Needed

Used for number-level common denominator calculations.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `a` | `number` | First integer. |
| `b` | `number` | Second integer. |

---

## Expected Outputs

- **Return Type**: `number`
- **Description**: Least Common Multiple (number).

---

## Examples

### Example 1

**Input:**
```typescript
a: 3, b: 5
```

**Output:**
```typescript
15
```


---

## Related Functions & Modules

[lcmBigInt](lcmBigInt.md) • [gcdNumber](gcdNumber.md)

---

[Back to Table of Contents](_TOC.md)

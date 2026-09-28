# `simplifySquareRoot`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/radical.ts`](../../src/services/solver/radical.ts)
- **Exported Entity**: `simplifySquareRoot`

---

## Description

Simplifies an exact square root $\sqrt{n}$ into canonical radical form $a\sqrt{b}$ by extracting the largest perfect square factor from $n$.

---

## Why It Is Needed

Provides exact radical solutions for quadratic equations without loss of precision.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `n` | `bigint` | Radicand integer under the square root $\sqrt{n}$. |

---

## Expected Outputs

- **Return Type**: `{ outside: bigint; inside: bigint }`
- **Description**: Simplified radical form $a\sqrt{b}$ where $a^2 \cdot b = n$ and $b$ is square-free.

---

## Examples

### Example 1

**Input:**
```typescript
n: 48n
```

**Output:**
```typescript
{ outside: 4n, inside: 3n } // 4\sqrt{3}
```

### Example 2

**Input:**
```typescript
n: 25n
```

**Output:**
```typescript
{ outside: 5n, inside: 1n } // 5
```


---

## Related Functions & Modules

[formatRadicalTex](formatRadicalTex.md) • [solveEquation](solveEquation.md)

---

[Back to Table of Contents](_TOC.md)

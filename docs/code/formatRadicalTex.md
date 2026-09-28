# `formatRadicalTex`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/radical.ts`](../../src/services/solver/radical.ts)
- **Exported Entity**: `formatRadicalTex`

---

## Description

Formats a simplified radical pair (outside, inside) into clean LaTeX, handling special cases where inside is 1 (pure integer) or outside is 1 (pure radical).

---

## Why It Is Needed

Ensures textbook-accurate radical display in quadratic equation solutions.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `outside` | `bigint` | Integer coefficient outside the radical. |
| `inside` | `bigint` | Square-free radicand inside the radical. |

---

## Expected Outputs

- **Return Type**: `string`
- **Description**: LaTeX string (e.g. '4\sqrt{3}', '5', '\sqrt{7}').

---

## Examples

### Example 1

**Input:**
```typescript
outside: 4n, inside: 3n
```

**Output:**
```typescript
"4\sqrt{3}"
```


---

## Related Functions & Modules

[simplifySquareRoot](simplifySquareRoot.md) • [solveEquation](solveEquation.md)

---

[Back to Table of Contents](_TOC.md)

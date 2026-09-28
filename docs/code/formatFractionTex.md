# `formatFractionTex`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/fractionUtils.ts`](../../src/services/solver/fractionUtils.ts)
- **Exported Entity**: `formatFractionTex`

---

## Description

Formats a Fraction into clean LaTeX. Omits the fraction bar if the denominator is 1.

---

## Why It Is Needed

Ensures uniform fraction formatting across solver explanations.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `f` | `Fraction` | The fraction object to format. |

---

## Expected Outputs

- **Return Type**: `string`
- **Description**: LaTeX representation: integer if den=1, otherwise \frac{num}{den}.

---

## Examples

### Example 1

**Input:**
```typescript
new Fraction(5n, 1n)
```

**Output:**
```typescript
"5"
```

### Example 2

**Input:**
```typescript
new Fraction(3n, 4n)
```

**Output:**
```typescript
"\frac{3}{4}"
```


---

## Related Functions & Modules

[Fraction](Fraction.md) • [nodeToTex](nodeToTex.md)

---

[Back to Table of Contents](_TOC.md)

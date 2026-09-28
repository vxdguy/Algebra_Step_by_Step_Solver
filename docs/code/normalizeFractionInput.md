# `normalizeFractionInput`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/fractionSolver.ts`](../../src/services/solver/fractionSolver.ts)
- **Exported Entity**: `normalizeFractionInput`

---

## Description

Cleans and normalizes LaTeX fraction notation (e.g. \frac{a}{b}, \cdot, \div) into standardized ASCII representations for arithmetic processing.

---

## Why It Is Needed

Prepares user-typed fractions for pattern matching and arithmetic evaluation.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `raw` | `string` | Raw fraction input string with LaTeX or ASCII formatting. |

---

## Expected Outputs

- **Return Type**: `string`
- **Description**: Normalized ASCII fraction string.

---

## Examples

### Example 1

**Input:**
```typescript
\frac{2}{3} \cdot \frac{5}{4}
```

**Output:**
```typescript
"2/3 * 5/4"
```


---

## Related Functions & Modules

[isFractionReductionInput](isFractionReductionInput.md) • [isFractionArithmeticInput](isFractionArithmeticInput.md)

---

[Back to Table of Contents](_TOC.md)

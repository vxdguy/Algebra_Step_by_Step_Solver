# `Polynomial`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/polynomial.ts`](../../src/services/solver/polynomial.ts)
- **Exported Entity**: `Polynomial`

---

## Description

Represents a single-variable polynomial $P(x) = \sum c_i x^i$ with exact Fraction coefficients. Supports addition, subtraction, multiplication, negation, evaluation at a given Fraction point, derivative, degree inspection, and LaTeX rendering (toTex).

---

## Why It Is Needed

Powers the algebraic manipulation for equation solving, expression expansion, like-term combination, and factoring.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `targetVar` | `string (optional, default 'x')` | Variable indeterminate. |
| `terms` | `Map<number, Fraction> (optional)` | Map from degree (number) to exact coefficient (Fraction). |

---

## Expected Outputs

- **Return Type**: `Polynomial instance`
- **Description**: An algebraic polynomial with exact arithmetic operations.

---

## Examples

### Example 1

**Input:**
```typescript
Polynomial with terms { 2 => 1/1, 1 => -5/1, 0 => 6/1 }
```

**Output:**
```typescript
toTex() -> "x^{2} - 5x + 6"
```


---

## Related Functions & Modules

[astToPolynomial](astToPolynomial.md) • [Fraction](Fraction.md)

---

[Back to Table of Contents](_TOC.md)

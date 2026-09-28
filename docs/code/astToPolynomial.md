# `astToPolynomial`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/ast.ts`](../../src/services/solver/ast.ts)
- **Exported Entity**: `astToPolynomial`

---

## Description

Converts an arbitrary algebraic AST expression into a canonical single-variable Polynomial representation with exact Fraction coefficients. Supports addition, subtraction, multiplication, and integer exponentiation of polynomials.

---

## Why It Is Needed

Enables canonical polynomial algebraic operations, such as collecting like terms, multiplying polynomials, and finding degrees/coefficients for linear and quadratic solvers.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `node` | `ASTNode` | The AST expression to convert. |
| `targetVar` | `string (optional, default 'x')` | The primary variable name to treat as the polynomial indeterminate. |

---

## Expected Outputs

- **Return Type**: `Polynomial`
- **Description**: A canonical Polynomial object mapping degree powers to exact Fraction coefficients.

---

## Examples

### Example 1

**Input:**
```typescript
AST for "(x + 2)(x + 3)", targetVar="x"
```

**Output:**
```typescript
Polynomial { targetVar: "x", terms: Map { 2 => 1/1, 1 => 5/1, 0 => 6/1 } } // x^2 + 5x + 6
```


---

## Related Functions & Modules

[Polynomial](Polynomial.md) • [solveEquation](solveEquation.md) • [simplifyExpression](simplifyExpression.md)

---

[Back to Table of Contents](_TOC.md)

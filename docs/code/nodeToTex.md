# `nodeToTex`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/ast.ts`](../../src/services/solver/ast.ts)
- **Exported Entity**: `nodeToTex`

---

## Description

Recursively traverses an Abstract Syntax Tree (ASTNode) and renders standard mathematical LaTeX notation. Correctly generates \frac{numerator}{denominator} for divisions, {base}^{exponent} for powers, \sqrt{arg} for radicals, and formats implicit multiplications (omitting \cdot when multiplying numbers by variables or radicals).

---

## Why It Is Needed

Provides clean, elegant LaTeX representations of parsed expressions for KaTeX rendering in the frontend and step-by-step mathematical reasoning.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `node` | `ASTNode` | The root or sub-node of an Abstract Syntax Tree. |
| `parentPrecedence` | `number (optional, default 0)` | The operator precedence of the parent AST node, used to selectively emit parentheses only when mathematically required. |

---

## Expected Outputs

- **Return Type**: `string`
- **Description**: Formatted LaTeX math string representing the AST.

---

## Examples

### Example 1

**Input:**
```typescript
binary("/", binary("^", number(2), number(3)), number(5))
```

**Output:**
```typescript
"\frac{{2}^{3}}{5}"
```

### Example 2

**Input:**
```typescript
binary("+", binary("*", number(2), variable("x")), number(7))
```

**Output:**
```typescript
"2x + 7"
```


---

## Related Functions & Modules

[tokenize](tokenize.md) • [toDisplayLatex](toDisplayLatex.md) • [astToPolynomial](astToPolynomial.md)

---

[Back to Table of Contents](_TOC.md)

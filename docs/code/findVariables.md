# `findVariables`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/ast.ts`](../../src/services/solver/ast.ts)
- **Exported Entity**: `findVariables`

---

## Description

Recursively walks an Abstract Syntax Tree to identify all distinct variable names (e.g. ['x'], ['x', 'y', 'z']) present in the expression.

---

## Why It Is Needed

Allows equation and expression solvers to detect which variables are present, distinguish single-variable from multi-variable problems, and pick the primary variable to solve for.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `node` | `ASTNode` | The AST node to analyze. |

---

## Expected Outputs

- **Return Type**: `string[]`
- **Description**: An array of unique variable names found in the AST.

---

## Examples

### Example 1

**Input:**
```typescript
AST for "2x + 3y + 4z"
```

**Output:**
```typescript
["x", "y", "z"]
```


---

## Related Functions & Modules

[tokenize](tokenize.md) • [astToPolynomial](astToPolynomial.md)

---

[Back to Table of Contents](_TOC.md)

# `toDisplayLatex`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/latexConverter.ts`](../../src/services/solver/latexConverter.ts)
- **Exported Entity**: `toDisplayLatex`

---

## Description

Parses mathematical text through the AST parser and converts division operators (/) into properly structured LaTeX \frac{numerator}{denominator} fractions according to algebraic operator precedence rules.

---

## Why It Is Needed

Converts user-typed slash notation into professional textbook LaTeX in both the real-time preview and solution steps.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `raw` | `string` | Mathematical expression or equation with slash fractions (e.g. 'y=21/z', '2^3/5', '2x+3y+4z'). |

---

## Expected Outputs

- **Return Type**: `string`
- **Description**: Formatted LaTeX math string with fractions rendered as \frac{...}{...} according to AST precedence.

---

## Examples

### Example 1

**Input:**
```typescript
y=21/z
```

**Output:**
```typescript
"y = \frac{21}{z}"
```

### Example 2

**Input:**
```typescript
2^3/5
```

**Output:**
```typescript
"\frac{{2}^{3}}{5}"
```

### Example 3

**Input:**
```typescript
2^(3/5)
```

**Output:**
```typescript
"{2}^{\frac{3}{5}}"
```


---

## Related Functions & Modules

[latexToAscii](latexToAscii.md) • [nodeToTex](nodeToTex.md) • [tokenize](tokenize.md)

---

[Back to Table of Contents](_TOC.md)

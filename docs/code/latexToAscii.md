# `latexToAscii`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/latexConverter.ts`](../../src/services/solver/latexConverter.ts)
- **Exported Entity**: `latexToAscii`

---

## Description

Translates LaTeX math macros and syntax into plain ASCII algebra notation. Recursively unpacks \frac{numerator}{denominator} into parenthesized divisions, strips spacing and displaystyle commands, normalizes multiplication (\cdot, \times) to *, and division (\div) to /.

---

## Why It Is Needed

Allows the internal Computer Algebra System (CAS) to seamlessly accept LaTeX copied from textbooks or web tools.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `rawInput` | `string` | Raw LaTeX string containing \frac{a}{b}, \cdot, \div, \left(, \right), etc. |

---

## Expected Outputs

- **Return Type**: `string`
- **Description**: Normalized ASCII algebraic string parseable by CAS AST parsers.

---

## Examples

### Example 1

**Input:**
```typescript
\frac{2y}{3}
```

**Output:**
```typescript
"2y / 3"
```

### Example 2

**Input:**
```typescript
\frac{6x + 9}{3}
```

**Output:**
```typescript
"(6x + 9) / 3"
```


---

## Related Functions & Modules

[toDisplayLatex](toDisplayLatex.md) • [tokenize](tokenize.md)

---

[Back to Table of Contents](_TOC.md)

# `tokenize`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/solver/ast.ts`](../../src/services/solver/ast.ts)
- **Exported Entity**: `tokenize`

---

## Description

Performs lexical analysis (tokenization) on an algebraic string. Recognizes numbers (integers and decimals), multi-character numbers, single-letter variables, arithmetic operators, parentheses, equals signs, and functions like sqrt. Also handles implicit multiplication (e.g., 2x or 3(x+1)).

---

## Why It Is Needed

Converts raw mathematical text streams into structured discrete tokens so the recursive-descent Parser can construct abstract syntax trees (ASTs).

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `input` | `string` | Standard ASCII mathematical expression or equation string. |

---

## Expected Outputs

- **Return Type**: `Token[]`
- **Description**: An array of lexical tokens including NUMBER, VARIABLE, PLUS, MINUS, STAR, SLASH, CARET, LPAREN, RPAREN, EQUALS, and SQRT.

---

## Examples

### Example 1

**Input:**
```typescript
2x + 5 = 15
```

**Output:**
```typescript
[
  { type: "NUMBER", value: "2" },
  { type: "STAR" },
  { type: "VARIABLE", value: "x" },
  { type: "PLUS" },
  { type: "NUMBER", value: "5" },
  { type: "EQUALS" },
  { type: "NUMBER", value: "15" }
]
```


---

## Related Functions & Modules

[nodeToTex](nodeToTex.md) • [astToPolynomial](astToPolynomial.md) • [findVariables](findVariables.md)

---

[Back to Table of Contents](_TOC.md)

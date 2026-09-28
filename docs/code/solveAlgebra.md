# `solveAlgebra`

[Back to Table of Contents](_TOC.md)

- **Source File**: [`src/services/algebraSolver.ts`](../../src/services/algebraSolver.ts)
- **Exported Entity**: `solveAlgebra`

---

## Description

The primary entry point and orchestrator for the entire Computer Algebra System (CAS). It sanitizes raw LaTeX or standard algebraic input, strips conversational command prefixes (e.g. 'simplify', 'solve'), detects the category of problem (single fraction reduction, multi-term fraction arithmetic, linear equations, quadratic equations, or multi-variable systems with dependencies), and delegates to the appropriate specialized solver module.

---

## Why It Is Needed

Provides a single unified asynchronous interface that the React UI calls to solve any supported pre-algebra or algebra problem deterministically without requiring external API requests or LLM calls.

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `rawInput` | `string` | The raw mathematical problem entered by the user (algebraic equation, single fraction, fraction arithmetic, polynomial, or multi-line system with LaTeX \\). |

---

## Expected Outputs

- **Return Type**: `Promise<SolverResult>`
- **Description**: An object containing the formatted LaTeX expression, the final answer string, and an array of SolutionStep items.

---

## Examples

### Example 1

**Input:**
```typescript
x=\frac{2y}{3} \\ y=21/z \\ z=3 \\ 2x+3y+4z
```

**Output:**
```typescript
{
  expression: "\begin{aligned} x &= \frac{2y}{3} \\ y &= \frac{21}{z} \\ z &= 3 \\ 2x+3y+4z &= \frac{127}{3} \end{aligned}",
  finalAnswer: "\frac{127}{3}",
  steps: [ /* 7 progressive SolutionStep items */ ]
}
```

### Example 2

**Input:**
```typescript
\frac{1}{2} + \frac{2}{3}
```

**Output:**
```typescript
{
  expression: "\frac{1}{2} + \frac{2}{3} = \frac{7}{6}",
  finalAnswer: "\frac{7}{6}",
  steps: [ /* LCD finding, conversion, combination steps */ ]
}
```


---

## Related Functions & Modules

[solveEquation](solveEquation.md) • [solveVariableEvaluation](solveVariableEvaluation.md) • [reduceSingleFraction](reduceSingleFraction.md) • [solveFractionArithmetic](solveFractionArithmetic.md) • [latexToAscii](latexToAscii.md)

---

[Back to Table of Contents](_TOC.md)

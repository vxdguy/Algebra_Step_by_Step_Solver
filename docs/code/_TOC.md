# Code Documentation — Table of Contents

Welcome to the technical code documentation for the **Deterministic Algebra & Fraction Solver Engine**.

- [Back to Project README](../../README.md)
- [License (GPL v3)](../../LICENSE.md)

---

## Table of Contents by Source File

### [`src/services/algebraSolver.ts`](../../src/services/algebraSolver.ts)

  - [`solveAlgebra`](solveAlgebra.md) — *Promise<SolverResult>*

### [`src/services/solver/ast.ts`](../../src/services/solver/ast.ts)

  - [`astToPolynomial`](astToPolynomial.md) — *Polynomial*
  - [`findVariables`](findVariables.md) — *string[]*
  - [`nodeToTex`](nodeToTex.md) — *string*
  - [`tokenize`](tokenize.md) — *Token[]*

### [`src/services/solver/equationSolver.ts`](../../src/services/solver/equationSolver.ts)

  - [`solveEquation`](solveEquation.md) — *SolverResult*

### [`src/services/solver/expressionSimplifier.ts`](../../src/services/solver/expressionSimplifier.ts)

  - [`evaluateExpressionForVariable`](evaluateExpressionForVariable.md) — *SolverResult*
  - [`parseVariableEvaluation`](parseVariableEvaluation.md) — *VariableEvalSpec | null*
  - [`simplifyExpression`](simplifyExpression.md) — *SolverResult*

### [`src/services/solver/fraction.ts`](../../src/services/solver/fraction.ts)

  - [`Fraction`](Fraction.md) — *Fraction instance*

### [`src/services/solver/fractionSolver.ts`](../../src/services/solver/fractionSolver.ts)

  - [`isFractionArithmeticInput`](isFractionArithmeticInput.md) — *boolean*
  - [`isFractionReductionInput`](isFractionReductionInput.md) — *boolean*
  - [`normalizeFractionInput`](normalizeFractionInput.md) — *string*
  - [`reduceSingleFraction`](reduceSingleFraction.md) — *SolverResult*
  - [`solveFractionArithmetic`](solveFractionArithmetic.md) — *SolverResult*

### [`src/services/solver/fractionUtils.ts`](../../src/services/solver/fractionUtils.ts)

  - [`formatFractionTex`](formatFractionTex.md) — *string*
  - [`gcdBigInt`](gcdBigInt.md) — *bigint*
  - [`gcdNumber`](gcdNumber.md) — *number*
  - [`lcmBigInt`](lcmBigInt.md) — *bigint*
  - [`lcmNumber`](lcmNumber.md) — *number*

### [`src/services/solver/latexConverter.ts`](../../src/services/solver/latexConverter.ts)

  - [`latexToAscii`](latexToAscii.md) — *string*
  - [`toDisplayLatex`](toDisplayLatex.md) — *string*

### [`src/services/solver/polynomial.ts`](../../src/services/solver/polynomial.ts)

  - [`Polynomial`](Polynomial.md) — *Polynomial instance*

### [`src/services/solver/radical.ts`](../../src/services/solver/radical.ts)

  - [`formatRadicalTex`](formatRadicalTex.md) — *string*
  - [`simplifySquareRoot`](simplifySquareRoot.md) — *{ outside: bigint; inside: bigint }*

### [`src/services/solver/variableEvaluator.ts`](../../src/services/solver/variableEvaluator.ts)

  - [`parseEvaluationRequest`](parseEvaluationRequest.md) — *EvaluationRequest | null*
  - [`solveVariableEvaluation`](solveVariableEvaluation.md) — *SolverResult*

---

## Table of Contents (Alphabetical by Exported Function)

- [`astToPolynomial`](astToPolynomial.md) (defined in [`src/services/solver/ast.ts`](../../src/services/solver/ast.ts))
- [`evaluateExpressionForVariable`](evaluateExpressionForVariable.md) (defined in [`src/services/solver/expressionSimplifier.ts`](../../src/services/solver/expressionSimplifier.ts))
- [`findVariables`](findVariables.md) (defined in [`src/services/solver/ast.ts`](../../src/services/solver/ast.ts))
- [`formatFractionTex`](formatFractionTex.md) (defined in [`src/services/solver/fractionUtils.ts`](../../src/services/solver/fractionUtils.ts))
- [`formatRadicalTex`](formatRadicalTex.md) (defined in [`src/services/solver/radical.ts`](../../src/services/solver/radical.ts))
- [`Fraction`](Fraction.md) (defined in [`src/services/solver/fraction.ts`](../../src/services/solver/fraction.ts))
- [`gcdBigInt`](gcdBigInt.md) (defined in [`src/services/solver/fractionUtils.ts`](../../src/services/solver/fractionUtils.ts))
- [`gcdNumber`](gcdNumber.md) (defined in [`src/services/solver/fractionUtils.ts`](../../src/services/solver/fractionUtils.ts))
- [`isFractionArithmeticInput`](isFractionArithmeticInput.md) (defined in [`src/services/solver/fractionSolver.ts`](../../src/services/solver/fractionSolver.ts))
- [`isFractionReductionInput`](isFractionReductionInput.md) (defined in [`src/services/solver/fractionSolver.ts`](../../src/services/solver/fractionSolver.ts))
- [`latexToAscii`](latexToAscii.md) (defined in [`src/services/solver/latexConverter.ts`](../../src/services/solver/latexConverter.ts))
- [`lcmBigInt`](lcmBigInt.md) (defined in [`src/services/solver/fractionUtils.ts`](../../src/services/solver/fractionUtils.ts))
- [`lcmNumber`](lcmNumber.md) (defined in [`src/services/solver/fractionUtils.ts`](../../src/services/solver/fractionUtils.ts))
- [`nodeToTex`](nodeToTex.md) (defined in [`src/services/solver/ast.ts`](../../src/services/solver/ast.ts))
- [`normalizeFractionInput`](normalizeFractionInput.md) (defined in [`src/services/solver/fractionSolver.ts`](../../src/services/solver/fractionSolver.ts))
- [`parseEvaluationRequest`](parseEvaluationRequest.md) (defined in [`src/services/solver/variableEvaluator.ts`](../../src/services/solver/variableEvaluator.ts))
- [`parseVariableEvaluation`](parseVariableEvaluation.md) (defined in [`src/services/solver/expressionSimplifier.ts`](../../src/services/solver/expressionSimplifier.ts))
- [`Polynomial`](Polynomial.md) (defined in [`src/services/solver/polynomial.ts`](../../src/services/solver/polynomial.ts))
- [`reduceSingleFraction`](reduceSingleFraction.md) (defined in [`src/services/solver/fractionSolver.ts`](../../src/services/solver/fractionSolver.ts))
- [`simplifyExpression`](simplifyExpression.md) (defined in [`src/services/solver/expressionSimplifier.ts`](../../src/services/solver/expressionSimplifier.ts))
- [`simplifySquareRoot`](simplifySquareRoot.md) (defined in [`src/services/solver/radical.ts`](../../src/services/solver/radical.ts))
- [`solveAlgebra`](solveAlgebra.md) (defined in [`src/services/algebraSolver.ts`](../../src/services/algebraSolver.ts))
- [`solveEquation`](solveEquation.md) (defined in [`src/services/solver/equationSolver.ts`](../../src/services/solver/equationSolver.ts))
- [`solveFractionArithmetic`](solveFractionArithmetic.md) (defined in [`src/services/solver/fractionSolver.ts`](../../src/services/solver/fractionSolver.ts))
- [`solveVariableEvaluation`](solveVariableEvaluation.md) (defined in [`src/services/solver/variableEvaluator.ts`](../../src/services/solver/variableEvaluator.ts))
- [`toDisplayLatex`](toDisplayLatex.md) (defined in [`src/services/solver/latexConverter.ts`](../../src/services/solver/latexConverter.ts))
- [`tokenize`](tokenize.md) (defined in [`src/services/solver/ast.ts`](../../src/services/solver/ast.ts))

---

[Back to Project README](../../README.md)

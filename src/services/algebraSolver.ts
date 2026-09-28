import { solveEquation, SolutionStep, SolverResult } from './solver/equationSolver';
import { simplifyExpression } from './solver/expressionSimplifier';
import { 
  parseEvaluationRequest, 
  solveVariableEvaluation 
} from './solver/variableEvaluator';
import { 
  isFractionReductionInput, 
  isFractionArithmeticInput, 
  reduceSingleFraction, 
  solveFractionArithmetic 
} from './solver/fractionSolver';
import { latexToAscii } from './solver/latexConverter';

export type { SolutionStep, SolverResult };

/**
 * 100% Programmatic Algebra & Fraction Solver
 * Deterministic Computer Algebra System (CAS) with 8th Grade Pre-Algebra step-by-step reasoning.
 * Accepts both standard algebra input and LaTeX input.
 * Does not use AI or external APIs.
 */
export async function solveAlgebra(rawInput: string): Promise<SolverResult> {
  let input = rawInput.trim();
  if (!input) {
    throw new Error("Please enter an algebra expression, fraction, or equation.");
  }

  // Strip friendly command prefixes like "simplify \frac{3x}{6}" or "reduce 10/2"
  const stripped = input.replace(/^(simplify|reduce|solve)\s+/i, '').trim();
  if (stripped) {
    input = stripped;
  }

  // Check for variable evaluation (multiline with "\\", variables defined on separate lines)
  const evalReq = parseEvaluationRequest(input);
  if (evalReq) {
    return solveVariableEvaluation(evalReq, rawInput);
  }

  // If input contains LaTeX commands or braces, convert to ASCII algebra notation
  if (input.includes('\\') || /[{}]/.test(input)) {
    input = latexToAscii(input);
  }

  // Check again after LaTeX normalization
  const normEvalReq = parseEvaluationRequest(input);
  if (normEvalReq) {
    return solveVariableEvaluation(normEvalReq, rawInput);
  }

  // Allow simulated tick to yield to React event loop
  await new Promise(resolve => setTimeout(resolve, 20));

  try {
    // 1. Single fraction reduction: e.g. "10/2", "11/3", "12/8", "3x/6", "(6x + 9)/3"
    if (isFractionReductionInput(input)) {
      return reduceSingleFraction(input);
    }

    // 2. Fraction arithmetic: e.g. "1/2 + 2/3", "5/6 - 1/4", "(2/3) * (5/4)", "3/4 / 2/5"
    if (isFractionArithmeticInput(input)) {
      return solveFractionArithmetic(input);
    }

    // 3. Equations containing '=': e.g. "2x + 5 = 15", "x/3 + 4 = 9", "(x+2)/3 = (2x-1)/5"
    if (input.includes('=')) {
      const parts = input.split('=');
      if (parts.length === 2) {
        return solveEquation(parts[0].trim(), parts[1].trim(), rawInput);
      }
      if (parts.length > 2) {
        throw new Error("Equations with multiple '=' signs are not supported.");
      }
    }

    // 4. General algebraic expression expansion/simplification/PEMDAS
    return simplifyExpression(input);
  } catch (err: any) {
    console.error("Solver error:", err);
    throw new Error(err.message || "Could not solve the expression. Please check the mathematical syntax.");
  }
}



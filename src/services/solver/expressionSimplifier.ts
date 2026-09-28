import { Fraction } from './fraction';
import { Polynomial } from './polynomial';
import { tokenize, Parser, astToPolynomial, nodeToTex, findVariables, ASTNode } from './ast';
import { SolutionStep, SolverResult } from './equationSolver';

export interface VariableEvalSpec {
  baseExpr: string;
  varName: string;
  valStr: string;
}

/**
 * Parses user input for evaluating an algebraic expression when a variable equals a number.
 * Supports:
 * - "2x + 5 when x = 3"
 * - "2x + 5 for x = 3"
 * - "2x + 5 where x = 3"
 * - "2x + 5 with x = 3"
 * - "2x + 5 at x = 3"
 * - "2x + 5, x = 3"
 * - "2x + 5; x = 3"
 * - "when x = 3, 2x + 5"
 * - "if x = 3, 2x + 5"
 * - "x = 3, 2x + 5"
 * - "x = 1/2, 4x + 6"
 */
export function parseVariableEvaluation(raw: string): VariableEvalSpec | null {
  let s = raw.trim();
  s = s.replace(/^(evaluate|eval|calculate)\s+/i, '').trim();

  // Pattern 1: <expr> [when|for|where|with|at|,|;] <var> = <val>
  const m1 = s.match(/^(.*?)(?:\s+(?:when|for|where|with|at)\s+|[,;]\s*)([a-zA-Z])\s*=\s*(-?\d+(?:\.\d+)?|-?\d+\s*\/\s*\d+|-\s*\\frac\{\d+\}\{\d+\}|\\frac\{\d+\}\{\d+\})$/i);
  if (m1 && m1[1].trim() && !m1[1].includes('=')) {
    return {
      baseExpr: m1[1].trim(),
      varName: m1[2],
      valStr: m1[3].trim()
    };
  }

  // Pattern 2: [when|if]? <var> = <val> [,;|then] <expr>
  const m2 = s.match(/^(?:(?:when|if)\s+)?([a-zA-Z])\s*=\s*(-?\d+(?:\.\d+)?|-?\d+\s*\/\s*\d+|-\s*\\frac\{\d+\}\{\d+\}|\\frac\{\d+\}\{\d+\})(?:[,;]|\s+then|\s+evaluate|\s+find)\s+(.*?)$/i);
  if (m2 && m2[3].trim() && !m2[3].includes('=')) {
    return {
      baseExpr: m2[3].trim(),
      varName: m2[1],
      valStr: m2[2].trim()
    };
  }

  return null;
}

/**
 * Simplifies an algebraic or arithmetic expression step-by-step
 */
export function simplifyExpression(exprStr: string): SolverResult {
  const steps: SolutionStep[] = [];
  let cleanInput = exprStr.trim();

  // Check if expression is a command like "factor x^2 - 5x + 6" or "expand (x+2)(x-3)"
  const isFactorCmd = /^factor\b/i.test(cleanInput);
  if (isFactorCmd) {
    cleanInput = cleanInput.replace(/^factor\b/i, '').trim();
  }

  // Check for variable evaluation like "2x + 5 when x = 3"
  const evalSpec = parseVariableEvaluation(cleanInput);
  if (evalSpec) {
    return evaluateExpressionForVariable(evalSpec.baseExpr, evalSpec.varName, evalSpec.valStr, exprStr);
  }

  // Parse AST
  const tokens = tokenize(cleanInput);
  const ast = new Parser(tokens).parse();
  const rawTex = nodeToTex(ast);

  steps.push({
    title: "Given Expression",
    explanation: "Write down the expression to evaluate or simplify.",
    math: rawTex
  });

  const vars = findVariables(ast);

  // Case 1: Pure Numerical Expression (PEMDAS / Order of Operations)
  if (vars.length === 0) {
    return evaluateNumericalPEMDAS(ast, exprStr, steps);
  }

  // Case 2: Single-Variable Algebraic Expression
  const v = vars[0];
  const poly = astToPolynomial(ast, v);

  // If factor command or requested factoring:
  if (isFactorCmd) {
    return factorPolynomial(poly, v, exprStr, steps);
  }

  // Step: Distributive Property / Expansion
  // If the AST contains multiplication of expressions or powers with variables
  const hasParenthesesOrPowers = astContainsSubtree(ast, n => 
    (n.type === 'binary' && (n.operator === '*' || n.operator === '^')) ||
    (n.type === 'unary')
  );

  if (hasParenthesesOrPowers) {
    steps.push({
      title: "Apply Distributive Property / Expand Factors",
      explanation: "Multiply polynomials and expand any grouped terms.",
      math: poly.toTex()
    });
  }

  // Step: Group and Combine Like Terms
  steps.push({
    title: "Combine Like Terms",
    explanation: `Group terms by degrees of $${v}$ and add their coefficients together.`,
    math: poly.toTex()
  });

  return {
    expression: exprStr,
    finalAnswer: poly.toTex(),
    steps
  };
}

/**
 * Step-by-step evaluation of pure numerical expressions
 */
function evaluateNumericalPEMDAS(ast: ASTNode, originalExpr: string, steps: SolutionStep[]): SolverResult {
  // Let's perform step reductions
  let currentAst = ast;
  let iterations = 0;

  while (iterations < 20) {
    const nextStep = reduceAstStep(currentAst);
    if (!nextStep) break;

    steps.push({
      title: nextStep.title,
      explanation: nextStep.explanation,
      math: nodeToTex(nextStep.newAst)
    });

    currentAst = nextStep.newAst;
    iterations++;
  }

  const finalFraction = currentAst.type === 'number' ? currentAst.value : new Fraction(0n, 1n);

  return {
    expression: originalExpr,
    finalAnswer: finalFraction.toTex(),
    steps
  };
}

interface StepReduction {
  newAst: ASTNode;
  title: string;
  explanation: string;
}

function reduceAstStep(node: ASTNode): StepReduction | null {
  // 1. Sqrt or parentheses operations
  if (node.type === 'sqrt') {
    if (node.argument.type === 'number') {
      const val = node.argument.value.toNumber();
      const sq = Math.sqrt(val);
      if (Number.isInteger(sq)) {
        const resFrac = new Fraction(sq);
        return {
          newAst: { type: 'number', value: resFrac },
          title: "Evaluate Square Root",
          explanation: `Calculate $\\sqrt{${node.argument.value.toTex()}} = ${resFrac.toTex()}$.`
        };
      }
    } else {
      const inner = reduceAstStep(node.argument);
      if (inner) {
        return {
          newAst: { type: 'sqrt', argument: inner.newAst },
          title: inner.title,
          explanation: inner.explanation
        };
      }
    }
  }

  // 2. Binary operations: check children first (bottom-up), or evaluate if both are numbers
  if (node.type === 'binary') {
    // Check if left can be reduced
    if (node.left.type !== 'number') {
      const leftRed = reduceAstStep(node.left);
      if (leftRed) {
        return {
          newAst: { type: 'binary', operator: node.operator, left: leftRed.newAst, right: node.right },
          title: leftRed.title,
          explanation: leftRed.explanation
        };
      }
    }

    // Check if right can be reduced
    if (node.right.type !== 'number') {
      const rightRed = reduceAstStep(node.right);
      if (rightRed) {
        return {
          newAst: { type: 'binary', operator: node.operator, left: node.left, right: rightRed.newAst },
          title: rightRed.title,
          explanation: rightRed.explanation
        };
      }
    }

    // Both are numbers! Perform operation according to PEMDAS
    if (node.left.type === 'number' && node.right.type === 'number') {
      const l = node.left.value;
      const r = node.right.value;
      let res: Fraction;
      let title = '';
      let explanation = '';

      switch (node.operator) {
        case '^':
          if (!r.isInteger()) throw new Error("Fractional exponents not supported numerically");
          res = l.pow(Number(r.num));
          title = "Evaluate Exponent";
          explanation = `Calculate $(${l.toTex()})^{${r.toTex()}} = ${res.toTex()}$.`;
          break;
        case '*':
          res = l.mul(r);
          title = "Perform Multiplication";
          explanation = `Multiply $${l.toTex()} \\cdot ${r.toTex()} = ${res.toTex()}$.`;
          break;
        case '/':
          res = l.div(r);
          title = "Perform Division";
          explanation = `Divide $${l.toTex()} / ${r.toTex()} = ${res.toTex()}$.`;
          break;
        case '+':
          res = l.add(r);
          title = "Perform Addition";
          explanation = `Add $${l.toTex()} + ${r.toTex()} = ${res.toTex()}$.`;
          break;
        case '-':
          res = l.sub(r);
          title = "Perform Subtraction";
          explanation = `Subtract $${l.toTex()} - ${r.toTex()} = ${res.toTex()}$.`;
          break;
      }

      return {
        newAst: { type: 'number', value: res },
        title,
        explanation
      };
    }
  }

  if (node.type === 'unary' && node.operator === '-') {
    if (node.argument.type === 'number') {
      const res = node.argument.value.neg();
      return {
        newAst: { type: 'number', value: res },
        title: "Apply Negation",
        explanation: `Negate value: $-(${node.argument.value.toTex()}) = ${res.toTex()}$.`
      };
    } else {
      const argRed = reduceAstStep(node.argument);
      if (argRed) {
        return {
          newAst: { type: 'unary', operator: '-', argument: argRed.newAst },
          title: argRed.title,
          explanation: argRed.explanation
        };
      }
    }
  }

  return null;
}

/**
 * Factoring a quadratic polynomial
 */
function factorPolynomial(poly: Polynomial, v: string, originalExpr: string, steps: SolutionStep[]): SolverResult {
  const deg = poly.getDegree();
  if (deg === 2) {
    const a = poly.getCoefficient(2);
    const b = poly.getCoefficient(1);
    const c = poly.getCoefficient(0);

    // Difference of squares: a*x^2 - c where b = 0 and -c > 0
    if (b.isZero() && c.isNegative()) {
      const posC = c.neg();
      if (a.isOne() && posC.isInteger()) {
        const sq = Math.sqrt(Number(posC.num));
        if (Number.isInteger(sq)) {
          const sqF = new Fraction(sq);
          steps.push({
            title: "Difference of Squares Formula",
            explanation: `Recognize form $a^2 - b^2 = (a - b)(a + b)$ with $a = ${v}$ and $b = ${sqF.toTex()}$.`,
            math: `(${v} - ${sqF.toTex()})(${v} + ${sqF.toTex()})`
          });
          return {
            expression: originalExpr,
            finalAnswer: `(${v} - ${sqF.toTex()})(${v} + ${sqF.toTex()})`,
            steps
          };
        }
      }
    }

    // Trinomial factoring: find p and q such that p*q = a*c and p+q = b
    const ac = a.mul(c);
    if (ac.isInteger() && b.isInteger() && a.isOne()) {
      const acInt = Number(ac.num);
      const bInt = Number(b.num);
      let foundP: number | null = null;
      let foundQ: number | null = null;

      for (let p = -Math.abs(acInt); p <= Math.abs(acInt); p++) {
        if (p === 0) continue;
        if (acInt % p === 0) {
          const q = acInt / p;
          if (p + q === bInt) {
            foundP = p;
            foundQ = q;
            break;
          }
        }
      }

      if (foundP !== null && foundQ !== null) {
        steps.push({
          title: "Find Factors for Trinomial",
          explanation: `Find two numbers that multiply to $c = ${c.toTex()}$ and add to $b = ${b.toTex()}$: the numbers are $${foundP}$ and $${foundQ}$.`,
          math: `p = ${foundP}, \\quad q = ${foundQ} \\quad (p \\cdot q = ${acInt}, \\, p + q = ${bInt})`
        });

        const pSign = foundP < 0 ? `- ${Math.abs(foundP)}` : `+ ${foundP}`;
        const qSign = foundQ < 0 ? `- ${Math.abs(foundQ)}` : `+ ${foundQ}`;
        const factored = `(${v} ${pSign})(${v} ${qSign})`;

        steps.push({
          title: "Write in Factored Form",
          explanation: "Express the quadratic as the product of two binomials.",
          math: factored
        });

        return {
          expression: originalExpr,
          finalAnswer: factored,
          steps
        };
      }
    }
  }

  // Default fallback
  return {
    expression: originalExpr,
    finalAnswer: poly.toTex(),
    steps
  };
}

/**
 * Evaluate expression for variable value: e.g. 2x + 5 when x = 3 or 3x^2 - 2x + 1 when x = 4
 */
export function evaluateExpressionForVariable(baseExpr: string, varName: string, valStr: string, originalExpr: string): SolverResult {
  const steps: SolutionStep[] = [];

  // Normalize LaTeX fractions in valStr: e.g. \frac{1}{2} -> 1/2
  let cleanValStr = valStr.trim();
  const fracMatch = cleanValStr.match(/^(-?)\\frac\{(\d+)\}\{(\d+)\}$/);
  if (fracMatch) {
    cleanValStr = `${fracMatch[1] === '-' ? '-' : ''}${fracMatch[2]}/${fracMatch[3]}`;
  }
  const val = new Fraction(cleanValStr);

  const tokens = tokenize(baseExpr);
  const ast = new Parser(tokens).parse();
  const rawTex = nodeToTex(ast);

  steps.push({
    title: "Given Expression and Variable Value",
    explanation: `We are given the algebraic expression and the specific value to substitute for the variable $${varName}$:`,
    math: `${rawTex}, \\quad \\text{where } ${varName} = ${val.toTex()}`
  });

  const poly = astToPolynomial(ast, varName);
  const result = poly.evaluate(val);

  // Substitute variable value
  const valTex = val.toTex();
  const valWithParens = val.isNegative() || !val.isInteger() ? `\\left(${valTex}\\right)` : `(${valTex})`;
  const substitutedTex = rawTex.replaceAll(varName, valWithParens);

  steps.push({
    title: `Substitute ${varName} = ${valTex}`,
    explanation: `Replace every instance of the variable $${varName}$ with $${valWithParens}$:`,
    math: substitutedTex
  });

  // Intermediate order of operations breakdown
  const sortedDegs = Array.from(poly.terms.keys()).sort((a, b) => b - a);

  // Step A: Exponents (if any degree > 1)
  const powerDegs = sortedDegs.filter(d => d > 1);
  if (powerDegs.length > 0) {
    const powerCalculations = powerDegs.map(deg => {
      const pVal = val.pow(deg);
      return `${valWithParens}^{${deg}} = ${pVal.toTex()}`;
    });

    steps.push({
      title: "Evaluate Exponents (PEMDAS: E)",
      explanation: "Calculate any powers first before performing multiplication:",
      math: powerCalculations.join(', \\quad ')
    });
  }

  // Step B: Multiplications
  const nonConstDegs = sortedDegs.filter(d => d > 0);
  if (nonConstDegs.length > 0) {
    const multCalculations = nonConstDegs.map(deg => {
      const coeff = poly.terms.get(deg)!;
      const termVal = coeff.mul(val.pow(deg));
      const powVal = val.pow(deg);
      if (coeff.isOne()) {
        return `${powVal.toTex()}`;
      }
      return `${coeff.toTex()} \\cdot ${powVal.isNegative() || !powVal.isInteger() ? `\\left(${powVal.toTex()}\\right)` : `(${powVal.toTex()})`} = ${termVal.toTex()}`;
    });

    steps.push({
      title: "Perform Multiplication (PEMDAS: M)",
      explanation: "Multiply each coefficient by the evaluated variable term:",
      math: multCalculations.join(', \\quad ')
    });
  }

  // Step C: Addition & Subtraction
  steps.push({
    title: "Combine All Terms (PEMDAS: AS)",
    explanation: "Add and subtract the terms according to order of operations to obtain the final numerical value:",
    math: `= ${result.toTex()}`
  });

  return {
    expression: originalExpr,
    finalAnswer: result.toTex(),
    steps
  };
}

function astContainsSubtree(node: ASTNode, predicate: (n: ASTNode) => boolean): boolean {
  if (predicate(node)) return true;
  if (node.type === 'unary' || node.type === 'sqrt') {
    return astContainsSubtree(node.argument, predicate);
  }
  if (node.type === 'binary') {
    return astContainsSubtree(node.left, predicate) || astContainsSubtree(node.right, predicate);
  }
  return false;
}

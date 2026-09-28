import { Fraction } from './fraction';
import { Polynomial } from './polynomial';
import { tokenize, Parser, astToPolynomial, nodeToTex, findVariables, ASTNode } from './ast';
import { SolutionStep, SolverResult } from './equationSolver';

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

  // Check for "for x = 3" or "where x = 3"
  const evalMatch = cleanInput.match(/(.*?)(?:\s+for\s+|\s+where\s+|\s*,\s*)([a-zA-Z])\s*=\s*(-?\d+(?:\.\d+)?)/i);
  if (evalMatch) {
    const baseExpr = evalMatch[1].trim();
    const varName = evalMatch[2];
    const varValStr = evalMatch[3];
    return evaluateExpressionForVariable(baseExpr, varName, varValStr, exprStr);
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
 * Evaluate expression for variable value: e.g. 2x + 5 for x = 3
 */
function evaluateExpressionForVariable(baseExpr: string, varName: string, valStr: string, originalExpr: string): SolverResult {
  const steps: SolutionStep[] = [];
  const val = new Fraction(valStr);

  const tokens = tokenize(baseExpr);
  const ast = new Parser(tokens).parse();
  const rawTex = nodeToTex(ast);

  steps.push({
    title: "Given Expression and Variable Value",
    explanation: `Evaluate the expression at $${varName} = ${val.toTex()}$.`,
    math: `${rawTex}, \\quad ${varName} = ${val.toTex()}`
  });

  const poly = astToPolynomial(ast, varName);
  const result = poly.evaluate(val);

  steps.push({
    title: "Substitute Variable Value",
    explanation: `Replace every instance of $${varName}$ with $(${val.toTex()})$.`,
    math: `${rawTex.replaceAll(varName, `(${val.toTex()})`)}`
  });

  steps.push({
    title: "Calculate Final Result",
    explanation: "Perform arithmetic according to order of operations.",
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

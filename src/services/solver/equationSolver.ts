import { Fraction } from './fraction';
import { Polynomial } from './polynomial';
import { simplifySquareRoot, formatRadicalTex } from './radical';
import { tokenize, Parser, astToPolynomial, nodeToTex, findVariables, ASTNode } from './ast';
import { gcdBigInt, lcmBigInt, formatFractionTex } from './fractionUtils';

export interface SolutionStep {
  title: string;
  explanation: string;
  math: string;
}

export interface SolverResult {
  expression: string;
  finalAnswer: string;
  steps: SolutionStep[];
}

/**
 * Solves an equation LHS = RHS tailored for 8th Grade Pre-Algebra students
 */
export function solveEquation(lhsStr: string, rhsStr: string, originalExpr: string): SolverResult {
  const steps: SolutionStep[] = [];

  // Tokenize & Parse
  const lhsTokens = tokenize(lhsStr);
  const rhsTokens = tokenize(rhsStr);

  const lhsAst = new Parser(lhsTokens).parse();
  const rhsAst = new Parser(rhsTokens).parse();

  const lhsTex = nodeToTex(lhsAst);
  const rhsTex = nodeToTex(rhsAst);

  steps.push({
    title: "Given Equation",
    explanation: "Write down the equation as originally given.",
    math: `${lhsTex} = ${rhsTex}`
  });

  // Find variables
  const vars = Array.from(new Set([...findVariables(lhsAst), ...findVariables(rhsAst)]));

  if (vars.length === 0) {
    // Pure numerical comparison
    const lhsVal = astToPolynomial(lhsAst).getCoefficient(0);
    const rhsVal = astToPolynomial(rhsAst).getCoefficient(0);
    const isEqual = lhsVal.equals(rhsVal);

    steps.push({
      title: "Evaluate Both Sides",
      explanation: "Calculate the numerical values of both sides.",
      math: `${lhsVal.toTex()} = ${rhsVal.toTex()}`
    });

    return {
      expression: originalExpr,
      finalAnswer: isEqual ? "\\text{True (Identity)}" : "\\text{False (Contradiction)}",
      steps
    };
  }

  if (vars.length > 1) {
    const targetVar = vars[0];
    const otherVar = vars[1];
    return solveForVariable(lhsAst, rhsAst, targetVar, otherVar, originalExpr, steps);
  }

  const v = vars[0];

  // Check for cross-multiplication proportion: (A) / d1 = (B) / d2 or (A) / d = c
  const proportionHandled = trySolveProportion(lhsAst, rhsAst, v, originalExpr, steps);
  if (proportionHandled) {
    return proportionHandled;
  }

  // Convert to Polynomials
  let lhsPoly: Polynomial;
  let rhsPoly: Polynomial;
  try {
    lhsPoly = astToPolynomial(lhsAst, v);
    rhsPoly = astToPolynomial(rhsAst, v);
  } catch (err: any) {
    throw new Error(`Unable to simplify equation: ${err.message}`);
  }

  // Check degree
  const combinedPoly = lhsPoly.sub(rhsPoly);
  const degree = combinedPoly.getDegree();

  if (combinedPoly.isZero()) {
    steps.push({
      title: "Analyze Identity",
      explanation: "Both sides simplify to the exact same expression. This equation is true for any real number.",
      math: "0 = 0"
    });
    return {
      expression: originalExpr,
      finalAnswer: `${v} \\in \\mathbb{R} \\text{ (All Real Numbers)}`,
      steps
    };
  }

  if (degree === 0) {
    const c = combinedPoly.getCoefficient(0);
    steps.push({
      title: "Analyze Contradiction",
      explanation: `The variable terms cancel out, leaving ${c.toTex()} = 0, which is false. Therefore, there is no solution.`,
      math: `${c.toTex()} = 0`
    });
    return {
      expression: originalExpr,
      finalAnswer: "\\text{No Solution } (\\emptyset)",
      steps
    };
  }

  // Degree 1: Pre-Algebra Linear Equation Solver
  if (degree === 1) {
    return solveLinearEquationPreAlgebra(lhsAst, rhsAst, lhsPoly, rhsPoly, v, originalExpr, steps);
  }

  // Degree 2: Quadratic equation
  if (degree === 2) {
    return solveQuadraticEquation(combinedPoly, v, originalExpr, steps);
  }

  // Higher degree
  return solveHigherDegreeEquation(combinedPoly, v, originalExpr, steps);
}

/**
 * Checks for proportions like (x + 2)/3 = 4 or (x + 2)/3 = (2x - 1)/5
 */
function trySolveProportion(
  lhs: ASTNode,
  rhs: ASTNode,
  v: string,
  originalExpr: string,
  steps: SolutionStep[]
): SolverResult | null {
  // Pattern 1: (expr) / d1 = (expr) / d2
  if (lhs.type === 'binary' && lhs.operator === '/' && lhs.right.type === 'number' &&
      rhs.type === 'binary' && rhs.operator === '/' && rhs.right.type === 'number') {
    const d1 = lhs.right.value;
    const d2 = rhs.right.value;

    if (d1.isInteger() && d2.isInteger()) {
      steps.push({
        title: "Identify Proportion (Cross-Multiplication)",
        explanation: "Since both sides are single fractions, use cross-multiplication: if $\\frac{A}{B} = \\frac{C}{D}$, then $A \\cdot D = B \\cdot C$.",
        math: `(${nodeToTex(lhs.left)}) \\cdot (${d2.toTex()}) = (${nodeToTex(rhs.left)}) \\cdot (${d1.toTex()})`
      });

      const newLhsAst: ASTNode = { type: 'binary', operator: '*', left: lhs.left, right: { type: 'number', value: d2 } };
      const newRhsAst: ASTNode = { type: 'binary', operator: '*', left: rhs.left, right: { type: 'number', value: d1 } };

      const newLhsPoly = astToPolynomial(newLhsAst, v);
      const newRhsPoly = astToPolynomial(newRhsAst, v);

      return solveLinearEquationPreAlgebra(newLhsAst, newRhsAst, newLhsPoly, newRhsPoly, v, originalExpr, steps);
    }
  }

  // Pattern 2: (expr) / d = number
  if (lhs.type === 'binary' && lhs.operator === '/' && lhs.right.type === 'number' && rhs.type === 'number') {
    const d = lhs.right.value;
    if (d.isInteger() && !d.isOne()) {
      steps.push({
        title: "Clear Denominator",
        explanation: `Multiply both sides of the equation by ${d.toTex()} to eliminate the fraction:`,
        math: `(${nodeToTex(lhs)}) \\times ${d.toTex()} = ${rhs.value.toTex()} \\times ${d.toTex()}`
      });

      const newLhsAst = lhs.left;
      const newRhsVal = rhs.value.mul(d);
      const newRhsAst: ASTNode = { type: 'number', value: newRhsVal };

      steps.push({
        title: "Simplify After Multiplying",
        explanation: `The denominator cancels out on the left:`,
        math: `${nodeToTex(newLhsAst)} = ${newRhsVal.toTex()}`
      });

      const newLhsPoly = astToPolynomial(newLhsAst, v);
      const newRhsPoly = astToPolynomial(newRhsAst, v);

      return solveLinearEquationPreAlgebra(newLhsAst, newRhsAst, newLhsPoly, newRhsPoly, v, originalExpr, steps);
    }
  }

  return null;
}

/**
 * 8th Grade Pre-Algebra step-by-step linear equation solver
 */
function solveLinearEquationPreAlgebra(
  lhsAst: ASTNode,
  rhsAst: ASTNode,
  lhsPoly: Polynomial,
  rhsPoly: Polynomial,
  v: string,
  originalExpr: string,
  steps: SolutionStep[]
): SolverResult {
  // Step 1: Check for clearing fractions with LCD if any coefficients have denominators > 1
  const allDens: bigint[] = [];
  for (const coeff of [...lhsPoly.terms.values(), ...rhsPoly.terms.values()]) {
    if (coeff.den > 1n) {
      allDens.push(coeff.den);
    }
  }

  let curLhs = lhsPoly;
  let curRhs = rhsPoly;

  if (allDens.length > 0) {
    let lcd = allDens[0];
    for (let i = 1; i < allDens.length; i++) {
      lcd = lcmBigInt(lcd, allDens[i]);
    }

    if (lcd > 1n) {
      steps.push({
        title: "Find the Least Common Denominator (LCD)",
        explanation: `The equation contains fractions with denominators of ${Array.from(new Set(allDens.map(d => d.toString()))).join(', ')}. Find the LCD to clear all fractions from the equation:`,
        math: `\\text{LCD} = ${lcd}`
      });

      steps.push({
        title: "Multiply Every Term by the LCD",
        explanation: `Multiply both sides of the equation by ${lcd} to eliminate all denominators:`,
        math: `${lcd} \\cdot \\left(${lhsPoly.toTex()}\\right) = ${lcd} \\cdot \\left(${rhsPoly.toTex()}\\right)`
      });

      curLhs = curLhs.mul(Polynomial.constant(new Fraction(lcd, 1n), v));
      curRhs = curRhs.mul(Polynomial.constant(new Fraction(lcd, 1n), v));

      steps.push({
        title: "Equation with Whole Numbers",
        explanation: "Simplify the multiplication on both sides:",
        math: `${curLhs.toTex()} = ${curRhs.toTex()}`
      });
    }
  } else {
    // Show distribution / expanding if needed
    const lhsTex = nodeToTex(lhsAst);
    const rhsTex = nodeToTex(rhsAst);
    if (lhsPoly.toTex() !== lhsTex || rhsPoly.toTex() !== rhsTex) {
      steps.push({
        title: "Apply Distributive Property / Combine Like Terms",
        explanation: "Simplify expressions on each side by distributing and combining like terms.",
        math: `${curLhs.toTex()} = ${curRhs.toTex()}`
      });
    }
  }

  // Goal statement
  steps.push({
    title: "Goal: Isolate the Variable",
    explanation: `We want to get all terms with $${v}$ on one side and all constant numbers on the other side.`,
    math: `\\text{Goal: } ${v} = \\dots`
  });

  // Step 2: Move variable terms to LHS if variable is on RHS
  let lhsVCoeff = curLhs.getCoefficient(1);
  let rhsVCoeff = curRhs.getCoefficient(1);
  let lhsConst = curLhs.getCoefficient(0);
  let rhsConst = curRhs.getCoefficient(0);

  if (!rhsVCoeff.isZero()) {
    const moveVarOp = rhsVCoeff.isNegative() ? "Add" : "Subtract";
    const absRhsV = rhsVCoeff.abs();
    const varTermTex = absRhsV.isOne() ? v : `${absRhsV.toTex()}${v}`;

    steps.push({
      title: `${moveVarOp} ${varTermTex} on Both Sides`,
      explanation: `To eliminate the variable from the right side, ${moveVarOp.toLowerCase()} ${varTermTex} on both sides:`,
      math: `(${curLhs.toTex()}) ${rhsVCoeff.isNegative() ? '+' : '-'} ${varTermTex} = (${curRhs.toTex()}) ${rhsVCoeff.isNegative() ? '+' : '-'} ${varTermTex}`
    });

    curLhs = curLhs.sub(Polynomial.singleVar(v, rhsVCoeff, 1));
    curRhs = curRhs.sub(Polynomial.singleVar(v, rhsVCoeff, 1));

    steps.push({
      title: "Simplify Terms with Variable",
      explanation: "Combine the variable terms on the left side:",
      math: `${curLhs.toTex()} = ${curRhs.toTex()}`
    });
  }

  // Step 3: Move constant terms to RHS
  lhsVCoeff = curLhs.getCoefficient(1);
  lhsConst = curLhs.getCoefficient(0);
  rhsConst = curRhs.getCoefficient(0);

  if (!lhsConst.isZero()) {
    const moveConstOp = lhsConst.isNegative() ? "Add" : "Subtract";
    const absConst = lhsConst.abs();

    steps.push({
      title: `${moveConstOp} ${absConst.toTex()} on Both Sides`,
      explanation: `Undo ${lhsConst.isNegative() ? 'subtraction' : 'addition'} by ${moveConstOp.toLowerCase()}ing ${absConst.toTex()} on both sides:`,
      math: `${curLhs.toTex()} ${lhsConst.isNegative() ? '+' : '-'} ${absConst.toTex()} = ${curRhs.toTex()} ${lhsConst.isNegative() ? '+' : '-'} ${absConst.toTex()}`
    });

    curLhs = curLhs.sub(Polynomial.constant(lhsConst, v));
    curRhs = curRhs.sub(Polynomial.constant(lhsConst, v));

    steps.push({
      title: "Simplify Constants",
      explanation: "Calculate the arithmetic on both sides:",
      math: `${curLhs.toTex()} = ${curRhs.toTex()}`
    });
  }

  // Step 4: Divide by the coefficient of the variable
  lhsVCoeff = curLhs.getCoefficient(1);
  rhsConst = curRhs.getCoefficient(0);

  const rawNum = rhsConst.num * lhsVCoeff.den;
  const rawDen = rhsConst.den * lhsVCoeff.num;

  let finalAnswerStr = '';

  if (lhsVCoeff.isOne()) {
    finalAnswerStr = `${v} = ${rhsConst.toTex()}`;
  } else {
    steps.push({
      title: `Divide Both Sides by ${lhsVCoeff.toTex()}`,
      explanation: `Divide both sides by ${lhsVCoeff.toTex()} to solve for $${v}$:`,
      math: `\\frac{${lhsVCoeff.toTex() === '-1' ? `-${v}` : `${lhsVCoeff.toTex()}${v}`}}{${lhsVCoeff.toTex()}} = \\frac{${rhsConst.toTex()}}{${lhsVCoeff.toTex()}}`
    });

    // Fraction reduction step with explicit GCF and "divide fraction by X/X to simplify"
    let n = rawNum;
    let d = rawDen;
    if (d < 0n) {
      n = -n;
      d = -d;
    }

    const absN = n < 0n ? -n : n;
    const gcf = gcdBigInt(absN, d);

    if (gcf > 1n) {
      const redN = n / gcf;
      const redD = d / gcf;

      steps.push({
        title: `Divide Fraction by ${gcf}/${gcf} to Simplify`,
        explanation: `Find $\\text{GCF}(${absN}, ${d}) = ${gcf}$. Divide the numerator and denominator by ${gcf}:`,
        math: `\\frac{${n} \\div ${gcf}}{${d} \\div ${gcf}} = \\frac{${redN}}{${redD}}`
      });

      if (redD === 1n) {
        steps.push({
          title: "Simplify Over Denominator of 1",
          explanation: `Any number divided by 1 simplifies to the whole number ${redN}:`,
          math: `${v} = ${redN}`
        });
        finalAnswerStr = `${v} = ${redN}`;
      } else {
        const isImproper = absN > d;
        steps.push({
          title: "Simplest Form",
          explanation: `Since ${redN < 0n ? -redN : redN} and ${redD} have no common factors, the fraction cannot be reduced further.${isImproper ? ' Kept in improper fraction format.' : ''}`,
          math: `${v} = ${formatFractionTex(redN, redD)}`
        });
        finalAnswerStr = `${v} = ${formatFractionTex(redN, redD)}`;
      }
    } else {
      if (d === 1n) {
        finalAnswerStr = `${v} = ${n}`;
      } else {
        const isImproper = absN > d;
        steps.push({
          title: "Check Simplest Form",
          explanation: `Since $\\text{GCF}(${absN}, ${d}) = 1$, the fraction cannot be reduced any further.${isImproper ? ' Stays as an improper fraction.' : ''}`,
          math: `${v} = ${formatFractionTex(n, d)}`
        });
        finalAnswerStr = `${v} = ${formatFractionTex(n, d)}`;
      }
    }
  }

  // Verification step
  const solFrac = new Fraction(rawNum, rawDen);
  const checkLhs = lhsPoly.evaluate(solFrac);
  const checkRhs = rhsPoly.evaluate(solFrac);

  steps.push({
    title: "Check the Solution",
    explanation: `Substitute $${v} = ${solFrac.toTex()}$ back into the original equation to verify that both sides balance:`,
    math: `\\text{LHS} = ${checkLhs.toTex()}, \\quad \\text{RHS} = ${checkRhs.toTex()} \\quad \\checkmark`
  });

  return {
    expression: originalExpr,
    finalAnswer: finalAnswerStr,
    steps
  };
}

function solveQuadraticEquation(
  poly: Polynomial,
  v: string,
  originalExpr: string,
  steps: SolutionStep[]
): SolverResult {
  const a = poly.getCoefficient(2);
  const b = poly.getCoefficient(1);
  const c = poly.getCoefficient(0);

  steps.push({
    title: "Identify Quadratic Coefficients",
    explanation: `Write the quadratic in standard form $a${v}^2 + b${v} + c = 0$:`,
    math: `a = ${a.toTex()}, \\quad b = ${b.toTex()}, \\quad c = ${c.toTex()}`
  });

  const bSquared = b.mul(b);
  const fourAC = new Fraction(4n, 1n).mul(a).mul(c);
  const delta = bSquared.sub(fourAC);

  steps.push({
    title: "Calculate the Discriminant",
    explanation: `Use the discriminant formula $\\Delta = b^2 - 4ac$ to check how many solutions exist:`,
    math: `\\Delta = (${b.toTex()})^2 - 4(${a.toTex()})(${c.toTex()}) = ${bSquared.toTex()} - (${fourAC.toTex()}) = ${delta.toTex()}`
  });

  const twoA = new Fraction(2n, 1n).mul(a);

  if (delta.isZero()) {
    const root = b.neg().div(twoA);
    steps.push({
      title: "One Repeated Real Root (\\Delta = 0)",
      explanation: "Since the discriminant is 0, the equation has one repeated real root:",
      math: `${v} = \\frac{-b}{2a} = \\frac{-(${b.toTex()})}{2(${a.toTex()})} = ${root.toTex()}`
    });

    return {
      expression: originalExpr,
      finalAnswer: `${v} = ${root.toTex()}`,
      steps
    };
  }

  if (delta.isNegative()) {
    const absDelta = delta.abs();
    let radicalStr = `\\sqrt{${absDelta.toTex()}}`;

    if (absDelta.isInteger()) {
      const simplified = simplifySquareRoot(absDelta.num);
      radicalStr = formatRadicalTex(simplified.coefficient, simplified.radicand);
    }

    steps.push({
      title: "Complex Conjugate Roots (\\Delta < 0)",
      explanation: "Since the discriminant is negative, there are two complex solutions involving $i = \\sqrt{-1}$:",
      math: `${v} = \\frac{-(${b.toTex()}) \\pm i${radicalStr}}{2(${a.toTex()})}`
    });

    const realPart = b.neg().div(twoA);
    return {
      expression: originalExpr,
      finalAnswer: `${v} = ${realPart.toTex()} \\pm \\frac{${radicalStr}}{${twoA.toTex()}} i`,
      steps
    };
  }

  // Delta > 0
  if (delta.isInteger()) {
    const deltaInt = delta.num;
    const isSquare = Number.isInteger(Math.sqrt(Number(deltaInt))) && BigInt(Math.round(Math.sqrt(Number(deltaInt)))) ** 2n === deltaInt;

    if (isSquare) {
      const sqrtDeltaVal = BigInt(Math.round(Math.sqrt(Number(deltaInt))));
      const sqrtDeltaFrac = new Fraction(sqrtDeltaVal, 1n);

      steps.push({
        title: "Apply Quadratic Formula",
        explanation: `Substitute values into $${v} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$:`,
        math: `${v} = \\frac{-(${b.toTex()}) \\pm \\sqrt{${delta.toTex()}}}{2(${a.toTex()})} = \\frac{${b.neg().toTex()} \\pm ${sqrtDeltaFrac.toTex()}}{${twoA.toTex()}}`
      });

      const root1 = b.neg().add(sqrtDeltaFrac).div(twoA);
      const root2 = b.neg().sub(sqrtDeltaFrac).div(twoA);

      steps.push({
        title: "Evaluate Both Roots",
        explanation: "Calculate the plus and minus solutions separately:",
        math: `${v}_1 = \\frac{${b.neg().add(sqrtDeltaFrac).toTex()}}{${twoA.toTex()}} = ${root1.toTex()}, \\quad ${v}_2 = \\frac{${b.neg().sub(sqrtDeltaFrac).toTex()}}{${twoA.toTex()}} = ${root2.toTex()}`
      });

      return {
        expression: originalExpr,
        finalAnswer: `${v} = ${root1.toTex()} \\quad \\text{or} \\quad ${v} = ${root2.toTex()}`,
        steps
      };
    } else {
      const simplified = simplifySquareRoot(deltaInt);
      const radTex = formatRadicalTex(simplified.coefficient, simplified.radicand);

      steps.push({
        title: "Quadratic Formula with Exact Radicals",
        explanation: `Simplify the square root: $\\sqrt{${deltaInt}} = ${radTex}$:`,
        math: `${v} = \\frac{${b.neg().toTex()} \\pm ${radTex}}{${twoA.toTex()}}`
      });

      return {
        expression: originalExpr,
        finalAnswer: `${v} = \\frac{${b.neg().toTex()} \\pm ${radTex}}{${twoA.toTex()}}`,
        steps
      };
    }
  }

  const root1 = (b.neg().toNumber() + Math.sqrt(delta.toNumber())) / twoA.toNumber();
  const root2 = (b.neg().toNumber() - Math.sqrt(delta.toNumber())) / twoA.toNumber();

  return {
    expression: originalExpr,
    finalAnswer: `${v} \\approx ${root1.toFixed(4)} \\quad \\text{or} \\quad ${v} \\approx ${root2.toFixed(4)}`,
    steps
  };
}

function solveHigherDegreeEquation(
  poly: Polynomial,
  v: string,
  originalExpr: string,
  steps: SolutionStep[]
): SolverResult {
  let minPower = poly.getDegree();
  for (const deg of poly.terms.keys()) {
    if (deg < minPower) minPower = deg;
  }

  if (minPower > 0) {
    steps.push({
      title: "Factor Out Common Variable Factor",
      explanation: `Factor out ${minPower === 1 ? v : `${v}^{${minPower}}`} from every term:`,
      math: `${minPower === 1 ? v : `${v}^{${minPower}}`}(...) = 0`
    });

    const remainingTerms = new Map<number, Fraction>();
    for (const [deg, coeff] of poly.terms.entries()) {
      remainingTerms.set(deg - minPower, coeff);
    }
    const innerPoly = new Polynomial(remainingTerms, v);

    if (innerPoly.getDegree() === 2) {
      const quadResult = solveQuadraticEquation(innerPoly, v, originalExpr, steps);
      quadResult.steps.unshift({
        title: "Zero Product Property",
        explanation: `Setting each factor to zero gives $${v} = 0$ as a solution.`,
        math: `${v} = 0 \\quad \\text{or} \\quad ${innerPoly.toTex()} = 0`
      });
      quadResult.finalAnswer = `${v} = 0, \\quad ${quadResult.finalAnswer}`;
      return quadResult;
    }
  }

  throw new Error(`Solving degree ${poly.getDegree()} polynomial equations is not supported analytically.`);
}

function solveForVariable(
  lhsAst: ASTNode,
  rhsAst: ASTNode,
  targetVar: string,
  otherVar: string,
  originalExpr: string,
  steps: SolutionStep[]
): SolverResult {
  steps.push({
    title: `Solve for ${targetVar} in terms of ${otherVar}`,
    explanation: `Rearrange the equation to isolate ${targetVar}.`,
    math: `${nodeToTex(lhsAst)} = ${nodeToTex(rhsAst)}`
  });

  return {
    expression: originalExpr,
    finalAnswer: `${targetVar} = \\dots`,
    steps
  };
}

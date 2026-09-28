import { SolutionStep, SolverResult } from './equationSolver';
import { gcdBigInt, lcmBigInt, formatFractionTex } from './fractionUtils';

/**
 * Handles 8th grade pre-algebra fraction reduction, operations, and algebraic fractions.
 */

export function normalizeFractionInput(input: string): string {
  let s = input.trim();
  while (s.startsWith('(') && s.endsWith(')')) {
    let depth = 0;
    let matched = true;
    for (let i = 0; i < s.length - 1; i++) {
      if (s[i] === '(') depth++;
      else if (s[i] === ')') depth--;
      if (depth === 0) {
        matched = false;
        break;
      }
    }
    if (matched) s = s.slice(1, -1).trim();
    else break;
  }
  // If in format "(A) / (B)" where A is a simple monomial or number
  const m = s.match(/^\(?\s*(-?\d*[a-zA-Z]?|-?\d+)\s*\)?\s*\/\s*\(?\s*(-?\d+)\s*\)?$/);
  if (m) {
    return `${m[1].trim()}/${m[2].trim()}`;
  }
  return s;
}

export function isFractionReductionInput(input: string): boolean {
  const clean = normalizeFractionInput(input);
  // Single numerical fraction: e.g. "10/2", "11/3", "-12/8"
  if (/^-?\d+\s*\/\s*-?\d+$/.test(clean)) return true;
  // Single algebraic fraction: e.g. "3x/6", "4x/2", "x/6", "-2y/4"
  if (/^-?\d*[a-zA-Z]\s*\/\s*-?\d+$/.test(clean)) return true;
  // Polynomial over number: e.g. "(6x + 9)/3" or "(4x - 8)/2"
  if (/^\(?\s*-?\d*[a-zA-Z]\s*[+-]\s*\d+\s*\)?\s*\/\s*-?\d+$/.test(clean)) return true;
  return false;
}

export function isFractionArithmeticInput(input: string): boolean {
  const clean = input.trim();
  if (clean.includes('=')) return false;
  return /^\(?\s*-?\d+\s*\/\s*\d+\s*\)?\s*([+\-*×•/÷])\s*\(?\s*-?\d+\s*\/\s*\d+\s*\)?$/.test(clean);
}

/**
 * Solves single fraction reduction step-by-step
 */
export function reduceSingleFraction(input: string): SolverResult {
  const clean = normalizeFractionInput(input);
  const steps: SolutionStep[] = [];

  // Case A: Algebraic fraction with polynomial numerator: e.g. (6x + 9)/3 or (4x - 8)/2
  const polyMatch = clean.match(/^\(?\s*(-?\d*)([a-zA-Z])\s*([+-])\s*(\d+)\s*\)?\s*\/\s*(-?\d+)$/);
  if (polyMatch) {
    return reduceLinearPolynomialFraction(polyMatch, clean);
  }

  // Case B: Simple algebraic fraction: e.g. 3x/6, 4x/8, -2x/4, x/6
  const algMatch = clean.match(/^(-?\d*)([a-zA-Z])\s*\/\s*(-?\d+)$/);
  if (algMatch) {
    const rawCoeff = algMatch[1];
    const variable = algMatch[2];
    const rawDen = algMatch[3];

    let numCoeff = rawCoeff === '' ? 1n : rawCoeff === '-' ? -1n : BigInt(rawCoeff);
    let den = BigInt(rawDen);

    if (den === 0n) throw new Error("Division by zero in fraction");

    if (den < 0n) {
      numCoeff = -numCoeff;
      den = -den;
    }

    const origTex = `\\frac{${numCoeff === 1n ? variable : numCoeff === -1n ? `-${variable}` : `${numCoeff}${variable}`}}{${den}}`;

    steps.push({
      title: "Given Algebraic Fraction",
      explanation: "Write down the fraction to simplify.",
      math: origTex
    });

    const gcf = gcdBigInt(numCoeff < 0n ? -numCoeff : numCoeff, den);

    steps.push({
      title: "Find the Greatest Common Factor (GCF)",
      explanation: `Find the largest number that divides evenly into both the coefficient $${numCoeff < 0n ? -numCoeff : numCoeff}$ and the denominator $${den}$.`,
      math: `\\text{GCF}(${numCoeff < 0n ? -numCoeff : numCoeff}, ${den}) = ${gcf}`
    });

    if (gcf > 1n) {
      const redCoeff = numCoeff / gcf;
      const redDen = den / gcf;

      steps.push({
        title: `Divide Fraction by ${gcf}/${gcf} to Simplify`,
        explanation: `Divide both the numerator and the denominator by their common factor of ${gcf} to reduce the fraction to simplest form:`,
        math: `\\frac{${numCoeff}${variable} \\div ${gcf}}{${den} \\div ${gcf}} = \\frac{${redCoeff === 1n ? variable : redCoeff === -1n ? `-${variable}` : `${redCoeff}${variable}`}}{${redDen}}`
      });

      if (redDen === 1n) {
        const wholeAnswer = redCoeff === 1n ? variable : redCoeff === -1n ? `-${variable}` : `${redCoeff}${variable}`;
        steps.push({
          title: "Simplify Over Denominator of 1",
          explanation: "Any quantity divided by 1 is equal to itself.",
          math: `\\frac{${wholeAnswer}}{1} = ${wholeAnswer}`
        });

        return {
          expression: clean,
          finalAnswer: wholeAnswer,
          steps
        };
      } else {
        const finalAns = `\\frac{${redCoeff === 1n ? variable : redCoeff === -1n ? `-${variable}` : `${redCoeff}${variable}`}}{${redDen}}`;
        steps.push({
          title: "Check Simplest Form",
          explanation: `Since ${redCoeff < 0n ? -redCoeff : redCoeff} and ${redDen} share no common factors other than 1, the fraction is in simplest form.`,
          math: finalAns
        });

        return {
          expression: clean,
          finalAnswer: finalAns,
          steps
        };
      }
    } else {
      steps.push({
        title: "Already in Simplest Form",
        explanation: `Since the GCF is 1, the coefficient ${numCoeff} and denominator ${den} share no common factors other than 1. This fraction cannot be reduced any further.`,
        math: origTex
      });

      return {
        expression: clean,
        finalAnswer: origTex,
        steps
      };
    }
  }

  // Case C: Standard numerical fraction: e.g. 10/2, 11/3, 12/8
  const numMatch = clean.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
  if (!numMatch) {
    throw new Error("Invalid fraction format");
  }

  let num = BigInt(numMatch[1]);
  let den = BigInt(numMatch[2]);

  if (den === 0n) throw new Error("Division by zero in fraction");

  if (den < 0n) {
    num = -num;
    den = -den;
  }

  const origTex = formatFractionTex(num, den);

  steps.push({
    title: "Given Fraction",
    explanation: "Identify the numerator and the denominator of the fraction.",
    math: `\\text{Numerator} = ${num}, \\quad \\text{Denominator} = ${den} \\implies ${origTex}`
  });

  const absNum = num < 0n ? -num : num;
  const gcf = gcdBigInt(absNum, den);

  steps.push({
    title: "Find the Greatest Common Factor (GCF)",
    explanation: `Find the largest whole number that divides evenly into both ${absNum} and ${den}:`,
    math: `\\text{GCF}(${absNum}, ${den}) = ${gcf}`
  });

  if (gcf > 1n) {
    const redNum = num / gcf;
    const redDen = den / gcf;

    steps.push({
      title: `Divide Fraction by ${gcf}/${gcf} to Simplify`,
      explanation: `Divide both the numerator and the denominator by ${gcf} to reduce to lowest terms:`,
      math: `\\frac{${num} \\div ${gcf}}{${den} \\div ${gcf}} = \\frac{${redNum}}{${redDen}}`
    });

    if (redDen === 1n) {
      steps.push({
        title: "Simplify Over Denominator of 1",
        explanation: `Since the denominator is 1, any number over 1 simplifies to the whole number ${redNum}:`,
        math: `\\frac{${redNum}}{1} = ${redNum}`
      });

      return {
        expression: clean,
        finalAnswer: redNum.toString(),
        steps
      };
    } else {
      const isImproper = (redNum < 0n ? -redNum : redNum) > redDen;
      steps.push({
        title: "Check Simplest Form",
        explanation: `Since ${redNum < 0n ? -redNum : redNum} and ${redDen} have no common factors other than 1, the fraction cannot be reduced any further.${isImproper ? ' Kept in standard improper fraction format.' : ''}`,
        math: formatFractionTex(redNum, redDen)
      });

      return {
        expression: clean,
        finalAnswer: formatFractionTex(redNum, redDen),
        steps
      };
    }
  } else {
    // Cannot be reduced (like 11/3)
    const isImproper = absNum > den;
    steps.push({
      title: "Check for Common Factors",
      explanation: `Since the greatest common factor is 1, ${absNum} and ${den} have no common factors to cancel.`,
      math: `\\text{GCF}(${absNum}, ${den}) = 1`
    });

    steps.push({
      title: "Fraction Cannot Be Reduced",
      explanation: `The fraction is already in lowest terms. ${isImproper ? 'In pre-algebra, improper fractions are preferred over mixed numbers when the fraction is greater than 1.' : ''}`,
      math: origTex
    });

    return {
      expression: clean,
      finalAnswer: origTex,
      steps
    };
  }
}

function reduceLinearPolynomialFraction(match: RegExpMatchArray, originalExpr: string): SolverResult {
  const steps: SolutionStep[] = [];
  const rawA = match[1];
  const variable = match[2];
  const op = match[3];
  const rawB = match[4];
  const rawDen = match[5];

  let a = rawA === '' ? 1n : rawA === '-' ? -1n : BigInt(rawA);
  let b = BigInt(rawB);
  if (op === '-') b = -b;
  let den = BigInt(rawDen);

  if (den === 0n) throw new Error("Division by zero in fraction");

  if (den < 0n) {
    a = -a;
    b = -b;
    den = -den;
  }

  const numTex = `${a === 1n ? variable : a === -1n ? `-${variable}` : `${a}${variable}`} ${b < 0n ? `- ${-b}` : `+ ${b}`}`;
  const origTex = `\\frac{${numTex}}{${den}}`;

  steps.push({
    title: "Given Algebraic Fraction",
    explanation: "Write down the algebraic fraction to simplify.",
    math: origTex
  });

  const numGcf = gcdBigInt(a < 0n ? -a : a, b < 0n ? -b : b);
  const commonFactor = gcdBigInt(numGcf, den);

  if (commonFactor > 1n) {
    const factoredA = a / commonFactor;
    const factoredB = b / commonFactor;
    const factoredDen = den / commonFactor;

    steps.push({
      title: `Factor Out Common Factor from Numerator`,
      explanation: `Factor out ${commonFactor} from both terms in the numerator:`,
      math: `${numTex} = ${commonFactor}\\left(${factoredA === 1n ? variable : factoredA === -1n ? `-${variable}` : `${factoredA}${variable}`} ${factoredB < 0n ? `- ${-factoredB}` : `+ ${factoredB}`}\\right)`
    });

    steps.push({
      title: `Divide Fraction by ${commonFactor}/${commonFactor} to Simplify`,
      explanation: `Divide numerator and denominator by the common factor ${commonFactor}:`,
      math: `\\frac{${commonFactor}\\left(${factoredA === 1n ? variable : `${factoredA}${variable}`} ${factoredB < 0n ? `- ${-factoredB}` : `+ ${factoredB}`}\\right) \\div ${commonFactor}}{${den} \\div ${commonFactor}}`
    });

    const simplifiedNum = `${factoredA === 1n ? variable : factoredA === -1n ? `-${variable}` : `${factoredA}${variable}`} ${factoredB < 0n ? `- ${-factoredB}` : `+ ${factoredB}`}`;

    if (factoredDen === 1n) {
      steps.push({
        title: "Simplify Over Denominator of 1",
        explanation: "Since the denominator is 1, write as a regular polynomial expression.",
        math: simplifiedNum
      });
      return {
        expression: originalExpr,
        finalAnswer: simplifiedNum,
        steps
      };
    } else {
      const finalTex = `\\frac{${simplifiedNum}}{${factoredDen}}`;
      return {
        expression: originalExpr,
        finalAnswer: finalTex,
        steps
      };
    }
  } else {
    steps.push({
      title: "Check for Common Factors",
      explanation: `The terms in the numerator and denominator share no common factor greater than 1. This fraction cannot be reduced further.`,
      math: origTex
    });
    return {
      expression: originalExpr,
      finalAnswer: origTex,
      steps
    };
  }
}

/**
 * Solves fraction arithmetic (Addition/Subtraction with LCD, Multiplication, Division)
 */
export function solveFractionArithmetic(input: string): SolverResult {
  const clean = input.trim();
  const match = clean.match(/^\(?\s*(-?\d+)\s*\/\s*(\d+)\s*\)?\s*([+\-*×•/÷])\s*\(?\s*(-?\d+)\s*\/\s*(\d+)\s*\)?$/);
  if (!match) {
    throw new Error("Invalid fraction arithmetic format");
  }

  const steps: SolutionStep[] = [];
  const n1 = BigInt(match[1]);
  const d1 = BigInt(match[2]);
  let op = match[3];
  const n2 = BigInt(match[4]);
  const d2 = BigInt(match[5]);

  if (d1 === 0n || d2 === 0n) throw new Error("Denominator cannot be 0");

  if (op === '×' || op === '•') op = '*';
  if (op === '÷') op = '/';

  const f1Tex = formatFractionTex(n1, d1);
  const f2Tex = formatFractionTex(n2, d2);
  const opSymbol = op === '*' ? '\\cdot' : op === '/' ? '\\div' : op;

  steps.push({
    title: "Given Fraction Expression",
    explanation: "Identify the two fractions and the operation to perform.",
    math: `${f1Tex} ${opSymbol} ${f2Tex}`
  });

  // Addition & Subtraction with LCD
  if (op === '+' || op === '-') {
    return solveFractionAddSub(n1, d1, op as '+' | '-', n2, d2, clean, steps);
  }

  // Multiplication
  if (op === '*') {
    return solveFractionMultiplication(n1, d1, n2, d2, clean, steps);
  }

  // Division
  return solveFractionDivision(n1, d1, n2, d2, clean, steps);
}

function solveFractionAddSub(
  n1: bigint,
  d1: bigint,
  op: '+' | '-',
  n2: bigint,
  d2: bigint,
  originalExpr: string,
  steps: SolutionStep[]
): SolverResult {
  if (d1 === d2) {
    // Like denominators
    steps.push({
      title: "Common Denominators Already Present",
      explanation: `Both fractions already share the same denominator ($${d1}$). Combine the numerators directly over $${d1}$.`,
      math: `\\frac{${n1} ${op} ${n2 < 0n ? `(${n2})` : n2}}{${d1}}`
    });

    const combinedNum = op === '+' ? n1 + n2 : n1 - n2;
    steps.push({
      title: `Perform ${op === '+' ? 'Addition' : 'Subtraction'} in Numerator`,
      explanation: `${n1} ${op} ${n2} = ${combinedNum}.`,
      math: `\\frac{${combinedNum}}{${d1}}`
    });

    return finalizeFractionReduction(combinedNum, d1, originalExpr, steps);
  }

  // Unlike denominators: Need LCD
  const lcd = lcmBigInt(d1, d2);
  steps.push({
    title: "Find the Least Common Denominator (LCD)",
    explanation: `Since the denominators $${d1}$ and $${d2}$ are different, find their least common multiple (LCD) to make them match:`,
    math: `\\text{LCD}(${d1}, ${d2}) = ${lcd}`
  });

  const m1 = lcd / d1;
  const m2 = lcd / d2;

  const newN1 = n1 * m1;
  const newN2 = n2 * m2;

  steps.push({
    title: "Convert to Equivalent Fractions with the LCD",
    explanation: `Multiply the first fraction by $\\frac{${m1}}{${m1}}$ and the second fraction by $\\frac{${m2}}{${m2}}$:`,
    math: `\\frac{${n1} \\times ${m1}}{${d1} \\times ${m1}} = \\frac{${newN1}}{${lcd}}, \\quad \\frac{${n2} \\times ${m2}}{${d2} \\times ${m2}} = \\frac{${newN2}}{${lcd}}`
  });

  steps.push({
    title: `Combine Numerators Over the Common Denominator`,
    explanation: `Now that the denominators are equal, ${op === '+' ? 'add' : 'subtract'} the numerators:`,
    math: `\\frac{${newN1} ${op} ${newN2 < 0n ? `(${newN2})` : newN2}}{${lcd}}`
  });

  const combinedNum = op === '+' ? newN1 + newN2 : newN1 - newN2;
  steps.push({
    title: `Calculate Combined Numerator`,
    explanation: `${newN1} ${op} ${newN2} = ${combinedNum}.`,
    math: `\\frac{${combinedNum}}{${lcd}}`
  });

  return finalizeFractionReduction(combinedNum, lcd, originalExpr, steps);
}

function solveFractionMultiplication(
  n1: bigint,
  d1: bigint,
  n2: bigint,
  d2: bigint,
  originalExpr: string,
  steps: SolutionStep[]
): SolverResult {
  steps.push({
    title: "Multiply Numerators and Denominators",
    explanation: "To multiply fractions, multiply the top numbers together and bottom numbers together:",
    math: `\\frac{${n1} \\times ${n2}}{${d1} \\times ${d2}}`
  });

  const prodNum = n1 * n2;
  const prodDen = d1 * d2;

  steps.push({
    title: "Calculate Products",
    explanation: `${n1} \\times ${n2} = ${prodNum} \\quad \\text{and} \\quad ${d1} \\times ${d2} = ${prodDen}.`,
    math: `\\frac{${prodNum}}{${prodDen}}`
  });

  return finalizeFractionReduction(prodNum, prodDen, originalExpr, steps);
}

function solveFractionDivision(
  n1: bigint,
  d1: bigint,
  n2: bigint,
  d2: bigint,
  originalExpr: string,
  steps: SolutionStep[]
): SolverResult {
  if (n2 === 0n) throw new Error("Cannot divide by 0");

  steps.push({
    title: "Keep, Change, Flip (Multiply by Reciprocal)",
    explanation: `To divide by a fraction, keep the first fraction, change division to multiplication, and flip the second fraction:`,
    math: `\\frac{${n1}}{${d1}} \\div \\frac{${n2}}{${d2}} = \\frac{${n1}}{${d1}} \\times \\frac{${d2}}{${n2}}`
  });

  const prodNum = n1 * d2;
  const prodDen = d1 * n2;

  steps.push({
    title: "Multiply Straight Across",
    explanation: `Multiply the numerators (${n1} \\times ${d2} = ${prodNum}) and denominators (${d1} \\times ${n2} = ${prodDen}):`,
    math: `\\frac{${prodNum}}{${prodDen}}`
  });

  return finalizeFractionReduction(prodNum, prodDen, originalExpr, steps);
}

function finalizeFractionReduction(
  num: bigint,
  den: bigint,
  originalExpr: string,
  steps: SolutionStep[]
): SolverResult {
  let n = num;
  let d = den;

  if (d < 0n) {
    n = -n;
    d = -d;
  }

  if (n === 0n) {
    steps.push({
      title: "Evaluate Zero Numerator",
      explanation: "Zero divided by any non-zero number is 0.",
      math: "0"
    });
    return {
      expression: originalExpr,
      finalAnswer: "0",
      steps
    };
  }

  const absN = n < 0n ? -n : n;
  const gcf = gcdBigInt(absN, d);

  if (gcf > 1n) {
    const redN = n / gcf;
    const redD = d / gcf;

    steps.push({
      title: "Find Greatest Common Factor (GCF)",
      explanation: `Find $\\text{GCF}(${absN}, ${d}) = ${gcf}$ to simplify the fraction.`,
      math: `\\text{GCF}(${absN}, ${d}) = ${gcf}`
    });

    steps.push({
      title: `Divide Fraction by ${gcf}/${gcf} to Simplify`,
      explanation: `Divide numerator and denominator by their greatest common factor of ${gcf}:`,
      math: `\\frac{${n} \\div ${gcf}}{${d} \\div ${gcf}} = \\frac{${redN}}{${redD}}`
    });

    if (redD === 1n) {
      steps.push({
        title: "Simplify to Whole Number",
        explanation: `Any number with a denominator of 1 simplifies to the whole number ${redN}.`,
        math: `\\frac{${redN}}{1} = ${redN}`
      });
      return {
        expression: originalExpr,
        finalAnswer: redN.toString(),
        steps
      };
    } else {
      const isImproper = (redN < 0n ? -redN : redN) > redD;
      steps.push({
        title: "Simplest Form",
        explanation: `Since ${redN < 0n ? -redN : redN} and ${redD} have no remaining common factors, the fraction is in simplest form.${isImproper ? ' Kept in improper format.' : ''}`,
        math: formatFractionTex(redN, redD)
      });
      return {
        expression: originalExpr,
        finalAnswer: formatFractionTex(redN, redD),
        steps
      };
    }
  } else {
    if (d === 1n) {
      return {
        expression: originalExpr,
        finalAnswer: n.toString(),
        steps
      };
    }
    const isImproper = absN > d;
    steps.push({
      title: "Fraction Cannot Be Reduced Further",
      explanation: `The greatest common factor is 1, so the fraction is already in simplest form.${isImproper ? ' Kept in improper fraction format.' : ''}`,
      math: formatFractionTex(n, d)
    });
    return {
      expression: originalExpr,
      finalAnswer: formatFractionTex(n, d),
      steps
    };
  }
}

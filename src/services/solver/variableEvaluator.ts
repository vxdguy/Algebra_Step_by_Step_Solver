import { Fraction } from './fraction';
import { SolutionStep, SolverResult } from './equationSolver';
import { tokenize, Parser, nodeToTex, ASTNode, astToPolynomial } from './ast';
import { latexToAscii, toDisplayLatex } from './latexConverter';

export interface EvaluationRequest {
  expr: string;
  vars: Record<string, string>;
  rawLines?: string[];
}

/**
 * Parses variable evaluation requests where:
 * - Lines are separated by LaTeX newline indicator "\\" (ignoring any literal newline glyphs)
 * - Or separate lines via literal newlines
 * - Variables are defined on preceding lines: e.g. "x=24" or "x = 3" or "x=\frac{2y}{3}"
 * - Last line is the expression, optionally ending with "=": e.g. "2x+7" or "2x+7="
 * - Vertical bar notation is eliminated.
 * - Trailing "=" on the expression line is optional; "=" is implied.
 */
export function parseEvaluationRequest(raw: string): EvaluationRequest | null {
  let s = raw.trim();

  // Strip leading and trailing math mode delimiters
  s = s.replace(/^\$\$?/, '').replace(/\$\$?$/, '').trim();

  // Strip friendly prefixes like "evaluate" or "eval"
  s = s.replace(/^(evaluate|eval|calculate)\s+/i, '').trim();

  // Determine line splitting:
  // Prefer "\\" as the LaTeX newline indicator; any "\n" around it is ignored
  let rawLines: string[] = [];
  if (s.includes('\\\\')) {
    rawLines = s.split('\\\\').map(l => l.replace(/\r?\n/g, ' ').trim()).filter(Boolean);
  } else if (s.includes('\n')) {
    rawLines = s.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  }

  if (rawLines.length >= 2) {
    const vars: Record<string, string> = {};
    let allVars = true;

    for (let i = 0; i < rawLines.length - 1; i++) {
      const line = rawLines[i].trim();
      const m = line.match(/^([a-zA-Z])\s*=\s*(.*)$/);
      if (m) {
        vars[m[1]] = m[2].trim();
      } else {
        allVars = false;
        break;
      }
    }

    if (allVars && Object.keys(vars).length > 0) {
      let lastLine = rawLines[rawLines.length - 1].trim();
      // Remove trailing "=" on expression line if present (it is optional / implied)
      lastLine = lastLine.replace(/=\s*$/, '').trim();

      if (lastLine.length > 0) {
        return {
          expr: lastLine,
          vars,
          rawLines
        };
      }
    }
  }

  // Also support natural language fallback: e.g. "2x + 7 when x = 24" or "2x + 7 for x = 24"
  const kwMatch = s.match(/^([\s\S]*?)(?:\s+(?:when|for|where|with|at)\s+|[,;]\s*)([a-zA-Z])\s*=\s*(-?\d+(?:\.\d+)?|-?\d+\s*\/\s*\d+|-\s*\\frac\{\d+\}\{\d+\}|\\frac\{\d+\}\{\d+\})$/i);
  if (kwMatch && kwMatch[1].trim() && !kwMatch[1].includes('=')) {
    let expr = kwMatch[1].trim().replace(/=\s*$/, '').trim();
    return {
      expr,
      vars: { [kwMatch[2]]: kwMatch[3].trim() }
    };
  }

  return null;
}

/**
 * Extracts variable names referenced in an AST
 */
function getVarsFromAst(ast: ASTNode): Set<string> {
  const vars = new Set<string>();
  function walk(node: ASTNode) {
    if (node.type === 'variable') {
      vars.add(node.name);
    } else if (node.type === 'unary' || node.type === 'sqrt') {
      walk(node.argument);
    } else if (node.type === 'binary') {
      walk(node.left);
      walk(node.right);
    }
  }
  walk(ast);
  return vars;
}

/**
 * Evaluates AST with all variable values substituted
 */
function substituteAstVariables(ast: ASTNode, values: Record<string, Fraction>): ASTNode {
  switch (ast.type) {
    case 'variable':
      if (values[ast.name] !== undefined) {
        return { type: 'number', value: values[ast.name] };
      }
      return ast;
    case 'number':
      return ast;
    case 'unary':
      return {
        type: 'unary',
        operator: ast.operator,
        argument: substituteAstVariables(ast.argument, values)
      };
    case 'binary':
      return {
        type: 'binary',
        operator: ast.operator,
        left: substituteAstVariables(ast.left, values),
        right: substituteAstVariables(ast.right, values)
      };
    case 'sqrt':
      return {
        type: 'sqrt',
        argument: substituteAstVariables(ast.argument, values)
      };
  }
}

function evaluateNumericAst(ast: ASTNode): Fraction {
  switch (ast.type) {
    case 'number':
      return ast.value;
    case 'unary':
      if (ast.operator === '-') {
        return evaluateNumericAst(ast.argument).neg();
      }
      return evaluateNumericAst(ast.argument);
    case 'binary': {
      const left = evaluateNumericAst(ast.left);
      const right = evaluateNumericAst(ast.right);
      switch (ast.operator) {
        case '+': return left.add(right);
        case '-': return left.sub(right);
        case '*': return left.mul(right);
        case '/': return left.div(right);
        case '^': {
          if (!right.isInteger()) throw new Error("Non-integer exponents are not supported.");
          return left.pow(Number(right.num));
        }
      }
      break;
    }
    case 'sqrt': {
      const arg = evaluateNumericAst(ast.argument);
      if (arg.isNegative()) throw new Error("Negative radicand under square root");
      const val = Math.sqrt(arg.toNumber());
      if (Number.isInteger(val)) {
        return new Fraction(BigInt(Math.round(val)), 1n);
      }
      throw new Error(`Exact radical sqrt(${arg.toTex()}) cannot be evaluated to a rational number.`);
    }
    case 'variable':
      throw new Error(`Unassigned variable ${ast.name}`);
  }
}

/**
 * Formats an AST with variable values substituted into mathematical LaTeX
 */
function formatSubstitutedAst(node: ASTNode, values: Record<string, Fraction>): string {
  switch (node.type) {
    case 'number':
      return node.value.toTex();
    case 'variable': {
      if (values[node.name]) {
        const f = values[node.name];
        return f.den === 1n ? `(${f.toTex()})` : `\\left(${f.toTex()}\\right)`;
      }
      return node.name;
    }
    case 'unary':
      return `${node.operator}${formatSubstitutedAst(node.argument, values)}`;
    case 'binary': {
      const leftStr = formatSubstitutedAst(node.left, values);
      const rightStr = formatSubstitutedAst(node.right, values);
      if (node.operator === '*') {
        return `${leftStr}${rightStr}`;
      }
      if (node.operator === '^') {
        return `${leftStr}^{${rightStr}}`;
      }
      if (node.operator === '/') {
        return `\\frac{${leftStr}}{${rightStr}}`;
      }
      return `${leftStr} ${node.operator} ${rightStr}`;
    }
    case 'sqrt':
      return `\\sqrt{${formatSubstitutedAst(node.argument, values)}}`;
  }
}

/**
 * Solves variable evaluations:
 * - Multi-variable systems with dependencies (e.g. x = 2y/3, y = 21/z, z = 3) are solved
 *   topologically so independent variables are simplified first and substituted into dependent ones.
 * - Each step in multi-line solutions shows the line(s) above, building up progressively.
 * - Implied trailing "=" on expression line is displayed in step 1 and header.
 */
export function solveVariableEvaluation(req: EvaluationRequest, originalExpr: string): SolverResult {
  const steps: SolutionStep[] = [];
  const { expr: rawExpr, vars } = req;

  // Format expression for display
  const displayExpr = toDisplayLatex(rawExpr);

  // Clean expression for CAS parsing
  const cleanExpr = rawExpr.includes('\\') || /[{}]/.test(rawExpr) ? latexToAscii(rawExpr) : rawExpr;

  // Step 1: Given variable assignment & expression (aligned on "=")
  // Implied "=" on the expression line is shown as `&= `
  const givenVarLines = Object.entries(vars).map(([k, v]) => `${k} &= ${toDisplayLatex(v)}`);
  const givenDisplayLines = [...givenVarLines, `${displayExpr} &= `];
  steps.push({
    title: "Given Variable Equations & Expression",
    explanation: "We are given the variable equations and the expression to evaluate:",
    math: `\\begin{aligned}\n${givenDisplayLines.join(' \\\\\n')}\n\\end{aligned}`
  });

  // Step 2: Solve variables iteratively/topologically
  // Independent variables (no dependencies) are solved/simplified first,
  // then substituted into dependent ones until all variables are solved numbers.
  const solvedVars = new Map<string, Fraction>();
  const unsolved = new Map<string, { rawRhs: string; cleanRhs: string; ast: ASTNode; depVars: Set<string> }>();
  let hasSolvedOrSimplified = false;

  for (const [v, rhs] of Object.entries(vars)) {
    let cleanRhs = rhs.trim();
    // Normalize \frac{a}{b}
    const fracMatch = cleanRhs.match(/^(-?)\\frac\{([^{}]+)\}\{([^{}]+)\}$/);
    if (fracMatch) {
      cleanRhs = `${fracMatch[1] === '-' ? '-' : ''}(${fracMatch[2]})/(${fracMatch[3]})`;
    }
    const asciiRhs = cleanRhs.includes('\\') || /[{}]/.test(cleanRhs) ? latexToAscii(cleanRhs) : cleanRhs;
    const ast = new Parser(tokenize(asciiRhs)).parse();
    const depVars = getVarsFromAst(ast);
    unsolved.set(v, { rawRhs: rhs, cleanRhs: asciiRhs, ast, depVars });
  }

  // Iteratively solve independent variables and substitute
  while (unsolved.size > 0) {
    let foundVar: string | null = null;
    for (const [v, data] of unsolved.entries()) {
      const allDepsSolved = Array.from(data.depVars).every(d => solvedVars.has(d));
      if (allDepsSolved) {
        foundVar = v;
        break;
      }
    }

    if (!foundVar) {
      // Break if cycle exists to prevent infinite loop
      break;
    }

    const { rawRhs, cleanRhs, ast, depVars } = unsolved.get(foundVar)!;
    unsolved.delete(foundVar);

    const displayRhs = toDisplayLatex(rawRhs);

    if (depVars.size === 0) {
      // Independent variable (constant expression)
      const val = evaluateNumericAst(ast);
      solvedVars.set(foundVar, val);

      // Only show simplification step if the expression had operations to simplify (e.g. 6/2 or 1+2)
      if (cleanRhs !== val.toTex() && cleanRhs !== `${val.num}/${val.den}` && !cleanRhs.match(/^-?\d+$/)) {
        hasSolvedOrSimplified = true;
        steps.push({
          title: `Simplify Independent Variable ${foundVar}`,
          explanation: `The variable $${foundVar}$ is independent; simplify $${foundVar} = ${displayRhs}$ to lowest terms:`,
          math: `\\begin{aligned}\n${foundVar} &= ${displayRhs} \\\\\n${foundVar} &= ${val.toTex()}\n\\end{aligned}`
        });
      }
    } else {
      // Dependent variable: substitute known values
      hasSolvedOrSimplified = true;
      const valMap: Record<string, Fraction> = {};
      solvedVars.forEach((vVal, k) => { valMap[k] = vVal; });
      const substitutedAst = substituteAstVariables(ast, valMap);
      const val = evaluateNumericAst(substitutedAst);
      solvedVars.set(foundVar, val);

      // Format substitution for display
      let subTex = rawRhs;
      for (const d of depVars) {
        const dVal = solvedVars.get(d)!;
        const dTex = dVal.den === 1n ? dVal.toTex() : `\\left(${dVal.toTex()}\\right)`;
        // Replace variable identifier
        const vRegex = new RegExp(`\\b${d}\\b|(?<=[^a-zA-Z]|^)${d}(?=[^a-zA-Z]|$)`, 'g');
        subTex = subTex.replace(vRegex, `(${dTex})`);
      }
      subTex = subTex.replaceAll('((', '(').replaceAll('))', ')');

      const displaySubTex = toDisplayLatex(subTex);

      const varSolveLines = [
        `${foundVar} &= ${displayRhs}`,
        `${foundVar} &= ${displaySubTex}`
      ];
      if (displaySubTex !== val.toTex()) {
        varSolveLines.push(`${foundVar} &= ${val.toTex()}`);
      }

      steps.push({
        title: `Solve for ${foundVar}`,
        explanation: `Substitute the known independent variable(s) into the equation for $${foundVar}$ and simplify:`,
        math: `\\begin{aligned}\n${varSolveLines.join(' \\\\\n')}\n\\end{aligned}`
      });
    }
  }

  // Convert solved variables to a plain map
  const varFracs: Record<string, Fraction> = {};
  solvedVars.forEach((v, k) => { varFracs[k] = v; });

  // Restate solved variable values before solving the final expression if any variables were solved or simplified
  if (hasSolvedOrSimplified) {
    const restatedVarLines = Object.keys(vars).map(k => `${k} &= ${varFracs[k] ? varFracs[k].toTex() : k}`);
    const restatedDisplayLines = [...restatedVarLines, `${displayExpr} &= `];
    steps.push({
      title: "Restate Solved Variable Values & Target Expression",
      explanation: "With all variables solved to independent numerical values, we restate the system before evaluating the target expression:",
      math: `\\begin{aligned}\n${restatedDisplayLines.join(' \\\\\n')}\n\\end{aligned}`
    });
  }

  // Check abstract function call: e.g. f(x)
  const funcMatch = cleanExpr.trim().match(/^([a-zA-Z])\(([a-zA-Z])\)$/);
  if (funcMatch) {
    const funcName = funcMatch[1];
    const argVar = funcMatch[2];
    const valTex = varFracs[argVar] ? varFracs[argVar].toTex() : argVar;
    const finalFuncAns = `${funcName}(${valTex})`;

    steps.push({
      title: "Substitute Variable into Function",
      explanation: `Substitute the value $${argVar} = ${valTex}$ into $${funcName}(${argVar})$:`,
      math: `\\begin{aligned}\n${displayExpr} &= ${finalFuncAns}\n\\end{aligned}`
    });

    const headerTex = `\\begin{aligned}\n${givenVarLines.join(' \\\\\n')} \\\\\n${displayExpr} &= ${finalFuncAns}\n\\end{aligned}`;

    return {
      expression: headerTex,
      finalAnswer: finalFuncAns,
      steps
    };
  }

  // Build the progression chain of intermediate equations for the main expression
  const ast = new Parser(tokenize(cleanExpr)).parse();
  const numericAst = substituteAstVariables(ast, varFracs);
  const finalVal = evaluateNumericAst(numericAst);
  const finalAnswerStr = finalVal.toTex();

  const evalChain: { left: string; right: string; explanation: string }[] = [];

  // Line 1: Substitution
  const step1SubTex = formatSubstitutedAst(ast, varFracs);
  evalChain.push({
    left: displayExpr,
    right: step1SubTex,
    explanation: "Substitute the solved variable values into the expression:"
  });

  let currentRight = step1SubTex;

  // Line 2: If polynomial / linear combination terms, evaluate products & powers
  function collectTerms(node: ASTNode): { sign: number; node: ASTNode }[] {
    if (node.type === 'binary' && node.operator === '+') {
      return [...collectTerms(node.left), ...collectTerms(node.right)];
    }
    if (node.type === 'binary' && node.operator === '-') {
      const rightTerms = collectTerms(node.right).map(t => ({ sign: -t.sign, node: t.node }));
      return [...collectTerms(node.left), ...rightTerms];
    }
    return [{ sign: 1, node }];
  }

  if (ast.type === 'binary' && (ast.operator === '+' || ast.operator === '-')) {
    const terms = collectTerms(ast);
    const evaluatedTerms = terms.map(t => {
      const termNumAst = substituteAstVariables(t.node, varFracs);
      const val = evaluateNumericAst(termNumAst);
      return t.sign === -1 ? val.neg() : val;
    });

    const evaluatedTermsTex = evaluatedTerms.map((t, idx) => {
      if (idx === 0) return t.toTex();
      if (t.isNegative()) return `- ${t.abs().toTex()}`;
      return `+ ${t.toTex()}`;
    }).join(' ');

    if (evaluatedTermsTex !== currentRight && evaluatedTermsTex !== finalAnswerStr) {
      evalChain.push({
        left: currentRight,
        right: evaluatedTermsTex,
        explanation: "Perform multiplication and exponent operations on individual terms (PEMDAS):"
      });
      currentRight = evaluatedTermsTex;
    }
  }

  // Line 3: Final combination
  if (currentRight !== finalAnswerStr) {
    evalChain.push({
      left: currentRight,
      right: finalAnswerStr,
      explanation: "Add and subtract remaining constant terms to find the final value (PEMDAS):"
    });
  }

  // For multi-line solutions, each step shows the line(s) above,
  // building up progressively until the final step contains the complete chain.
  const chainLines = evalChain.map(c => `${c.left} &= ${c.right}`);

  for (let i = 0; i < evalChain.length; i++) {
    const currentStepLines = chainLines.slice(0, i + 1);
    const isLast = i === evalChain.length - 1;
    steps.push({
      title: isLast ? "Final Result" : `Evaluation Step ${i + 1}`,
      explanation: evalChain[i].explanation,
      math: `\\begin{aligned}\n${currentStepLines.join(' \\\\\n')}\n\\end{aligned}`
    });
  }

  // Header expression lined up on "="
  const finalHeaderLines = [...givenVarLines, `${displayExpr} &= ${finalAnswerStr}`];
  const headerTex = `\\begin{aligned}\n${finalHeaderLines.join(' \\\\\n')}\n\\end{aligned}`;

  return {
    expression: headerTex,
    finalAnswer: finalAnswerStr,
    steps
  };
}

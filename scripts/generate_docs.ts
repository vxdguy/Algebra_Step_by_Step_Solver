import fs from 'fs';
import path from 'path';

const docsDir = path.resolve('docs/code');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

interface DocEntry {
  file: string;
  name: string;
  sourceFile: string;
  inputs: { name: string; type: string; description: string }[];
  output: { type: string; description: string };
  description: string;
  whyNeeded: string;
  examples: { input: string; output: string }[];
  related: string[];
}

const docs: DocEntry[] = [
  {
    file: "solveAlgebra.md",
    name: "solveAlgebra",
    sourceFile: "src/services/algebraSolver.ts",
    inputs: [
      { name: "rawInput", type: "string", description: "The raw mathematical problem entered by the user (algebraic equation, single fraction, fraction arithmetic, polynomial, or multi-line system with LaTeX \\\\)." }
    ],
    output: { type: "Promise<SolverResult>", description: "An object containing the formatted LaTeX expression, the final answer string, and an array of SolutionStep items." },
    description: "The primary entry point and orchestrator for the entire Computer Algebra System (CAS). It sanitizes raw LaTeX or standard algebraic input, strips conversational command prefixes (e.g. 'simplify', 'solve'), detects the category of problem (single fraction reduction, multi-term fraction arithmetic, linear equations, quadratic equations, or multi-variable systems with dependencies), and delegates to the appropriate specialized solver module.",
    whyNeeded: "Provides a single unified asynchronous interface that the React UI calls to solve any supported pre-algebra or algebra problem deterministically without requiring external API requests or LLM calls.",
    examples: [
      {
        input: 'x=\\frac{2y}{3} \\\\ y=21/z \\\\ z=3 \\\\ 2x+3y+4z',
        output: '{\n  expression: "\\begin{aligned} x &= \\frac{2y}{3} \\\\ y &= \\frac{21}{z} \\\\ z &= 3 \\\\ 2x+3y+4z &= \\frac{127}{3} \\end{aligned}",\n  finalAnswer: "\\frac{127}{3}",\n  steps: [ /* 7 progressive SolutionStep items */ ]\n}'
      },
      {
        input: '\\frac{1}{2} + \\frac{2}{3}',
        output: '{\n  expression: "\\frac{1}{2} + \\frac{2}{3} = \\frac{7}{6}",\n  finalAnswer: "\\frac{7}{6}",\n  steps: [ /* LCD finding, conversion, combination steps */ ]\n}'
      }
    ],
    related: ["[solveEquation](solveEquation.md)", "[solveVariableEvaluation](solveVariableEvaluation.md)", "[reduceSingleFraction](reduceSingleFraction.md)", "[solveFractionArithmetic](solveFractionArithmetic.md)", "[latexToAscii](latexToAscii.md)"]
  },
  {
    file: "tokenize.md",
    name: "tokenize",
    sourceFile: "src/services/solver/ast.ts",
    inputs: [
      { name: "input", type: "string", description: "Standard ASCII mathematical expression or equation string." }
    ],
    output: { type: "Token[]", description: "An array of lexical tokens including NUMBER, VARIABLE, PLUS, MINUS, STAR, SLASH, CARET, LPAREN, RPAREN, EQUALS, and SQRT." },
    description: "Performs lexical analysis (tokenization) on an algebraic string. Recognizes numbers (integers and decimals), multi-character numbers, single-letter variables, arithmetic operators, parentheses, equals signs, and functions like sqrt. Also handles implicit multiplication (e.g., 2x or 3(x+1)).",
    whyNeeded: "Converts raw mathematical text streams into structured discrete tokens so the recursive-descent Parser can construct abstract syntax trees (ASTs).",
    examples: [
      {
        input: '2x + 5 = 15',
        output: '[\n  { type: "NUMBER", value: "2" },\n  { type: "STAR" },\n  { type: "VARIABLE", value: "x" },\n  { type: "PLUS" },\n  { type: "NUMBER", value: "5" },\n  { type: "EQUALS" },\n  { type: "NUMBER", value: "15" }\n]'
      }
    ],
    related: ["[nodeToTex](nodeToTex.md)", "[astToPolynomial](astToPolynomial.md)", "[findVariables](findVariables.md)"]
  },
  {
    file: "nodeToTex.md",
    name: "nodeToTex",
    sourceFile: "src/services/solver/ast.ts",
    inputs: [
      { name: "node", type: "ASTNode", description: "The root or sub-node of an Abstract Syntax Tree." },
      { name: "parentPrecedence", type: "number (optional, default 0)", description: "The operator precedence of the parent AST node, used to selectively emit parentheses only when mathematically required." }
    ],
    output: { type: "string", description: "Formatted LaTeX math string representing the AST." },
    description: "Recursively traverses an Abstract Syntax Tree (ASTNode) and renders standard mathematical LaTeX notation. Correctly generates \\frac{numerator}{denominator} for divisions, {base}^{exponent} for powers, \\sqrt{arg} for radicals, and formats implicit multiplications (omitting \\cdot when multiplying numbers by variables or radicals).",
    whyNeeded: "Provides clean, elegant LaTeX representations of parsed expressions for KaTeX rendering in the frontend and step-by-step mathematical reasoning.",
    examples: [
      {
        input: 'binary("/", binary("^", number(2), number(3)), number(5))',
        output: '"\\frac{{2}^{3}}{5}"'
      },
      {
        input: 'binary("+", binary("*", number(2), variable("x")), number(7))',
        output: '"2x + 7"'
      }
    ],
    related: ["[tokenize](tokenize.md)", "[toDisplayLatex](toDisplayLatex.md)", "[astToPolynomial](astToPolynomial.md)"]
  },
  {
    file: "astToPolynomial.md",
    name: "astToPolynomial",
    sourceFile: "src/services/solver/ast.ts",
    inputs: [
      { name: "node", type: "ASTNode", description: "The AST expression to convert." },
      { name: "targetVar", type: "string (optional, default 'x')", description: "The primary variable name to treat as the polynomial indeterminate." }
    ],
    output: { type: "Polynomial", description: "A canonical Polynomial object mapping degree powers to exact Fraction coefficients." },
    description: "Converts an arbitrary algebraic AST expression into a canonical single-variable Polynomial representation with exact Fraction coefficients. Supports addition, subtraction, multiplication, and integer exponentiation of polynomials.",
    whyNeeded: "Enables canonical polynomial algebraic operations, such as collecting like terms, multiplying polynomials, and finding degrees/coefficients for linear and quadratic solvers.",
    examples: [
      {
        input: 'AST for "(x + 2)(x + 3)", targetVar="x"',
        output: 'Polynomial { targetVar: "x", terms: Map { 2 => 1/1, 1 => 5/1, 0 => 6/1 } } // x^2 + 5x + 6'
      }
    ],
    related: ["[Polynomial](Polynomial.md)", "[solveEquation](solveEquation.md)", "[simplifyExpression](simplifyExpression.md)"]
  },
  {
    file: "findVariables.md",
    name: "findVariables",
    sourceFile: "src/services/solver/ast.ts",
    inputs: [
      { name: "node", type: "ASTNode", description: "The AST node to analyze." }
    ],
    output: { type: "string[]", description: "An array of unique variable names found in the AST." },
    description: "Recursively walks an Abstract Syntax Tree to identify all distinct variable names (e.g. ['x'], ['x', 'y', 'z']) present in the expression.",
    whyNeeded: "Allows equation and expression solvers to detect which variables are present, distinguish single-variable from multi-variable problems, and pick the primary variable to solve for.",
    examples: [
      {
        input: 'AST for "2x + 3y + 4z"',
        output: '["x", "y", "z"]'
      }
    ],
    related: ["[tokenize](tokenize.md)", "[astToPolynomial](astToPolynomial.md)"]
  },
  {
    file: "solveEquation.md",
    name: "solveEquation",
    sourceFile: "src/services/solver/equationSolver.ts",
    inputs: [
      { name: "rawLeft", type: "string", description: "Left-hand side expression of the equation." },
      { name: "rawRight", type: "string", description: "Right-hand side expression of the equation." }
    ],
    output: { type: "SolverResult", description: "Step-by-step solution containing cleared denominators (if fractional), collected variable terms, isolated constants, and final rational/radical answers." },
    description: "Solves linear and quadratic single-variable equations. Handles fractional coefficients by computing the Least Common Multiple (LCM) of denominators to clear fractions in Step 1, moves variable terms to one side and constants to the other, simplifies coefficients, and computes exact solutions (including square roots and quadratic formulas with simplified radicals).",
    whyNeeded: "Solves standard 8th grade and high school algebra equations step-by-step, showing every algebraic manipulation clearly.",
    examples: [
      {
        input: 'rawLeft: "\\frac{2}{3}x + \\frac{1}{4}", rawRight: "\\frac{5}{6}"',
        output: '{\n  expression: "\\frac{2}{3}x + \\frac{1}{4} = \\frac{5}{6}",\n  finalAnswer: "x = \\frac{7}{8}",\n  steps: [ /* Clearing denominators with LCD 12, isolating x */ ]\n}'
      }
    ],
    related: ["[solveAlgebra](solveAlgebra.md)", "[simplifySquareRoot](simplifySquareRoot.md)", "[Fraction](Fraction.md)"]
  },
  {
    file: "simplifyExpression.md",
    name: "simplifyExpression",
    sourceFile: "src/services/solver/expressionSimplifier.ts",
    inputs: [
      { name: "rawExpr", type: "string", description: "An algebraic polynomial expression to simplify." }
    ],
    output: { type: "SolverResult", description: "Solution object showing expansion of parentheses, grouping of like terms, and canonical descending-degree simplified form." },
    description: "Simplifies algebraic expressions by expanding products of binomials/polynomials, distributing coefficients across parentheses, and combining like degree terms.",
    whyNeeded: "Provides rigorous step-by-step simplification for polynomial expressions like (2x+3)(x-4) or 3x^2 + 5x - x^2 + 2.",
    examples: [
      {
        input: '3x + 4 - 2x + 7',
        output: '{\n  expression: "3x + 4 - 2x + 7 = x + 11",\n  finalAnswer: "x + 11",\n  steps: [ /* Grouping terms, combining coefficients */ ]\n}'
      }
    ],
    related: ["[Polynomial](Polynomial.md)", "[solveAlgebra](solveAlgebra.md)"]
  },
  {
    file: "parseVariableEvaluation.md",
    name: "parseVariableEvaluation",
    sourceFile: "src/services/solver/expressionSimplifier.ts",
    inputs: [
      { name: "raw", type: "string", description: "Text input containing variable assignments." }
    ],
    output: { type: "VariableEvalSpec | null", description: "Parsed object with expr, varName, and value, or null if not matching." },
    description: "Detects legacy or inline variable evaluation requests using natural language keywords like '2x+7 when x=24'.",
    whyNeeded: "Serves as a fallback parser for natural language variable evaluation phrasing.",
    examples: [
      {
        input: '2x + 7 when x = 24',
        output: '{ expr: "2x + 7", varName: "x", value: Fraction(24, 1) }'
      }
    ],
    related: ["[evaluateExpressionForVariable](evaluateExpressionForVariable.md)", "[parseEvaluationRequest](parseEvaluationRequest.md)"]
  },
  {
    file: "evaluateExpressionForVariable.md",
    name: "evaluateExpressionForVariable",
    sourceFile: "src/services/solver/expressionSimplifier.ts",
    inputs: [
      { name: "expr", type: "string", description: "Expression to evaluate." },
      { name: "varName", type: "string", description: "Variable identifier to substitute." },
      { name: "val", type: "Fraction", description: "Numerical fraction value for the variable." },
      { name: "originalExpr", type: "string", description: "Original string entered by user." }
    ],
    output: { type: "SolverResult", description: "Step-by-step substitution and evaluation steps." },
    description: "Evaluates single-variable polynomial expressions for a given numerical value, detailing substitution, power evaluation, multiplication, and addition/subtraction.",
    whyNeeded: "Provides step-by-step PEMDAS evaluation for single-variable expressions.",
    examples: [
      {
        input: 'expr: "2x + 7", varName: "x", val: Fraction(24, 1), originalExpr: "2x + 7 for x = 24"',
        output: '{ expression: "2x + 7 = 55", finalAnswer: "55", steps: [...] }'
      }
    ],
    related: ["[solveVariableEvaluation](solveVariableEvaluation.md)", "[Fraction](Fraction.md)"]
  },
  {
    file: "Fraction.md",
    name: "Fraction",
    sourceFile: "src/services/solver/fraction.ts",
    inputs: [
      { name: "num", type: "bigint | number | string | Fraction", description: "Numerator or initial fraction representation (e.g. '3/4', 5, 2n)." },
      { name: "den", type: "bigint | number (optional, default 1n)", description: "Denominator (must be non-zero)." }
    ],
    output: { type: "Fraction instance", description: "An immutable rational number object with exact BigInt numerator (num) and denominator (den) in reduced canonical form." },
    description: "A high-precision rational number class built on JavaScript BigInt primitives. Automatically simplifies fractions to irreducible form via gcdBigInt, handles negative signs canonically in the numerator, and provides arithmetic methods (add, sub, mul, div, pow, abs, neg, inverse) without floating-point rounding errors. Also formats to LaTeX (toTex), mixed numbers (toMixedTex), and decimals.",
    whyNeeded: "Fundamental core datatype for the entire Computer Algebra System, ensuring 100% exact rational arithmetic across all fraction reductions, equation solving, and polynomial manipulations.",
    examples: [
      {
        input: 'new Fraction(28n, 6n)',
        output: 'Fraction { num: 14n, den: 3n } // renders as \\frac{14}{3}'
      },
      {
        input: 'new Fraction("3/4").add(new Fraction("2/3"))',
        output: 'Fraction { num: 17n, den: 12n } // renders as \\frac{17}{12}'
      }
    ],
    related: ["[gcdBigInt](gcdBigInt.md)", "[lcmBigInt](lcmBigInt.md)", "[formatFractionTex](formatFractionTex.md)"]
  },
  {
    file: "normalizeFractionInput.md",
    name: "normalizeFractionInput",
    sourceFile: "src/services/solver/fractionSolver.ts",
    inputs: [
      { name: "raw", type: "string", description: "Raw fraction input string with LaTeX or ASCII formatting." }
    ],
    output: { type: "string", description: "Normalized ASCII fraction string." },
    description: "Cleans and normalizes LaTeX fraction notation (e.g. \\frac{a}{b}, \\cdot, \\div) into standardized ASCII representations for arithmetic processing.",
    whyNeeded: "Prepares user-typed fractions for pattern matching and arithmetic evaluation.",
    examples: [
      {
        input: '\\frac{2}{3} \\cdot \\frac{5}{4}',
        output: '"2/3 * 5/4"'
      }
    ],
    related: ["[isFractionReductionInput](isFractionReductionInput.md)", "[isFractionArithmeticInput](isFractionArithmeticInput.md)"]
  },
  {
    file: "isFractionReductionInput.md",
    name: "isFractionReductionInput",
    sourceFile: "src/services/solver/fractionSolver.ts",
    inputs: [
      { name: "input", type: "string", description: "Candidate fraction expression string." }
    ],
    output: { type: "boolean", description: "True if the string represents a single reducible fraction like '10/2', '12/8', '3x/6', or '(6x + 9)/3'." },
    description: "Detects if an input string is a single fraction needing reduction or algebraic factoring.",
    whyNeeded: "Allows solveAlgebra to route single fractions to reduceSingleFraction.",
    examples: [
      {
        input: '10/2',
        output: 'true'
      },
      {
        input: '1/2 + 2/3',
        output: 'false'
      }
    ],
    related: ["[reduceSingleFraction](reduceSingleFraction.md)", "[isFractionArithmeticInput](isFractionArithmeticInput.md)"]
  },
  {
    file: "isFractionArithmeticInput.md",
    name: "isFractionArithmeticInput",
    sourceFile: "src/services/solver/fractionSolver.ts",
    inputs: [
      { name: "input", type: "string", description: "Candidate expression string." }
    ],
    output: { type: "boolean", description: "True if the string is a multi-term fraction arithmetic expression (+, -, *, /)." },
    description: "Identifies multi-term fraction arithmetic problems (e.g. '1/2 + 2/3', '5/6 - 1/4', '2/3 * 5/4', '3/4 / 2/5').",
    whyNeeded: "Routes fraction arithmetic problems to solveFractionArithmetic.",
    examples: [
      {
        input: '1/2 + 2/3',
        output: 'true'
      }
    ],
    related: ["[solveFractionArithmetic](solveFractionArithmetic.md)", "[isFractionReductionInput](isFractionReductionInput.md)"]
  },
  {
    file: "reduceSingleFraction.md",
    name: "reduceSingleFraction",
    sourceFile: "src/services/solver/fractionSolver.ts",
    inputs: [
      { name: "input", type: "string", description: "Single fraction expression string (e.g. '10/2', '11/3', '12/8', '3x/6', '(6x+9)/3')." }
    ],
    output: { type: "SolverResult", description: "Complete solution showing prime factorizations, GCD extraction, cancellations, mixed numbers (if improper), and final simplified fraction." },
    description: "Reduces numerical and algebraic fractions. For numerical fractions, shows greatest common divisor (GCD) calculation, prime factor breakdown, cancellation of common factors, and improper-to-mixed number conversions. For algebraic fractions, factors common numeric coefficients from polynomials.",
    whyNeeded: "Provides comprehensive 8th-grade fraction reduction reasoning required by pre-algebra curricula.",
    examples: [
      {
        input: '12/8',
        output: '{\n  expression: "\\frac{12}{8} = \\frac{3}{2}",\n  finalAnswer: "\\frac{3}{2}",\n  steps: [ /* Step 1: GCD=4, Step 2: Factor & Cancel, Step 3: Mixed Number 1 1/2 */ ]\n}'
      }
    ],
    related: ["[solveFractionArithmetic](solveFractionArithmetic.md)", "[gcdBigInt](gcdBigInt.md)", "[Fraction](Fraction.md)"]
  },
  {
    file: "solveFractionArithmetic.md",
    name: "solveFractionArithmetic",
    sourceFile: "src/services/solver/fractionSolver.ts",
    inputs: [
      { name: "input", type: "string", description: "Fraction arithmetic expression (e.g. '1/2 + 2/3', '5/6 - 1/4', '2/3 * 5/4', '3/4 / 2/5')." }
    ],
    output: { type: "SolverResult", description: "Step-by-step arithmetic solution detailing LCD calculation, conversion to equivalent fractions, numerator combination, and final reduction." },
    description: "Solves arithmetic between multiple fractions. For addition and subtraction, computes the Least Common Denominator (LCD), converts each fraction to an equivalent fraction with the common denominator, adds/subtracts numerators, and simplifies. For multiplication, multiplies across numerators and denominators. For division, multiplies by the reciprocal (Keep-Change-Flip).",
    whyNeeded: "Teaches standard pre-algebra fraction arithmetic methods with full intermediate step explanations.",
    examples: [
      {
        input: '1/2 + 2/3',
        output: '{\n  expression: "\\frac{1}{2} + \\frac{2}{3} = \\frac{7}{6}",\n  finalAnswer: "\\frac{7}{6}",\n  steps: [ /* Step 1: LCD=6, Step 2: Equivalent fractions, Step 3: Combine, Step 4: Mixed Number */ ]\n}'
      }
    ],
    related: ["[reduceSingleFraction](reduceSingleFraction.md)", "[lcmBigInt](lcmBigInt.md)", "[Fraction](Fraction.md)"]
  },
  {
    file: "gcdBigInt.md",
    name: "gcdBigInt",
    sourceFile: "src/services/solver/fractionUtils.ts",
    inputs: [
      { name: "a", type: "bigint", description: "First BigInt value." },
      { name: "b", type: "bigint", description: "Second BigInt value." }
    ],
    output: { type: "bigint", description: "Greatest Common Divisor (positive BigInt)." },
    description: "Computes the Greatest Common Divisor (GCD) of two BigInt numbers using the Euclidean algorithm.",
    whyNeeded: "Essential for fraction reduction, simplifying coefficients, and finding polynomial common factors.",
    examples: [
      {
        input: 'a: 24n, b: 36n',
        output: '12n'
      }
    ],
    related: ["[lcmBigInt](lcmBigInt.md)", "[Fraction](Fraction.md)"]
  },
  {
    file: "lcmBigInt.md",
    name: "lcmBigInt",
    sourceFile: "src/services/solver/fractionUtils.ts",
    inputs: [
      { name: "a", type: "bigint", description: "First BigInt value." },
      { name: "b", type: "bigint", description: "Second BigInt value." }
    ],
    output: { type: "bigint", description: "Least Common Multiple (positive BigInt)." },
    description: "Calculates the Least Common Multiple (LCM) of two BigInt integers via (a * b) / gcdBigInt(a, b).",
    whyNeeded: "Used to determine the Least Common Denominator (LCD) when adding/subtracting fractions or clearing denominators in equations.",
    examples: [
      {
        input: 'a: 4n, b: 6n',
        output: '12n'
      }
    ],
    related: ["[gcdBigInt](gcdBigInt.md)", "[solveFractionArithmetic](solveFractionArithmetic.md)"]
  },
  {
    file: "gcdNumber.md",
    name: "gcdNumber",
    sourceFile: "src/services/solver/fractionUtils.ts",
    inputs: [
      { name: "a", type: "number", description: "First integer." },
      { name: "b", type: "number", description: "Second integer." }
    ],
    output: { type: "number", description: "Greatest Common Divisor (number)." },
    description: "Calculates the Greatest Common Divisor of two standard JavaScript numbers using the Euclidean algorithm.",
    whyNeeded: "Provides lightweight number-level GCD calculation for non-BigInt routines.",
    examples: [
      {
        input: 'a: 18, b: 24',
        output: '6'
      }
    ],
    related: ["[gcdBigInt](gcdBigInt.md)", "[lcmNumber](lcmNumber.md)"]
  },
  {
    file: "lcmNumber.md",
    name: "lcmNumber",
    sourceFile: "src/services/solver/fractionUtils.ts",
    inputs: [
      { name: "a", type: "number", description: "First integer." },
      { name: "b", type: "number", description: "Second integer." }
    ],
    output: { type: "number", description: "Least Common Multiple (number)." },
    description: "Calculates the Least Common Multiple of two numbers via (a * b) / gcdNumber(a, b).",
    whyNeeded: "Used for number-level common denominator calculations.",
    examples: [
      {
        input: 'a: 3, b: 5',
        output: '15'
      }
    ],
    related: ["[lcmBigInt](lcmBigInt.md)", "[gcdNumber](gcdNumber.md)"]
  },
  {
    file: "formatFractionTex.md",
    name: "formatFractionTex",
    sourceFile: "src/services/solver/fractionUtils.ts",
    inputs: [
      { name: "f", type: "Fraction", description: "The fraction object to format." }
    ],
    output: { type: "string", description: "LaTeX representation: integer if den=1, otherwise \\frac{num}{den}." },
    description: "Formats a Fraction into clean LaTeX. Omits the fraction bar if the denominator is 1.",
    whyNeeded: "Ensures uniform fraction formatting across solver explanations.",
    examples: [
      {
        input: 'new Fraction(5n, 1n)',
        output: '"5"'
      },
      {
        input: 'new Fraction(3n, 4n)',
        output: '"\\frac{3}{4}"'
      }
    ],
    related: ["[Fraction](Fraction.md)", "[nodeToTex](nodeToTex.md)"]
  },
  {
    file: "toDisplayLatex.md",
    name: "toDisplayLatex",
    sourceFile: "src/services/solver/latexConverter.ts",
    inputs: [
      { name: "raw", type: "string", description: "Mathematical expression or equation with slash fractions (e.g. 'y=21/z', '2^3/5', '2x+3y+4z')." }
    ],
    output: { type: "string", description: "Formatted LaTeX math string with fractions rendered as \\frac{...}{...} according to AST precedence." },
    description: "Parses mathematical text through the AST parser and converts division operators (/) into properly structured LaTeX \\frac{numerator}{denominator} fractions according to algebraic operator precedence rules.",
    whyNeeded: "Converts user-typed slash notation into professional textbook LaTeX in both the real-time preview and solution steps.",
    examples: [
      {
        input: 'y=21/z',
        output: '"y = \\frac{21}{z}"'
      },
      {
        input: '2^3/5',
        output: '"\\frac{{2}^{3}}{5}"'
      },
      {
        input: '2^(3/5)',
        output: '"{2}^{\\frac{3}{5}}"'
      }
    ],
    related: ["[latexToAscii](latexToAscii.md)", "[nodeToTex](nodeToTex.md)", "[tokenize](tokenize.md)"]
  },
  {
    file: "latexToAscii.md",
    name: "latexToAscii",
    sourceFile: "src/services/solver/latexConverter.ts",
    inputs: [
      { name: "rawInput", type: "string", description: "Raw LaTeX string containing \\frac{a}{b}, \\cdot, \\div, \\left(, \\right), etc." }
    ],
    output: { type: "string", description: "Normalized ASCII algebraic string parseable by CAS AST parsers." },
    description: "Translates LaTeX math macros and syntax into plain ASCII algebra notation. Recursively unpacks \\frac{numerator}{denominator} into parenthesized divisions, strips spacing and displaystyle commands, normalizes multiplication (\\cdot, \\times) to *, and division (\\div) to /.",
    whyNeeded: "Allows the internal Computer Algebra System (CAS) to seamlessly accept LaTeX copied from textbooks or web tools.",
    examples: [
      {
        input: '\\frac{2y}{3}',
        output: '"2y / 3"'
      },
      {
        input: '\\frac{6x + 9}{3}',
        output: '"(6x + 9) / 3"'
      }
    ],
    related: ["[toDisplayLatex](toDisplayLatex.md)", "[tokenize](tokenize.md)"]
  },
  {
    file: "Polynomial.md",
    name: "Polynomial",
    sourceFile: "src/services/solver/polynomial.ts",
    inputs: [
      { name: "targetVar", type: "string (optional, default 'x')", description: "Variable indeterminate." },
      { name: "terms", type: "Map<number, Fraction> (optional)", description: "Map from degree (number) to exact coefficient (Fraction)." }
    ],
    output: { type: "Polynomial instance", description: "An algebraic polynomial with exact arithmetic operations." },
    description: "Represents a single-variable polynomial $P(x) = \\sum c_i x^i$ with exact Fraction coefficients. Supports addition, subtraction, multiplication, negation, evaluation at a given Fraction point, derivative, degree inspection, and LaTeX rendering (toTex).",
    whyNeeded: "Powers the algebraic manipulation for equation solving, expression expansion, like-term combination, and factoring.",
    examples: [
      {
        input: 'Polynomial with terms { 2 => 1/1, 1 => -5/1, 0 => 6/1 }',
        output: 'toTex() -> "x^{2} - 5x + 6"'
      }
    ],
    related: ["[astToPolynomial](astToPolynomial.md)", "[Fraction](Fraction.md)"]
  },
  {
    file: "simplifySquareRoot.md",
    name: "simplifySquareRoot",
    sourceFile: "src/services/solver/radical.ts",
    inputs: [
      { name: "n", type: "bigint", description: "Radicand integer under the square root $\\sqrt{n}$." }
    ],
    output: { type: "{ outside: bigint; inside: bigint }", description: "Simplified radical form $a\\sqrt{b}$ where $a^2 \\cdot b = n$ and $b$ is square-free." },
    description: "Simplifies an exact square root $\\sqrt{n}$ into canonical radical form $a\\sqrt{b}$ by extracting the largest perfect square factor from $n$.",
    whyNeeded: "Provides exact radical solutions for quadratic equations without loss of precision.",
    examples: [
      {
        input: 'n: 48n',
        output: '{ outside: 4n, inside: 3n } // 4\\sqrt{3}'
      },
      {
        input: 'n: 25n',
        output: '{ outside: 5n, inside: 1n } // 5'
      }
    ],
    related: ["[formatRadicalTex](formatRadicalTex.md)", "[solveEquation](solveEquation.md)"]
  },
  {
    file: "formatRadicalTex.md",
    name: "formatRadicalTex",
    sourceFile: "src/services/solver/radical.ts",
    inputs: [
      { name: "outside", type: "bigint", description: "Integer coefficient outside the radical." },
      { name: "inside", type: "bigint", description: "Square-free radicand inside the radical." }
    ],
    output: { type: "string", description: "LaTeX string (e.g. '4\\sqrt{3}', '5', '\\sqrt{7}')." },
    description: "Formats a simplified radical pair (outside, inside) into clean LaTeX, handling special cases where inside is 1 (pure integer) or outside is 1 (pure radical).",
    whyNeeded: "Ensures textbook-accurate radical display in quadratic equation solutions.",
    examples: [
      {
        input: 'outside: 4n, inside: 3n',
        output: '"4\\sqrt{3}"'
      }
    ],
    related: ["[simplifySquareRoot](simplifySquareRoot.md)", "[solveEquation](solveEquation.md)"]
  },
  {
    file: "parseEvaluationRequest.md",
    name: "parseEvaluationRequest",
    sourceFile: "src/services/solver/variableEvaluator.ts",
    inputs: [
      { name: "raw", type: "string", description: "Multi-line problem string where lines are separated by LaTeX \\\\ or newlines." }
    ],
    output: { type: "EvaluationRequest | null", description: "Parsed object with expr, vars dictionary, and rawLines, or null." },
    description: "Parses multi-line variable evaluation systems. Extracts variable definitions from preceding lines (e.g. 'x=\\frac{2y}{3}', 'y=21/z', 'z=3') and the target expression from the final line (e.g. '2x+3y+4z'). Strips any optional trailing '=' on the expression line.",
    whyNeeded: "Enables multi-variable systems with interdependent variable equations and implied equals signs.",
    examples: [
      {
        input: 'x=\\frac{2y}{3} \\\\ y=21/z \\\\ z=3 \\\\ 2x+3y+4z',
        output: '{\n  expr: "2x+3y+4z",\n  vars: { x: "\\frac{2y}{3}", y: "21/z", z: "3" },\n  rawLines: ["x=\\frac{2y}{3}", "y=21/z", "z=3", "2x+3y+4z"]\n}'
      }
    ],
    related: ["[solveVariableEvaluation](solveVariableEvaluation.md)", "[solveAlgebra](solveAlgebra.md)"]
  },
  {
    file: "solveVariableEvaluation.md",
    name: "solveVariableEvaluation",
    sourceFile: "src/services/solver/variableEvaluator.ts",
    inputs: [
      { name: "req", type: "EvaluationRequest", description: "Parsed evaluation request containing expr and vars dictionary." },
      { name: "originalExpr", type: "string", description: "Original raw input entered by the user." }
    ],
    output: { type: "SolverResult", description: "Complete solution with topological variable resolution, restated solved values, and progressive expression evaluation steps." },
    description: "Solves multi-variable systems where variables may depend on one another. Topologically identifies independent variables, simplifies them, substitutes them into dependent variables, and solves all variables to exact numbers. Restates all resolved variable values alongside the target expression, then evaluates the expression step-by-step with progressive line buildup.",
    whyNeeded: "Provides comprehensive step-by-step reasoning for multi-variable substitution problems in pre-algebra and algebra.",
    examples: [
      {
        input: 'req: { expr: "2x+3y+4z", vars: { x: "\\frac{2y}{3}", y: "21/z", z: "3" } }',
        output: '{\n  expression: "\\begin{aligned} x &= \\frac{2y}{3} \\\\ y &= \\frac{21}{z} \\\\ z &= 3 \\\\ 2x+3y+4z &= \\frac{127}{3} \\end{aligned}",\n  finalAnswer: "\\frac{127}{3}",\n  steps: [\n    // Step 1: Given equations\n    // Step 2: Solve y\n    // Step 3: Solve x\n    // Step 4: Restate solved values\n    // Step 5: Substitution\n    // Step 6: Multiplication\n    // Step 7: Addition & final answer\n  ]\n}'
      }
    ],
    related: ["[parseEvaluationRequest](parseEvaluationRequest.md)", "[solveAlgebra](solveAlgebra.md)", "[Fraction](Fraction.md)"]
  }
];

// Write individual docs
for (const doc of docs) {
  const md = `# \`${doc.name}\`

[Back to Table of Contents](_TOC.md)

- **Source File**: [\`${doc.sourceFile}\`](../../${doc.sourceFile})
- **Exported Entity**: \`${doc.name}\`

---

## Description

${doc.description}

---

## Why It Is Needed

${doc.whyNeeded}

---

## Expected Inputs

| Parameter | Type | Description |
| :--- | :--- | :--- |
${doc.inputs.map(i => `| \`${i.name}\` | \`${i.type}\` | ${i.description} |`).join("\n")}

---

## Expected Outputs

- **Return Type**: \`${doc.output.type}\`
- **Description**: ${doc.output.description}

---

## Examples

${doc.examples.map((ex, idx) => `### Example ${idx + 1}

**Input:**
\`\`\`typescript
${ex.input}
\`\`\`

**Output:**
\`\`\`typescript
${ex.output}
\`\`\`
`).join("\n")}

---

## Related Functions & Modules

${doc.related.join(" • ")}

---

[Back to Table of Contents](_TOC.md)
`;

  fs.writeFileSync(path.join(docsDir, doc.file), md);
}

// Generate _TOC.md
// 1. Grouped by Source File
const bySourceFile = new Map<string, DocEntry[]>();
for (const d of docs) {
  if (!bySourceFile.has(d.sourceFile)) {
    bySourceFile.set(d.sourceFile, []);
  }
  bySourceFile.get(d.sourceFile)!.push(d);
}

const sourceFileSections = Array.from(bySourceFile.entries())
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([srcFile, entries]) => {
    const list = entries
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(e => `  - [\`${e.name}\`](${e.file}) — *${e.output.type}*`)
      .join("\n");
    return `### [\`${srcFile}\`](../../${srcFile})\n\n${list}`;
  })
  .join("\n\n");

// 2. Sorted Alphabetically by Exported Function
const alphaSorted = [...docs].sort((a, b) => a.name.localeCompare(b.name));
const alphaList = alphaSorted
  .map(e => `- [\`${e.name}\`](${e.file}) (defined in [\`${e.sourceFile}\`](../../${e.sourceFile}))`)
  .join("\n");

const tocMd = `# Code Documentation — Table of Contents

Welcome to the technical code documentation for the **Deterministic Algebra & Fraction Solver Engine**.

- [Back to Project README](../../README.md)
- [License (GPL v3)](../../LICENSE.md)

---

## Table of Contents by Source File

${sourceFileSections}

---

## Table of Contents (Alphabetical by Exported Function)

${alphaList}

---

[Back to Project README](../../README.md)
`;

fs.writeFileSync(path.join(docsDir, "_TOC.md"), tocMd);
console.log(`Generated ${docs.length} documentation files and _TOC.md successfully.`);

/**
 * Converts LaTeX math input into standard algebraic/arithmetic notation
 * that the internal CAS (AST, fraction solver, equation solver) can process.
 */

export function latexToAscii(rawInput: string): string {
  let s = rawInput.trim();
  if (!s) return "";

  // Strip leading and trailing math mode delimiters ($ or $$)
  s = s.replace(/^\$\$?/, "").replace(/\$\$?$/, "").trim();

  // Strip common display style commands
  s = s.replace(/\\displaystyle\b|\\textstyle\b/g, "");

  // Normalize delimiters \left( \right) etc.
  s = s.replace(/\\left\s*([([{])/g, "$1");
  s = s.replace(/\\right\s*([)\]}])/g, "$1");
  s = s.replace(/\\left\./g, "");
  s = s.replace(/\\right\./g, "");

  // Normalize spacing commands
  s = s.replace(/\\[,;!]|\\quad|\\qquad|\\enspace|~/g, " ");

  // Normalize operators
  s = s.replace(/\\cdot|\\times/g, " * ");
  s = s.replace(/\\div/g, " / ");

  // Unwrap \text{...}, \mathrm{...}, \mathbf{...}, \mathit{...}
  s = s.replace(/\\(text|mathrm|mathbf|mathit|textbf|textrm)\{([^}]*)\}/g, "$2");

  // Handle square roots: \sqrt{...} or \sqrt[n]{...}
  while (/\\sqrt\{/.test(s)) {
    s = s.replace(/\\sqrt\{([^{}]*)\}/g, "sqrt($1)");
  }

  // Recursive \frac parser
  s = replaceLatexFractions(s);

  // Exponents: x^{2} -> x^(2)
  s = s.replace(/\^{([^}]+)}/g, "^($1)");
  s = s.replace(/_{([^}]+)}/g, "_($1)");

  // Clean remaining braces { ... } -> ( ... )
  s = s.replace(/\{([^{}]+)\}/g, "($1)");

  // Remove any remaining stray backslashes
  s = s.replace(/\\/g, "");

  // Clean simple redundant outer parentheses: e.g. "((3x) / (6))" -> "3x / 6"
  s = cleanParens(s);

  return s.trim();
}

function extractBracedArg(sub: string): { arg: string; remainder: string } {
  const trimmed = sub.trim();
  if (trimmed.startsWith("{")) {
    let depth = 0;
    for (let i = 0; i < trimmed.length; i++) {
      if (trimmed[i] === "{") depth++;
      else if (trimmed[i] === "}") {
        depth--;
        if (depth === 0) {
          return { arg: trimmed.slice(1, i), remainder: trimmed.slice(i + 1) };
        }
      }
    }
    return { arg: trimmed.slice(1), remainder: "" };
  } else {
    // Single character or token without braces: e.g. \frac12
    return { arg: trimmed[0] || "", remainder: trimmed.slice(1) };
  }
}

function replaceLatexFractions(text: string): string {
  const idx = text.indexOf("\\frac");
  if (idx === -1) return text;

  const before = text.slice(0, idx);
  const rest = text.slice(idx + 5);

  const { arg: rawNum, remainder: r1 } = extractBracedArg(rest);
  const { arg: rawDen, remainder: r2 } = extractBracedArg(r1);

  const num = replaceLatexFractions(rawNum).trim();
  const den = replaceLatexFractions(rawDen).trim();

  // Determine if numerator or denominator need wrapping in parentheses
  const isSingleMonomial = (val: string) => /^-?\d*[a-zA-Z]?$/.test(val.trim()) || /^-?\d+$/.test(val.trim());
  const numPart = isSingleMonomial(num) ? num : `(${num})`;
  const denPart = isSingleMonomial(den) ? den : `(${den})`;

  // We wrap the whole fraction in parentheses if followed by an identifier/variable, or to preserve precedence
  const fractionStr = `(${numPart} / ${denPart})`;

  return before + fractionStr + replaceLatexFractions(r2);
}

function cleanParens(str: string): string {
  let s = str.trim();

  // Strip matching outer parentheses
  while (s.startsWith("(") && s.endsWith(")")) {
    let depth = 0;
    let matched = true;
    for (let i = 0; i < s.length - 1; i++) {
      if (s[i] === "(") depth++;
      else if (s[i] === ")") depth--;
      if (depth === 0) {
        matched = false;
        break;
      }
    }
    if (matched) {
      s = s.slice(1, -1).trim();
    } else {
      break;
    }
  }

  // If in format "A / B" with parentheses like "(3x) / (6)" or "((6x + 9)) / (3)"
  const fracMatch = s.match(/^\(([^()]+)\)\s*\/\s*\(([^()]+)\)$/);
  if (fracMatch) {
    const num = fracMatch[1].trim();
    const den = fracMatch[2].trim();
    const isSingleMonomial = (val: string) => /^-?\d*[a-zA-Z]?$/.test(val) || /^-?\d+$/.test(val);
    const numClean = isSingleMonomial(num) ? num : `(${num})`;
    const denClean = isSingleMonomial(den) ? den : `(${den})`;
    s = `${numClean} / ${denClean}`;
  }

  return s;
}

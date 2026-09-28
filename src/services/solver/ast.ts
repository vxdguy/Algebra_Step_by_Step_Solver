import { Fraction } from './fraction';
import { Polynomial } from './polynomial';

export type TokenType =
  | 'NUMBER'
  | 'VARIABLE'
  | 'PLUS'
  | 'MINUS'
  | 'STAR'
  | 'SLASH'
  | 'CARET'
  | 'LPAREN'
  | 'RPAREN'
  | 'EQUALS'
  | 'SQRT'
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const s = input.trim();

  while (i < s.length) {
    const ch = s[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (ch === '=') {
      tokens.push({ type: 'EQUALS', value: '=' });
      i++;
      continue;
    }

    if (ch === '+') {
      tokens.push({ type: 'PLUS', value: '+' });
      i++;
      continue;
    }

    if (ch === '-') {
      tokens.push({ type: 'MINUS', value: '-' });
      i++;
      continue;
    }

    if (ch === '*' || ch === '×' || ch === '•') {
      tokens.push({ type: 'STAR', value: '*' });
      i++;
      continue;
    }

    if (ch === '/' || ch === '÷') {
      tokens.push({ type: 'SLASH', value: '/' });
      i++;
      continue;
    }

    if (ch === '^') {
      tokens.push({ type: 'CARET', value: '^' });
      i++;
      continue;
    }

    if (ch === '(' || ch === '[' || ch === '{') {
      // Check for implicit multiplication before LPAREN: e.g. 3(x) or (x)(y) or x(x)
      if (tokens.length > 0) {
        const prev = tokens[tokens.length - 1];
        if (prev.type === 'NUMBER' || prev.type === 'VARIABLE' || prev.type === 'RPAREN') {
          tokens.push({ type: 'STAR', value: '*' });
        }
      }
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }

    if (ch === ')' || ch === ']' || ch === '}') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    // Number (integer or decimal)
    if (/\d/.test(ch) || (ch === '.' && i + 1 < s.length && /\d/.test(s[i + 1]))) {
      let numStr = '';
      while (i < s.length && (/[\d.]/.test(s[i]))) {
        numStr += s[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: numStr });
      continue;
    }

    // Identifiers: functions (like sqrt) or variables
    if (/[a-zA-Z]/.test(ch)) {
      let idStr = '';
      while (i < s.length && /[a-zA-Z]/.test(s[i])) {
        idStr += s[i];
        i++;
      }

      if (idStr.toLowerCase() === 'sqrt') {
        if (tokens.length > 0) {
          const prev = tokens[tokens.length - 1];
          if (prev.type === 'NUMBER' || prev.type === 'VARIABLE' || prev.type === 'RPAREN') {
            tokens.push({ type: 'STAR', value: '*' });
          }
        }
        tokens.push({ type: 'SQRT', value: 'sqrt' });
        continue;
      }

      // Check for multi-letter variable or separate single-letter variables:
      // In algebra, if someone writes "xy" it usually means "x * y", but let's treat single variable
      // Also check implicit multiplication: if preceded by NUMBER, RPAREN, or another VARIABLE
      for (let charIdx = 0; charIdx < idStr.length; charIdx++) {
        const v = idStr[charIdx];
        if (tokens.length > 0) {
          const prev = tokens[tokens.length - 1];
          if (prev.type === 'NUMBER' || prev.type === 'VARIABLE' || prev.type === 'RPAREN') {
            tokens.push({ type: 'STAR', value: '*' });
          }
        }
        tokens.push({ type: 'VARIABLE', value: v });
      }
      continue;
    }

    // Skip any unknown punctuation like comma or semicolon
    i++;
  }

  tokens.push({ type: 'EOF', value: '' });
  return tokens;
}

// AST Nodes
export type ASTNode =
  | { type: 'number'; value: Fraction }
  | { type: 'variable'; name: string }
  | { type: 'unary'; operator: '-' | '+'; argument: ASTNode }
  | { type: 'binary'; operator: '+' | '-' | '*' | '/' | '^'; left: ASTNode; right: ASTNode }
  | { type: 'sqrt'; argument: ASTNode };

export class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private current(): Token {
    return this.tokens[this.pos] || { type: 'EOF', value: '' };
  }

  private consume(expected?: TokenType): Token {
    const token = this.current();
    if (expected && token.type !== expected) {
      throw new Error(`Expected token ${expected} but got ${token.type} ('${token.value}')`);
    }
    this.pos++;
    return token;
  }

  parse(): ASTNode {
    const expr = this.parseExpression();
    if (this.current().type !== 'EOF' && this.current().type !== 'EQUALS') {
      throw new Error(`Unexpected token at position: ${this.current().value}`);
    }
    return expr;
  }

  // Expression: parse addition and subtraction
  private parseExpression(): ASTNode {
    let node = this.parseTerm();

    while (this.current().type === 'PLUS' || this.current().type === 'MINUS') {
      const op = this.consume().type === 'PLUS' ? '+' : '-';
      const right = this.parseTerm();
      node = { type: 'binary', operator: op, left: node, right };
    }

    return node;
  }

  // Term: parse multiplication and division
  private parseTerm(): ASTNode {
    let node = this.parsePower();

    while (this.current().type === 'STAR' || this.current().type === 'SLASH') {
      const op = this.consume().type === 'STAR' ? '*' : '/';
      const right = this.parsePower();
      node = { type: 'binary', operator: op, left: node, right };
    }

    return node;
  }

  // Power: right-associative power operator ^
  private parsePower(): ASTNode {
    const node = this.parseUnary();

    if (this.current().type === 'CARET') {
      this.consume('CARET');
      const right = this.parsePower(); // right-associative
      return { type: 'binary', operator: '^', left: node, right };
    }

    return node;
  }

  // Unary: - or +
  private parseUnary(): ASTNode {
    if (this.current().type === 'MINUS') {
      this.consume('MINUS');
      const arg = this.parsePower();
      return { type: 'unary', operator: '-', argument: arg };
    }
    if (this.current().type === 'PLUS') {
      this.consume('PLUS');
      return this.parsePower();
    }
    return this.parsePrimary();
  }

  // Primary: number, variable, sqrt, (expr)
  private parsePrimary(): ASTNode {
    const token = this.current();

    if (token.type === 'NUMBER') {
      this.consume('NUMBER');
      const val = token.value.includes('.')
        ? Fraction.fromNumber(parseFloat(token.value))
        : new Fraction(token.value);
      return { type: 'number', value: val };
    }

    if (token.type === 'VARIABLE') {
      this.consume('VARIABLE');
      return { type: 'variable', name: token.value };
    }

    if (token.type === 'SQRT') {
      this.consume('SQRT');
      if (this.current().type === 'LPAREN') {
        this.consume('LPAREN');
        const arg = this.parseExpression();
        this.consume('RPAREN');
        return { type: 'sqrt', argument: arg };
      } else {
        const arg = this.parsePrimary();
        return { type: 'sqrt', argument: arg };
      }
    }

    if (token.type === 'LPAREN') {
      this.consume('LPAREN');
      const expr = this.parseExpression();
      this.consume('RPAREN');
      return expr;
    }

    throw new Error(`Unexpected token '${token.value || token.type}'`);
  }
}

/**
 * Converts an ASTNode to LaTeX representation
 */
export function nodeToTex(node: ASTNode, parentPrecedence = 0): string {
  switch (node.type) {
    case 'number':
      return node.value.toTex();
    case 'variable':
      return node.name;
    case 'sqrt':
      return `\\sqrt{${nodeToTex(node.argument, 0)}}`;
    case 'unary': {
      const childTex = nodeToTex(node.argument, 4);
      return `-${childTex}`;
    }
    case 'binary': {
      const prec = getPrecedence(node.operator);
      let leftTex = nodeToTex(node.left, prec);
      let rightTex = nodeToTex(node.right, prec + (node.operator === '^' || node.operator === '-' || node.operator === '/' ? 1 : 0));

      let result = '';
      if (node.operator === '+') {
        result = `${leftTex} + ${rightTex}`;
      } else if (node.operator === '-') {
        result = `${leftTex} - ${rightTex}`;
      } else if (node.operator === '*') {
        // Pretty multiplication: omit * if between number and variable or parentheses
        if (
          (node.left.type === 'number' && node.right.type === 'variable') ||
          (node.left.type === 'number' && node.right.type === 'sqrt') ||
          (node.left.type === 'variable' && node.right.type === 'variable')
        ) {
          result = `${leftTex}${rightTex}`;
        } else {
          result = `${leftTex} \\cdot ${rightTex}`;
        }
      } else if (node.operator === '/') {
        return `\\frac{${leftTex}}{${rightTex}}`;
      } else if (node.operator === '^') {
        return `{${leftTex}}^{${rightTex}}`;
      }

      if (prec < parentPrecedence) {
        return `(${result})`;
      }
      return result;
    }
  }
}

function getPrecedence(op: string): number {
  if (op === '+' || op === '-') return 1;
  if (op === '*' || op === '/') return 2;
  if (op === '^') return 3;
  return 0;
}

/**
 * Convert AST to Polynomial if the AST represents a polynomial in variable
 */
export function astToPolynomial(node: ASTNode, targetVar = 'x'): Polynomial {
  switch (node.type) {
    case 'number':
      return Polynomial.constant(node.value, targetVar);

    case 'variable':
      if (node.name !== targetVar) {
        throw new Error(`Multiple variables detected: ${node.name} and ${targetVar}`);
      }
      return Polynomial.singleVar(targetVar, 1, 1);

    case 'unary':
      if (node.operator === '-') {
        return astToPolynomial(node.argument, targetVar).neg();
      }
      return astToPolynomial(node.argument, targetVar);

    case 'binary': {
      const leftPoly = astToPolynomial(node.left, targetVar);
      if (node.operator === '+') {
        return leftPoly.add(astToPolynomial(node.right, targetVar));
      }
      if (node.operator === '-') {
        return leftPoly.sub(astToPolynomial(node.right, targetVar));
      }
      if (node.operator === '*') {
        return leftPoly.mul(astToPolynomial(node.right, targetVar));
      }
      if (node.operator === '/') {
        if (node.right.type === 'number') {
          const inv = new Fraction(1n, 1n).div(node.right.value);
          return leftPoly.mul(Polynomial.constant(inv, targetVar));
        }
        throw new Error("Rational polynomials (division by variable) are not supported");
      }
      if (node.operator === '^') {
        if (node.right.type === 'number' && node.right.value.isInteger() && !node.right.value.isNegative()) {
          return leftPoly.pow(Number(node.right.value.num));
        }
        throw new Error("Only non-negative integer exponents supported on expressions with variables");
      }
      break;
    }

    case 'sqrt':
      // Only numerical sqrt
      if (node.argument.type === 'number') {
        const val = node.argument.value.toNumber();
        const sq = Math.sqrt(val);
        if (Number.isInteger(sq)) {
          return Polynomial.constant(sq, targetVar);
        }
      }
      throw new Error("Square root of variables cannot be converted to polynomial");
  }

  throw new Error("Unsupported AST expression for polynomial conversion");
}

/**
 * Find all variables used in AST
 */
export function findVariables(node: ASTNode): string[] {
  const vars = new Set<string>();
  function walk(n: ASTNode) {
    if (n.type === 'variable') {
      vars.add(n.name);
    } else if (n.type === 'unary') {
      walk(n.argument);
    } else if (n.type === 'binary') {
      walk(n.left);
      walk(n.right);
    } else if (n.type === 'sqrt') {
      walk(n.argument);
    }
  }
  walk(node);
  return Array.from(vars);
}

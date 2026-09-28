# Deterministic Pre-Algebra & Algebra Solver Engine

A 100% programmatic Computer Algebra System (CAS) and step-by-step math solver designed for **pre-algebra and algebra students**. The engine generates transparent, textbook-grade pedagogical explanations for fraction operations, linear and quadratic equations, polynomial simplifications, and multi-variable algebraic systems with dependencies.

---

## 🎯 Project Goal

The goal of this application is to solve math problems in a step-by-step fashion for pre-algebra and algebra students. 

Unlike black-box AI calculators or decimal approximations, this engine uses a deterministic, rule-based CAS implemented in pure TypeScript. It explains the exact algebraic steps taught in middle school and high school curricula—such as finding Least Common Denominators (LCD), clearing fractions, applying the distributive property, isolating variables, factoring, and solving multi-variable substitution systems.

---

## ✨ Features

- **Exact Fraction Arithmetic & Reduction**:
  - Greatest Common Divisor ($\gcd$) calculation via the Euclidean algorithm
  - Least Common Denominators ($\text{LCD}$) for addition & subtraction:
    $$\frac{1}{2} + \frac{2}{3} = \frac{3}{6} + \frac{4}{6} = \frac{7}{6} = 1\frac{1}{6}$$
  - Prime factorization breakdowns, common factor cancellations, and mixed numbers.
- **Linear & Quadratic Equation Solver**:
  - Clearing fractional denominators in Step 1 using $\text{LCD}$
  - Isolating variable terms and constants step-by-step
  - Exact radical simplification ($a\sqrt{b}$) for quadratic roots:
    $$x^2 - 48 = 0 \implies x = \pm 4\sqrt{3}$$
- **Multi-Variable System Dependency Resolution**:
  - Solves interdependent variable systems (e.g. $x = \frac{2y}{3}$, $y = \frac{21}{z}$, $z = 3$) topologically
  - Restates all solved numerical values before substituting into target expressions
  - Progressively builds multi-line evaluation chains line-by-line:
    $$\begin{aligned}
    2x + 3y + 4z &= 2\left(\frac{14}{3}\right) + 3(7) + 4(3) \\
    2\left(\frac{14}{3}\right) + 3(7) + 4(3) &= \frac{28}{3} + 21 + 12 \\
    \frac{28}{3} + 21 + 12 &= \frac{127}{3}
    \end{aligned}$$
- **Real-Time LaTeX Math Preview**:
  - Instant live rendering via KaTeX
  - Seamless support for both raw LaTeX syntax (e.g. `\frac{3x}{6}`) and standard ASCII notation (e.g. `21/z`, `2^3/5`)
- **Interactive History**:
  - Stores user problems verbatim without alignment alteration
  - Renders exact LaTeX mathematical answers on history cards

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### Development Environment Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/danmelton/algebra-solver-engine.git
   cd algebra-solver-engine
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` (optional, no external API keys required):
   ```bash
   cp .env.example .env
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

### Building for Production

To create an optimized production build:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

To run TypeScript type checks and linting:
```bash
npm run lint
```

---

## 📚 Code Architecture & Documentation

Comprehensive, module-by-module technical documentation for every exported function and class is available in the [`/docs/code/`](docs/code/) directory:

- 📖 **[Code Documentation Table of Contents](docs/code/_TOC.md)**
- Core Modules:
  - **[solveAlgebra](docs/code/solveAlgebra.md)**: Main CAS orchestrator and entry point.
  - **[Fraction](docs/code/Fraction.md)**: BigInt-based rational number class.
  - **[solveEquation](docs/code/solveEquation.md)**: Linear and quadratic equation solver.
  - **[solveVariableEvaluation](docs/code/solveVariableEvaluation.md)**: Multi-variable dependency solver.
  - **[solveFractionArithmetic](docs/code/solveFractionArithmetic.md)**: Fraction LCD arithmetic engine.
  - **[reduceSingleFraction](docs/code/reduceSingleFraction.md)**: Single fraction reduction & factorization.
  - **[Polynomial](docs/code/Polynomial.md)**: Symbolic single-variable polynomial arithmetic.
  - **[toDisplayLatex](docs/code/toDisplayLatex.md)**: AST-driven LaTeX formatter.

---

## 📄 License & Copyright

Copyright (c) 2026 Dan Melton, all rights reserved.

Source code is licensed under the GPL v3 project, refer to [LICENSE.md](LICENSE.md) for the complete license.

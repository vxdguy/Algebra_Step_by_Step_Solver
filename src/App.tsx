/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  ChevronRight, 
  History, 
  Trash2, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Cpu,
  ArrowRight,
  Eye
} from 'lucide-react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import katex from 'katex';
import { solveAlgebra, SolverResult } from './services/algebraSolver';

function renderLatexPreview(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  let previewTex = trimmed;
  // If user entered command prefixes like "factor x^2 - 5x + 6", "simplify \frac{3x}{6}"
  const cmdMatch = previewTex.match(/^(factor|simplify|solve|reduce)\s+(.*)$/i);
  if (cmdMatch) {
    previewTex = `\\text{${cmdMatch[1]} } ` + cmdMatch[2];
  }

  try {
    return katex.renderToString(previewTex, {
      displayMode: true,
      throwOnError: false,
      strict: false
    });
  } catch {
    return `<span class="text-zinc-400 font-mono text-xs">${trimmed}</span>`;
  }
}

export default function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SolverResult | null>(null);
  const [history, setHistory] = useState<SolverResult[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSolve = async (e?: React.FormEvent, customInput?: string) => {
    if (e) e.preventDefault();
    const targetExpr = customInput !== undefined ? customInput : input;
    if (!targetExpr.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const solution = await solveAlgebra(targetExpr);
      setResult(solution);
      setHistory(prev => {
        const filtered = prev.filter(p => p.expression !== solution.expression);
        return [solution, ...filtered.slice(0, 8)];
      });
      if (customInput === undefined) {
        setInput('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);

  const clearHistory = () => setHistory([]);

  const exampleCategories = [
    {
      category: "Fraction Reduction",
      examples: ["10/2", "\\frac{3x}{6}", "11/3", "12/8", "\\frac{6x + 9}{3}"]
    },
    {
      category: "Fraction Arithmetic (LCD)",
      examples: ["\\frac{1}{2} + \\frac{2}{3}", "5/6 - 1/4", "\\frac{2}{3} \\cdot \\frac{5}{4}", "3/4 \\div 2/5"]
    },
    {
      category: "Linear Equations",
      examples: ["2x + 5 = 15", "\\frac{x}{3} + 4 = 9", "\\frac{2}{3}x + \\frac{1}{4} = \\frac{5}{6}", "\\frac{x + 2}{3} = 4"]
    },
    {
      category: "Quadratic & Proportions",
      examples: ["x^2 - 5x + 6 = 0", "\\frac{x + 2}{3} = \\frac{2x - 1}{5}", "\\sqrt{16} + 2^3"]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-10 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Calculator size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg tracking-tight">Algebro</h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <Cpu size={11} /> Programmatic Engine
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Step-by-Step CAS Solver</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button 
                onClick={clearHistory}
                className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                title="Clear History"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Input & History */}
          <div className="lg:col-span-1 space-y-6">
            <section className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-2">
                  <Calculator size={15} className="text-zinc-500" />
                  Algebra Input
                </h2>
                <span className="text-xs text-zinc-400 font-mono">LaTeX Supported</span>
              </div>
              <form onSubmit={handleSolve} className="space-y-4">
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g., \frac{3x}{6} or 2x + 5 = 15 or \frac{1}{2} + \frac{2}{3}"
                    className="w-full h-28 p-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all resize-none font-mono text-sm leading-relaxed"
                    disabled={loading}
                  />
                </div>

                {/* Live LaTeX Preview between input and solve button */}
                <div className="bg-zinc-50/80 border border-zinc-200 rounded-xl p-3">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 font-semibold uppercase tracking-wider mb-1.5 px-1">
                    <span className="flex items-center gap-1.5">
                      <Eye size={13} className="text-zinc-400" />
                      LaTeX Preview
                    </span>
                    {input.trim() ? (
                      <span className="text-[10px] text-emerald-600 font-mono font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Live
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-400 font-normal">Waiting for input</span>
                    )}
                  </div>
                  
                  <div className="min-h-[50px] bg-white border border-zinc-200/90 rounded-lg p-2 flex items-center justify-center overflow-x-auto text-zinc-800">
                    {input.trim() ? (
                      <div 
                        className="katex-preview text-base max-w-full"
                        dangerouslySetInnerHTML={{ __html: renderLatexPreview(input) }}
                      />
                    ) : (
                      <span className="text-xs text-zinc-400 italic">
                        Formatted math preview appears here as you type
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="w-full bg-zinc-900 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      Solve Step-by-Step
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </section>

            {/* Quick Presets */}
            <section className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Example Problems (Click to Test)
              </h3>
              <div className="space-y-3">
                {exampleCategories.map((cat, cIdx) => (
                  <div key={cIdx} className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      {cat.category}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.examples.map((ex, eIdx) => (
                        <button
                          key={eIdx}
                          onClick={() => {
                            setInput(ex);
                            handleSolve(undefined, ex);
                          }}
                          className="px-2.5 py-1 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-mono text-zinc-700 hover:text-zinc-900 transition-colors"
                        >
                          {ex}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {history.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2 px-2">
                  <History size={14} />
                  Recent Solves
                </h2>
                <div className="space-y-2">
                  {history.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setResult(item)}
                      className="w-full text-left p-4 bg-white border border-zinc-200 rounded-xl hover:border-zinc-400 transition-all group shadow-xs"
                    >
                      <p className="font-mono text-sm truncate text-zinc-600 mb-1">{item.expression}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900">Answer: {item.finalAnswer}</span>
                        <ChevronRight size={14} className="text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Solution Display */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white border border-zinc-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4"
                >
                  <div className="relative">
                    <Loader2 className="animate-spin text-zinc-900" size={48} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Cpu size={16} className="text-zinc-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">Computing Solution</h3>
                    <p className="text-zinc-500 max-w-xs mx-auto">Applying algebraic transformation rules and generating steps...</p>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-100 rounded-2xl p-8 flex items-start gap-4"
                >
                  <AlertCircle className="text-red-500 shrink-0" size={24} />
                  <div>
                    <h3 className="font-bold text-red-900">Syntax or Solver Error</h3>
                    <p className="text-red-700">{error}</p>
                    <button 
                      onClick={() => setError(null)}
                      className="mt-4 text-sm font-semibold text-red-900 underline underline-offset-4"
                    >
                      Try again
                    </button>
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div
                  ref={resultRef}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Result Header */}
                  <div className="bg-zinc-900 text-white rounded-2xl p-8 shadow-lg overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Calculator size={120} />
                    </div>
                    <div className="relative z-10">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400">Solution Found</span>
                      <div className="text-3xl font-mono mt-2 mb-6 break-words markdown-body invert-math">
                        <Markdown 
                          remarkPlugins={[remarkMath]} 
                          rehypePlugins={[rehypeKatex]}
                        >
                          {`$$${result.expression}$$`}
                        </Markdown>
                      </div>
                      <div className="flex items-center gap-3 bg-white/10 w-fit px-4 py-2 rounded-lg border border-white/10">
                        <CheckCircle2 size={20} className="text-emerald-400" />
                        <div className="text-xl font-bold markdown-body invert-math">
                          <Markdown 
                            remarkPlugins={[remarkMath]} 
                            rehypePlugins={[rehypeKatex]}
                          >
                            {`Answer: $${result.finalAnswer}$`}
                          </Markdown>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider px-2">Step-by-Step Breakdown</h3>
                    {result.steps.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:border-zinc-300 transition-all"
                      >
                        <div className="flex items-center gap-4 p-4 border-b border-zinc-100 bg-zinc-50/50">
                          <span className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {index + 1}
                          </span>
                          <div className="font-bold text-zinc-900 text-sm markdown-body">
                            <Markdown 
                              remarkPlugins={[remarkMath]} 
                              rehypePlugins={[rehypeKatex]}
                            >
                              {step.title}
                            </Markdown>
                          </div>
                        </div>
                        <div className="p-6 space-y-4">
                          <div className="text-zinc-600 leading-relaxed markdown-body">
                            <Markdown 
                              remarkPlugins={[remarkMath]} 
                              rehypePlugins={[rehypeKatex]}
                            >
                              {step.explanation}
                            </Markdown>
                          </div>
                          <div className="math-display">
                            <div className="markdown-body">
                              <Markdown 
                                remarkPlugins={[remarkMath]} 
                                rehypePlugins={[rehypeKatex]}
                              >
                                {`$$${step.math}$$`}
                              </Markdown>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Final Conclusion */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-900">Final Result Verified</h4>
                      <div className="text-emerald-700 text-sm flex items-center gap-1 flex-wrap">
                        <span>The expression has been solved completely. Final value is</span>
                        <div className="inline-block font-bold markdown-body">
                          <Markdown 
                            remarkPlugins={[remarkMath]} 
                            rehypePlugins={[rehypeKatex]}
                          >
                            {`$${result.finalAnswer}$`}
                          </Markdown>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white border border-dashed border-zinc-300 rounded-2xl p-16 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300">
                    <Calculator size={40} />
                  </div>
                  <div className="max-w-md">
                    <h3 className="font-bold text-xl text-zinc-900">Pre-Algebra &amp; Fraction Engine</h3>
                    <p className="text-zinc-500 mt-2 text-sm">
                      Supports standard algebra notation and raw LaTeX. Reduce fractions, compute with LCDs, and solve step-by-step equations.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                    {['\\frac{3x}{6}', '\\frac{10}{2}', '11/3', '\\frac{1}{2} + \\frac{2}{3}', '2x + 5 = 15', '\\frac{x + 2}{3} = 4'].map(ex => (
                      <button
                        key={ex}
                        onClick={() => {
                          setInput(ex);
                          handleSolve(undefined, ex);
                        }}
                        className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-xs font-medium text-zinc-700 transition-colors font-mono"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-6 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-zinc-400 text-xs">
            100% Programmatic CAS Algebra Engine • LaTeX Supported • Real-Time Math Preview
          </p>
        </div>
      </footer>
    </div>
  );
}

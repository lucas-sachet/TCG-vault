'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface TrainerLabAiPanelProps {
  collectionSummary: string;
}

export function TrainerLabAiPanel({ collectionSummary }: TrainerLabAiPanelProps) {
  const [prompt, setPrompt] = useState('Analyze my collection strengths and suggest next acquisitions.');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleAnalyze() {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/trainer-lab/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          context: collectionSummary,
        }),
      });

      const payload = await response.json() as { analysis?: string; error?: string };
      if (!response.ok) {
        throw new Error(payload.error || 'Trainer Lab analysis failed');
      }

      setAnalysis(payload.analysis ?? 'No analysis returned.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Trainer Lab analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <section className="bg-[#1A1D24] border border-slate-800 rounded-2xl p-5 space-y-4" aria-labelledby="trainer-lab-ai-title">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#FFCB05]" aria-hidden="true" />
        <h3 id="trainer-lab-ai-title" className="text-sm font-bold text-white uppercase font-mono">
          AI Collection Advisor
        </h3>
      </div>

      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        className="w-full min-h-24 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
        aria-label="Trainer Lab analysis prompt"
      />

      <button
        type="button"
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        className="btn-primary w-full sm:w-auto"
      >
        {isAnalyzing ? 'Analyzing...' : 'Run Gemini Analysis'}
      </button>

      {errorMessage && (
        <p className="text-xs text-red-400" role="alert">{errorMessage}</p>
      )}

      {analysis && (
        <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 border border-slate-800 rounded-xl p-4 whitespace-pre-wrap">
          {analysis}
        </div>
      )}
    </section>
  );
}

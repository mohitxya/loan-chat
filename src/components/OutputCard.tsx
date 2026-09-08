import React from 'react';
import { ConfidenceLevel } from '../rules/types';
import { ConfidenceBadge } from './ConfidenceBadge';

interface OutputCardProps {
  id: string;
  outputCode: 'O1' | 'O2' | 'O3' | 'O4';
  title: string;
  subtitle: string;
  valueDisplay: React.ReactNode;
  confidence: ConfidenceLevel;
  tighteningHint: string;
  statusSummary?: React.ReactNode;
  reason: string;
  accentColor?: 'emerald' | 'amber' | 'rose' | 'indigo';
}

export const OutputCard: React.FC<OutputCardProps> = ({
  id,
  outputCode,
  title,
  subtitle,
  valueDisplay,
  confidence,
  tighteningHint,
  statusSummary,
  reason,
  accentColor = 'indigo',
}) => {
  const borderThemes = {
    emerald: 'border-emerald-200 bg-white hover:border-emerald-300',
    amber: 'border-amber-200 bg-white hover:border-amber-300',
    rose: 'border-rose-200 bg-white hover:border-rose-300',
    indigo: 'border-indigo-200 bg-white hover:border-indigo-300',
  }[accentColor];

  const codeBadgeThemes = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  }[accentColor];

  return (
    <div
      id={id}
      className={`rounded-2xl border ${borderThemes} p-5 shadow-sm transition-all duration-200 space-y-3.5`}
    >
      {/* Top Header: Code, Title, Confidence Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`px-2 py-0.5 rounded-md border text-xs font-bold font-mono ${codeBadgeThemes}`}
          >
            {outputCode}
          </span>
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">{title}</h3>
            <p className="text-[11px] text-slate-500">{subtitle}</p>
          </div>
        </div>

        <ConfidenceBadge level={confidence} tighteningHint={tighteningHint} size="sm" />
      </div>

      {/* Main Big Value Display */}
      <div>{valueDisplay}</div>

      {/* Current Analysis Status (Plain Language) */}
      {statusSummary && (
        <div className="text-xs text-slate-700 font-medium leading-relaxed">
          {statusSummary}
        </div>
      )}

      {/* Plain Rule Reason */}
      <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
        <div className="text-xs text-slate-700 leading-relaxed flex items-start gap-2">
          <span className="font-bold text-slate-900 shrink-0">Rule Reason:</span>
          <span>{reason}</span>
        </div>
      </div>
    </div>
  );
};

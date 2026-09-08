import React, { useState } from 'react';
import { ConfidenceLevel } from '../rules/types';
import { ShieldCheck, ShieldAlert, Shield, Info } from 'lucide-react';

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  tighteningHint?: string;
  size?: 'sm' | 'md';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  level,
  tighteningHint,
  size = 'md',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const config = {
    High: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      icon: ShieldCheck,
      label: 'High Confidence',
    },
    Medium: {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      dot: 'bg-indigo-500',
      icon: Shield,
      label: 'Medium Confidence',
    },
    Low: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      icon: ShieldAlert,
      label: 'Low Confidence',
    },
  }[level];

  const Icon = config.icon;

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold transition-all ${config.bg} hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400`}
        aria-label={`${config.label}: ${tighteningHint || ''}`}
      >
        <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>{level} Confidence</span>
        <Info className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {showTooltip && tighteningHint && (
        <div className="absolute z-30 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${config.dot}`} />
            {config.label}
          </div>
          <p className="text-slate-300 leading-relaxed">{tighteningHint}</p>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
};

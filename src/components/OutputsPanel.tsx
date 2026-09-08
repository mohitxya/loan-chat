import React from 'react';
import { useSession } from '../state/sessionStore';
import { OutputCard } from './OutputCard';
import { formatRupees, formatRateBand } from '../rules/formatters';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  AlertOctagon,
  Printer,
} from 'lucide-react';

export const OutputsPanel: React.FC = () => {
  const { results, setActiveView } = useSession();
  const { o1, o2, o3, o4 } = results;

  // Verdict theme mapping
  const verdictTheme = {
    BORROW: {
      color: 'emerald' as const,
      icon: CheckCircle2,
      badge: 'bg-emerald-500 text-white',
      textColor: 'text-emerald-700',
      statusText: 'Current Status: Cleared to Borrow',
    },
    BORROW_LESS: {
      color: 'amber' as const,
      icon: AlertTriangle,
      badge: 'bg-amber-500 text-white',
      textColor: 'text-amber-700',
      statusText: 'Current Status: Request Exceeds Safe Buffer',
    },
    DONT_BORROW: {
      color: 'rose' as const,
      icon: XCircle,
      badge: 'bg-rose-500 text-white',
      textColor: 'text-rose-700',
      statusText: 'Current Status: High Risk of Cashflow Default',
    },
  }[o1.verdict];

  const VerdictIcon = verdictTheme.icon;

  return (
    <div className="space-y-4">
      {/* Top Banner with Quick Summary */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Current Loan Analysis
          </h2>
          <p className="text-xs text-slate-500">
            Real-time status based on what you have answered so far
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveView('negotiation_card')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Negotiation Card</span>
        </button>
      </div>

      {/* O1: Verdict */}
      <OutputCard
        id="card-o1-verdict"
        outputCode="O1"
        title="Borrowing Verdict"
        subtitle="Unbiased decision support"
        confidence={o1.confidence}
        tighteningHint={o1.tighteningHint}
        reason={o1.reason}
        accentColor={verdictTheme.color}
        statusSummary={
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <span className={`w-2 h-2 rounded-full ${o1.verdict === 'BORROW' ? 'bg-emerald-500' : o1.verdict === 'BORROW_LESS' ? 'bg-amber-500' : 'bg-rose-500'}`} />
            <span>{verdictTheme.statusText}</span>
          </div>
        }
        valueDisplay={
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${verdictTheme.badge} shadow-sm`}>
              <VerdictIcon className="w-7 h-7" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 block">
                {o1.label}
              </span>
              <span className={`text-xs font-semibold ${verdictTheme.textColor}`}>
                {o1.verdict === 'BORROW'
                  ? 'Your requested loan fits inside your safe monthly cashflow.'
                  : o1.verdict === 'BORROW_LESS'
                  ? 'Your requested amount exceeds your safe monthly buffer.'
                  : 'Existing living costs and debt consume available income.'}
              </span>
            </div>
          </div>
        }
      />

      {/* O2: Maximum Amount */}
      <OutputCard
        id="card-o2-amount"
        outputCode="O2"
        title="Maximum Amount"
        subtitle="Lender likely vs Safe to carry"
        confidence={o2.confidence}
        tighteningHint={o2.tighteningHint}
        reason={o2.reason}
        accentColor="indigo"
        statusSummary={
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <span className="font-bold text-slate-900 block mb-0.5">
              Current Recommendation:{' '}
              {o2.recommendation === 'safe_to_carry' ? 'Follow Safe Capacity' : 'Lender Limit Applies'}
            </span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {o2.recommendationReason}
            </p>
          </div>
        }
        valueDisplay={
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Lender Likely Sanction
              </span>
              <span className="text-xl font-black text-slate-900 block mt-0.5">
                {formatRupees(o2.lenderLikelyAmount)}
              </span>
              <span className="text-[10px] text-slate-500">What a bank would typically approve</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Safe To Carry
              </span>
              <span className="text-xl font-black text-emerald-700 block mt-0.5">
                {formatRupees(o2.safeToCarryAmount)}
              </span>
              <span className="text-[10px] text-emerald-700 font-medium">What your family budget can handle</span>
            </div>
          </div>
        }
      />

      {/* O3: Fair Interest Rate & APR */}
      <OutputCard
        id="card-o3-rates"
        outputCode="O3"
        title="Fair Interest Rate"
        subtitle={`${o3.productLabel} market benchmark`}
        confidence={o3.confidence}
        tighteningHint={o3.tighteningHint}
        reason={o3.reason}
        accentColor={o3.isPredatoryTerritory ? 'rose' : 'indigo'}
        statusSummary={
          o3.isPredatoryTerritory ? (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> {o3.existingDebtComparison || 'Current debt is in predatory territory (>24% APR).'}
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-900">Current benchmark:</span> Compare quoted lender rates against the {formatRateBand(o3.minNominalRate, o3.maxNominalRate)} band.
            </div>
          )
        }
        valueDisplay={
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Fair Interest Rate
              </span>
              <span className="text-xl font-black text-slate-900 block mt-0.5">
                {formatRateBand(o3.minNominalRate, o3.maxNominalRate)}
              </span>
              <span className="text-[10px] text-slate-500">Nominal annual rate</span>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200">
              <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block">
                All-In APR Band
              </span>
              <span className="text-xl font-black text-indigo-700 block mt-0.5">
                {formatRateBand(o3.minApr, o3.maxApr)}
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">Includes 1.5% fee + insurance</span>
            </div>
          </div>
        }
      />

      {/* O4: EMI Ceiling & Stress Test */}
      <OutputCard
        id="card-o4-emi"
        outputCode="O4"
        title="Safe Monthly EMI Ceiling"
        subtitle="Affordability & stress check"
        confidence={o4.confidence}
        tighteningHint={o4.tighteningHint}
        reason={o4.reason}
        accentColor="indigo"
        statusSummary={
          <div
            className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 ${
              o4.stressCase.survivesStress
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {o4.stressCase.survivesStress ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            )}
            <div>
              <span className="font-bold block">
                Stress Check ({o4.stressCase.shockValue}): {o4.stressCase.survivesStress ? 'Passed' : 'At Risk'}
              </span>
              <span className="text-[11px] leading-relaxed block mt-0.5 opacity-90">
                {o4.stressCase.stressVerdict}
              </span>
            </div>
          </div>
        }
        valueDisplay={
          <div className="p-3.5 rounded-xl bg-slate-900 text-white flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold block">
                Safe Monthly EMI Limit
              </span>
              <span className="text-2xl font-black text-white">
                {formatRupees(o4.maxSafeEmi)}
                <span className="text-xs font-normal text-slate-400"> / month</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Bank FOIR Cap
              </span>
              <span className="text-sm font-bold text-slate-200">
                {formatRupees(o4.lenderMaxEmi)}/mo
              </span>
            </div>
          </div>
        }
      />
    </div>
  );
};

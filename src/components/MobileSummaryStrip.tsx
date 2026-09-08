import React from 'react';
import { useSession } from '../state/sessionStore';
import { formatRupeesShort } from '../rules/formatters';
import { ChevronRight } from 'lucide-react';

export const MobileSummaryStrip: React.FC = () => {
  const { results, mobileTab, setMobileTab, activeView } = useSession();
  const { o1, o4 } = results;

  if (activeView === 'negotiation_card') return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900 text-white border-t border-slate-800 shadow-2xl p-3 pb-safe">
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        <div
          onClick={() => setMobileTab(mobileTab === 'numbers' ? 'question' : 'numbers')}
          className="cursor-pointer flex-1 flex items-center justify-between bg-slate-800/80 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700/60 transition-all"
        >
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
              Safe EMI Ceiling
            </span>
            <span className="text-sm font-bold text-white block">
              {formatRupeesShort(o4.maxSafeEmi)}/mo ·{' '}
              <span
                className={
                  o1.verdict === 'BORROW'
                    ? 'text-emerald-400'
                    : o1.verdict === 'BORROW_LESS'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }
              >
                {o1.label}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-indigo-300 font-semibold">
            <span>{mobileTab === 'numbers' ? 'Back' : 'View'}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Tab switcher buttons */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => setMobileTab('question')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mobileTab === 'question'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Questions
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('numbers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mobileTab === 'numbers'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Outputs
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useSession } from '../state/sessionStore';
import { ShieldCheck, FileText, RotateCcw, Sparkles, HelpCircle } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeView,
    setActiveView,
    loadPreset,
    resetSession,
    setShowDebugModal,
  } = useSession();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 backdrop-blur-md bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">Borrower Copilot</span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  India
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Unbiased, rules-based credit & sanction decision engine
              </p>
            </div>
          </div>

          {/* Persona Quick Switcher */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="px-2 text-slate-500 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Presets:
            </span>
            <button
              onClick={() => loadPreset('priya')}
              className="px-2.5 py-1 rounded-lg font-medium transition-all bg-white hover:bg-slate-50 text-slate-700 shadow-sm border border-slate-200/60 hover:text-indigo-600"
              title="Priya: Salaried engineer, ₹8L wedding loan, 780 score"
            >
              Priya (Salaried)
            </button>
            <button
              onClick={() => loadPreset('ravi')}
              className="px-2.5 py-1 rounded-lg font-medium transition-all bg-white hover:bg-slate-50 text-slate-700 shadow-sm border border-slate-200/60 hover:text-indigo-600"
              title="Ravi: Kirana store owner, shop property collateral, ₹15L ask"
            >
              Ravi (Kirana)
            </button>
            <button
              onClick={() => loadPreset('anita')}
              className="px-2.5 py-1 rounded-lg font-medium transition-all bg-white hover:bg-slate-50 text-slate-700 shadow-sm border border-slate-200/60 hover:text-indigo-600"
              title="Anita: Gig worker, app loan debt, recent bounce"
            >
              Anita (Gig)
            </button>
            <button
              onClick={resetSession}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white transition-all ml-1"
              title="Reset questionnaire"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Action Affordances */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDebugModal(true)}
              className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all"
              title="View Adaptive Decision Logic Tree"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Logic Tree</span>
            </button>

            <button
              onClick={() =>
                setActiveView(activeView === 'questionnaire' ? 'negotiation_card' : 'questionnaire')
              }
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${
                activeView === 'negotiation_card'
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{activeView === 'questionnaire' ? 'Negotiation Card' : 'Back to Questions'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

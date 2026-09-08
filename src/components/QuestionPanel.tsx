import React from 'react';
import { useSession } from '../state/sessionStore';
import { CurrencyInput } from './CurrencyInput';
import {
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Check,
  CheckCircle2,
  Eye,
} from 'lucide-react';

export const QuestionPanel: React.FC = () => {
  const {
    currentQuestion,
    answers,
    setAnswer,
    setMultipleAnswers,
    goToNext,
    goToPrevious,
    history,
    stats,
    setActiveView,
    setMobileTab,
  } = useSession();

  if (!currentQuestion) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Questionnaire Complete</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          All applicable profile questions have been evaluated. Your decision model is calibrated at maximum confidence.
        </p>
        <button
          onClick={() => setActiveView('negotiation_card')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-all text-sm"
        >
          <span>View Negotiation Card</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const handleSelectOption = (value: any) => {
    setAnswer(currentQuestion.id as any, value);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between min-h-[520px]">
      <div className="space-y-6">
        {/* Progress Bar & Header */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span className="flex items-center gap-1.5 font-semibold text-indigo-700">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              Question {stats.answeredCount + 1} of ~{stats.totalApplicableCount}
              <span className="text-slate-400 font-normal hidden sm:inline">(adaptive)</span>
            </span>
            <span className="font-mono font-bold text-slate-700">{stats.percentage}% calibrated</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(8, stats.percentage)}%` }}
            />
          </div>
        </div>

        {/* Question Title & Description */}
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            {currentQuestion.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {currentQuestion.helpText}
          </p>
        </div>

        {/* Question Input Formats */}
        <div className="pt-2">
          {/* 1. SELECT / RADIO CARDS */}
          {currentQuestion.type === 'select' && currentQuestion.options && (
            <div className="grid grid-cols-1 gap-2.5">
              {currentQuestion.options.map((opt) => {
                const isSelected = answers[currentQuestion.id as keyof typeof answers] === opt.value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => handleSelectOption(opt.value)}
                    className={`flex items-start justify-between p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20 text-indigo-950 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-800'
                    }`}
                  >
                    <div className="space-y-0.5 pr-3">
                      <div className="font-semibold text-sm flex items-center gap-2">
                        <span>{opt.label}</span>
                        {opt.badge && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.sublabel && (
                        <p className="text-xs text-slate-500 leading-normal">{opt.sublabel}</p>
                      )}
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. CURRENCY INPUT */}
          {currentQuestion.type === 'currency' && (
            <CurrencyInput
              id={`input-${currentQuestion.id}`}
              value={answers[currentQuestion.id as keyof typeof answers] as number}
              onChange={(val) => setAnswer(currentQuestion.id as any, val)}
              min={currentQuestion.min}
              max={currentQuestion.max}
              step={currentQuestion.step}
              placeholder={currentQuestion.placeholder}
            />
          )}

          {/* 3. CURRENCY RANGE INPUT (FOR INFORMAL/SELF-EMPLOYED) */}
          {currentQuestion.type === 'currency_range' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Worst Month (Minimum ₹)
                  </label>
                  <CurrencyInput
                    id="input-income-min"
                    value={answers.incomeMin}
                    onChange={(val) => {
                      setAnswer('incomeMin', val);
                      if (answers.incomeMax && val) {
                        setAnswer('monthlyIncome', Math.round((val + answers.incomeMax) / 2));
                      }
                    }}
                    placeholder="e.g. 26,000"
                    quickAmounts={[20000, 30000, 40000, 50000]}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Peak Month (Maximum ₹)
                  </label>
                  <CurrencyInput
                    id="input-income-max"
                    value={answers.incomeMax}
                    onChange={(val) => {
                      setAnswer('incomeMax', val);
                      if (answers.incomeMin && val) {
                        setAnswer('monthlyIncome', Math.round((answers.incomeMin + val) / 2));
                      }
                    }}
                    placeholder="e.g. 40,000"
                    quickAmounts={[30000, 50000, 80000, 100000]}
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                Our rule engine anchors your safe borrowing line conservatively to protect during lean months.
              </p>
            </div>
          )}

          {/* 4. CREDIT SCORE (WITH UNKNOWN OPTION) */}
          {currentQuestion.type === 'credit_score' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMultipleAnswers({
                      creditScoreKnown: true,
                      creditScore: answers.creditScore || 750,
                    });
                  }}
                  className={`p-3 rounded-xl border text-center font-semibold text-xs transition-all ${
                    answers.creditScoreKnown !== false && answers.creditScore !== null
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  I Know My Credit Score
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMultipleAnswers({
                      creditScoreKnown: false,
                      creditScore: null,
                    });
                  }}
                  className={`p-3 rounded-xl border text-center font-semibold text-xs transition-all ${
                    answers.creditScoreKnown === false
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  I Do Not Know / No Score
                </button>
              </div>

              {answers.creditScoreKnown !== false && (
                <div className="space-y-2 pt-2">
                  <div className="relative">
                    <input
                      type="number"
                      id="input-credit-score"
                      min={300}
                      max={900}
                      value={answers.creditScore || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setMultipleAnswers({
                          creditScoreKnown: true,
                          creditScore: isNaN(val) ? null : val,
                        });
                      }}
                      placeholder="e.g. 780"
                      className="block w-full rounded-xl border border-slate-300 py-3.5 px-4 text-lg font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 px-1 font-medium">
                    <span>300 (Subprime)</span>
                    <span className="text-indigo-600 font-semibold">750+ (Prime Band)</span>
                    <span>900 (Excellent)</span>
                  </div>
                </div>
              )}

              {answers.creditScoreKnown === false && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                  <strong>Fair Disclosure Rule:</strong> We model your profile conservatively in the upper-middle of the product band (not at the punitive worst or best). We do not pull your bureau file.
                </div>
              )}
            </div>
          )}

          {/* 5. STANDARD NUMBER INPUT */}
          {currentQuestion.type === 'number' && (
            <div className="space-y-2">
              <input
                type="number"
                id={`input-${currentQuestion.id}`}
                min={currentQuestion.min}
                max={currentQuestion.max}
                step={currentQuestion.step || 1}
                value={answers[currentQuestion.id as keyof typeof answers] as number || ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setAnswer(currentQuestion.id as any, isNaN(val) ? 0 : val);
                }}
                placeholder={currentQuestion.placeholder}
                className="block w-full rounded-xl border border-slate-300 py-3.5 px-4 text-lg font-semibold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Why this was asked (Information Gain Heuristic Note) */}
        <div className="rounded-xl bg-slate-50/80 border border-slate-200/60 p-3 flex items-start gap-2 text-slate-600 text-xs">
          <HelpCircle className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
          <p>
            <strong className="text-slate-700">How this affects your numbers:</strong>{' '}
            {currentQuestion.informationGainReason}
          </p>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goToPrevious}
          disabled={history.length <= 1}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Explicit "See my numbers now" Affordance */}
          <button
            type="button"
            onClick={() => {
              setActiveView('negotiation_card');
              setMobileTab('numbers');
            }}
            className="inline-flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            title="Stop early and view current estimates"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">See my numbers now</span>
            <span className="sm:hidden">See numbers</span>
          </button>

          <button
            type="button"
            onClick={goToNext}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all"
          >
            <span>Next Question</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

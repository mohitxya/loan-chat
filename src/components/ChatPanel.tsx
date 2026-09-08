import React, { useRef, useEffect, useState } from 'react';
import { useSession } from '../state/sessionStore';
import { ChatMessage } from './ChatMessage';
import { CurrencyInput } from './CurrencyInput';
import { formatAnswerValue } from '../rules/formatters';
import {
  ShieldCheck,
  RotateCcw,
  Eye,
  FileText,
  ArrowRight,
  Check,
  Send,
} from 'lucide-react';
import { QUESTION_BANK } from '../questions/questionBank';

export const ChatPanel: React.FC = () => {
  const {
    currentQuestion,
    answers,
    setAnswer,
    setMultipleAnswers,
    goToNext,
    goToQuestion,
    history,
    stats,
    setActiveView,
    setMobileTab,
    resetSession,
  } = useSession();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [rangeMin, setRangeMin] = useState<number | undefined>(answers.incomeMin);
  const [rangeMax, setRangeMax] = useState<number | undefined>(answers.incomeMax);

  // Scroll only the internal chat message container, NEVER the window
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [history, currentQuestion]);

  // Synchronize range state when answers change
  useEffect(() => {
    setRangeMin(answers.incomeMin);
    setRangeMax(answers.incomeMax);
  }, [answers.incomeMin, answers.incomeMax]);

  // Questions that have been answered already in sequence
  const answeredQuestions = history
    .filter((id) => id !== currentQuestion?.id)
    .map((id) => QUESTION_BANK.find((q) => q.id === id))
    .filter((q): q is NonNullable<typeof q> => Boolean(q));

  const handleSelectOption = (value: any) => {
    if (!currentQuestion) return;
    setAnswer(currentQuestion.id as any, value);
    goToNext();
  };

  const handleCurrencySubmit = () => {
    if (!currentQuestion) return;
    goToNext();
  };

  const handleRangeSubmit = () => {
    if (rangeMin && rangeMax) {
      setMultipleAnswers({
        incomeMin: rangeMin,
        incomeMax: rangeMax,
        monthlyIncome: Math.round((rangeMin + rangeMax) / 2),
      });
      goToNext();
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[640px] sm:h-[720px] overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 sm:px-6 border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Borrower Copilot</h2>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Zero bureau pulls · In-browser privacy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Progress chip */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
            <span className="text-indigo-600">{stats.answeredCount}</span>
            <span className="text-slate-400">/</span>
            <span>{stats.totalApplicableCount} answered</span>
          </div>

          <button
            type="button"
            onClick={resetSession}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all text-xs"
            title="Restart conversation"
            aria-label="Restart conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* Welcome Bot Bubble */}
        <ChatMessage
          id="msg-welcome"
          sender="bot"
          text="Namaste! I am your Borrower Copilot. I'm here to help you calculate your safe loan capacity, discover fair interest rates, and protect you against predatory lending—with zero bureau inquiries and 100% client-side privacy."
        />

        {/* Previously Answered Q&A Sequence */}
        {answeredQuestions.map((q) => {
          const rawVal = answers[q.id as keyof typeof answers];
          const formatted = formatAnswerValue(q.id, rawVal);

          return (
            <React.Fragment key={q.id}>
              {/* Bot Question Prompt */}
              <ChatMessage
                id={`bot-q-${q.id}`}
                sender="bot"
                question={q}
                text={q.title}
              />

              {/* User Answer Bubble with Edit Action */}
              <ChatMessage
                id={`user-a-${q.id}`}
                sender="user"
                text={formatted || String(rawVal)}
                formattedValue={formatted}
                onEdit={() => goToQuestion(q.id)}
              />
            </React.Fragment>
          );
        })}

        {/* Active Current Question */}
        {currentQuestion ? (
          <ChatMessage
            id={`bot-active-${currentQuestion.id}`}
            sender="bot"
            question={currentQuestion}
            text={currentQuestion.title}
            isActive={true}
          >
            {/* Interactive Control Embedded Directly in Chat */}

            {/* 1. SELECT CHIPS / BUTTONS */}
            {currentQuestion.type === 'select' && currentQuestion.options && (
              <div className="grid grid-cols-1 gap-2 pt-1">
                {currentQuestion.options.map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => handleSelectOption(opt.value)}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 hover:bg-indigo-50/40 text-left transition-all group shadow-sm"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-800 group-hover:text-indigo-900">
                        {opt.label}
                      </div>
                      {opt.sublabel && (
                        <div className="text-[11px] text-slate-500 leading-snug">
                          {opt.sublabel}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            )}

            {/* 2. CURRENCY INPUT WITH SEND BUTTON */}
            {currentQuestion.type === 'currency' && (
              <div className="space-y-3 pt-1">
                <CurrencyInput
                  id={`chat-input-${currentQuestion.id}`}
                  value={answers[currentQuestion.id as keyof typeof answers] as number}
                  onChange={(val) => setAnswer(currentQuestion.id as any, val)}
                  placeholder={currentQuestion.placeholder}
                  quickAmounts={
                    currentQuestion.id === 'amountWanted'
                      ? [100000, 500000, 800000, 1500000, 2500000]
                      : [10000, 25000, 50000, 75000, 110000]
                  }
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCurrencySubmit}
                    disabled={!answers[currentQuestion.id as keyof typeof answers]}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none shadow-sm transition-all"
                  >
                    <span>Confirm</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* 3. CURRENCY RANGE INPUT (MIN-MAX FOR INFORMAL/GIG) */}
            {currentQuestion.type === 'currency_range' && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Worst Month (Minimum ₹)
                    </span>
                    <CurrencyInput
                      id="chat-range-min"
                      value={rangeMin}
                      onChange={(val) => setRangeMin(val)}
                      placeholder="e.g. 26,000"
                      quickAmounts={[20000, 26000, 30000, 40000]}
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Peak Month (Maximum ₹)
                    </span>
                    <CurrencyInput
                      id="chat-range-max"
                      value={rangeMax}
                      onChange={(val) => setRangeMax(val)}
                      placeholder="e.g. 40,000"
                      quickAmounts={[30000, 40000, 60000, 80000]}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleRangeSubmit}
                    disabled={!rangeMin || !rangeMax}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none shadow-sm transition-all"
                  >
                    <span>Confirm Range</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* 4. CREDIT SCORE SELECTOR */}
            {currentQuestion.type === 'credit_score' && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMultipleAnswers({
                        creditScoreKnown: true,
                        creditScore: answers.creditScore || 750,
                      });
                    }}
                    className={`p-2.5 rounded-xl border text-center font-semibold text-xs transition-all ${
                      answers.creditScoreKnown !== false && answers.creditScore !== null
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    I Know My Score
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMultipleAnswers({
                        creditScoreKnown: false,
                        creditScore: null,
                      });
                      goToNext();
                    }}
                    className={`p-2.5 rounded-xl border text-center font-semibold text-xs transition-all ${
                      answers.creditScoreKnown === false
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    I Do Not Know / No Score
                  </button>
                </div>

                {answers.creditScoreKnown !== false && (
                  <div className="space-y-2 pt-1">
                    <input
                      type="number"
                      id="chat-credit-score"
                      min={300}
                      max={900}
                      value={answers.creditScore || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setAnswer('creditScore', isNaN(val) ? null : val);
                      }}
                      placeholder="e.g. 780"
                      className="block w-full rounded-xl border border-slate-300 py-2.5 px-3 text-base font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Prime is 750+</span>
                      <button
                        type="button"
                        onClick={goToNext}
                        disabled={!answers.creditScore}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 disabled:opacity-40 transition-all"
                      >
                        <span>Confirm</span>
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. GENERIC NUMBER INPUT */}
            {currentQuestion.type === 'number' && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  id={`chat-number-${currentQuestion.id}`}
                  min={currentQuestion.min}
                  max={currentQuestion.max}
                  step={currentQuestion.step || 1}
                  value={answers[currentQuestion.id as keyof typeof answers] as number || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setAnswer(currentQuestion.id as any, isNaN(val) ? 0 : val);
                  }}
                  placeholder={currentQuestion.placeholder}
                  className="block flex-1 rounded-xl border border-slate-300 py-2.5 px-3 text-base font-semibold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={goToNext}
                  disabled={!answers[currentQuestion.id as keyof typeof answers]}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 disabled:opacity-40 shadow-sm transition-all"
                >
                  <span>Next</span>
                  <Send className="w-3 h-3" />
                </button>
              </div>
            )}
          </ChatMessage>
        ) : (
          /* All Questions Complete Bubble */
          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Profile Calibration Complete</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                All applicable rules have been evaluated. Your decision outputs are locked in at High confidence.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('negotiation_card')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md hover:bg-slate-800 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Open Negotiation Card</span>
            </button>
          </div>
        )}
      </div>

      {/* Chat Footer Quick Navigation Actions */}
      <div className="p-3 sm:px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            setActiveView('negotiation_card');
            setMobileTab('numbers');
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 px-2.5 py-1.5 rounded-lg hover:bg-white transition-all"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>See numbers now</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('negotiation_card')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-800 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-200/60 transition-all"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Negotiation Card</span>
        </button>
      </div>
    </div>
  );
};

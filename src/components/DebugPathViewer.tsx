import React from 'react';
import { useSession } from '../state/sessionStore';
import { isQuestionAnswered } from '../questions/branching';
import { X, CheckCircle2, Circle, GitBranch } from 'lucide-react';

export const DebugPathViewer: React.FC = () => {
  const { showDebugModal, setShowDebugModal, answers, applicableQuestions, goToQuestion } =
    useSession();

  if (!showDebugModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-50 duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Adaptive Decision Tree</h3>
              <p className="text-xs text-slate-500">
                Inspectable rule sequence evaluated for current profile
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowDebugModal(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-3">
          <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 border border-slate-200/60">
            <strong>Architecture Note:</strong> Zero machine learning. Every question is selected dynamically via pure predicate logic in <code>branching.ts</code> based on information gain.
          </div>

          <div className="space-y-2 pt-2">
            {applicableQuestions.map((q, idx) => {
              const answered = isQuestionAnswered(q, answers);
              const answerVal = answers[q.id as keyof typeof answers];

              return (
                <div
                  key={q.id}
                  onClick={() => {
                    goToQuestion(q.id);
                    setShowDebugModal(false);
                  }}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                    answered
                      ? 'border-slate-200 bg-white hover:border-indigo-300'
                      : 'border-dashed border-slate-300 bg-slate-50/60 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                      {answered ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                      <span className="text-slate-900">
                        {idx + 1}. {q.title}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                      {q.tier}
                    </span>
                  </div>

                  <div className="mt-1.5 pl-6 text-slate-500 text-[11px] space-y-0.5">
                    <p>
                      <strong>Answer:</strong>{' '}
                      {answered ? (
                        <span className="font-semibold text-indigo-700">
                          {typeof answerVal === 'object' ? JSON.stringify(answerVal) : String(answerVal)}
                        </span>
                      ) : (
                        <span className="italic text-slate-400">Unanswered</span>
                      )}
                    </p>
                    <p className="text-slate-400 text-[10px]">{q.informationGainReason}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={() => setShowDebugModal(false)}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

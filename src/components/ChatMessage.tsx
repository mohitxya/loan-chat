import React from 'react';
import { ShieldCheck, User, Edit2, HelpCircle } from 'lucide-react';
import { Question } from '../questions/types';

export interface ChatMessageProps {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  question?: Question;
  formattedValue?: string;
  onEdit?: () => void;
  isActive?: boolean;
  children?: React.ReactNode;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  sender,
  text,
  question,
  formattedValue,
  onEdit,
  isActive = false,
  children,
}) => {
  if (sender === 'user') {
    return (
      <div className="flex justify-end gap-2 my-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
        <div className="group relative max-w-[85%] sm:max-w-[75%] bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-md shadow-indigo-600/10">
          <div className="text-sm font-semibold tracking-tight">
            {formattedValue || text}
          </div>

          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white text-slate-400 hover:text-indigo-600 hover:bg-slate-100 shadow-sm border border-slate-200 opacity-0 group-hover:opacity-100 transition-all text-xs"
              title="Change this answer"
              aria-label="Edit answer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 my-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
        <ShieldCheck className="w-4 h-4" />
      </div>

      <div className="space-y-2.5 max-w-[92%] sm:max-w-[85%]">
        <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-sm p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-indigo-700 tracking-wide uppercase">
              Borrower Copilot
            </span>
            {question && (
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold">
                {question.tier === 'must_ask' ? 'Core' : 'Adaptive'}
              </span>
            )}
          </div>

          <p className="text-sm text-slate-800 leading-relaxed font-medium">
            {text}
          </p>

          {question && question.helpText && (
            <p className="text-xs text-slate-500 italic">
              {question.helpText}
            </p>
          )}

          {question && question.informationGainReason && isActive && (
            <div className="pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-500">
              <HelpCircle className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
              <span>
                <strong>Why we ask:</strong> {question.informationGainReason}
              </span>
            </div>
          )}
        </div>

        {/* Embedded Interactive Input Widget if active */}
        {isActive && children && (
          <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl shadow-inner space-y-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

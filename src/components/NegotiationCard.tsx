import React, { useState } from 'react';
import { useSession } from '../state/sessionStore';
import { formatRupees, formatRateBand } from '../rules/formatters';
import {
  Printer,
  Copy,
  Check,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const NegotiationCard: React.FC = () => {
  const { results, setActiveView } = useSession();
  const { negotiationCard } = results;
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(negotiationCard.counterOfferScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-200">
      {/* Action Bar (Hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm no-print">
        <button
          type="button"
          onClick={() => setActiveView('questionnaire')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit Answers / Answer More</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyScript}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Script Copied!' : 'Copy Script'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md shadow-slate-900/20 hover:bg-slate-800 transition-all print-include"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Main Frozen Printable Negotiation Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-900 p-6 sm:p-10 shadow-xl space-y-8 print-card-wrapper">
        {/* Card Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-widest px-2 py-0.5 rounded bg-slate-900 text-white">
                Borrower Copilot
              </span>
              <span className="text-xs font-semibold text-slate-500">Official Negotiation Sheet</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Borrower Sanction Benchmark
            </h1>
            <p className="text-xs text-slate-500">
              Hold this document against your lender's sanction letter to challenge predatory rates and unjustified limits.
            </p>
          </div>

          <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200 text-right shrink-0">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Borrower Request
            </span>
            <span className="text-xl font-black text-slate-900 block">
              {formatRupees(negotiationCard.borrowerAsk.amount)}
            </span>
            <span className="text-xs text-slate-600 font-medium">
              {negotiationCard.borrowerAsk.purpose}
            </span>
          </div>
        </div>

        {/* 4 Outputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 page-break">
          {/* O1. Verdict */}
          <div className="p-5 rounded-2xl border border-slate-300 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                O1 · Verdict
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                  negotiationCard.o1.verdict === 'BORROW'
                    ? 'bg-emerald-100 text-emerald-800'
                    : negotiationCard.o1.verdict === 'BORROW_LESS'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {negotiationCard.o1.label}
              </span>
            </div>
            <div className="text-xl font-black text-slate-900">
              {negotiationCard.o1.label}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              <strong>Why:</strong> {negotiationCard.o1.reason}
            </p>
          </div>

          {/* O2. Maximum Sanction */}
          <div className="p-5 rounded-2xl border border-slate-300 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                O2 · Maximum Amount
              </span>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                Recommended: {negotiationCard.o2.recommendation === 'safe_to_carry' ? 'Safe Limit' : 'Lender Limit'}
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <div>
                <span className="text-[11px] text-slate-500 block">Safe Capacity:</span>
                <span className="text-xl font-black text-emerald-700">
                  {formatRupees(negotiationCard.o2.safeToCarryAmount)}
                </span>
              </div>
              <div className="border-l pl-3 border-slate-300">
                <span className="text-[11px] text-slate-500 block">Lender Likely:</span>
                <span className="text-lg font-bold text-slate-800">
                  {formatRupees(negotiationCard.o2.lenderLikelyAmount)}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              <strong>Why:</strong> {negotiationCard.o2.reason}
            </p>
          </div>

          {/* O3. Fair Interest Rate & APR */}
          <div className="p-5 rounded-2xl border border-slate-300 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                O3 · Fair Pricing Benchmark
              </span>
              <span className="text-[11px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md">
                {negotiationCard.o3.productLabel}
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <div>
                <span className="text-[11px] text-slate-500 block">Fair Nominal Rate:</span>
                <span className="text-xl font-black text-slate-900">
                  {formatRateBand(negotiationCard.o3.minNominalRate, negotiationCard.o3.maxNominalRate)}
                </span>
              </div>
              <div className="border-l pl-3 border-slate-300">
                <span className="text-[11px] text-indigo-600 block">All-in APR (with fees):</span>
                <span className="text-lg font-black text-indigo-700">
                  {formatRateBand(negotiationCard.o3.minApr, negotiationCard.o3.maxApr)}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              <strong>Why:</strong> {negotiationCard.o3.reason}
            </p>
          </div>

          {/* O4. Safe EMI Ceiling */}
          <div className="p-5 rounded-2xl border border-slate-300 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                O4 · Safe Monthly EMI Outflow
              </span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                {negotiationCard.o4.stressCase.survivesStress ? 'Stress Tested: Pass' : 'Stress Tested: Fail'}
              </span>
            </div>
            <div>
              <span className="text-xl font-black text-slate-900">
                {formatRupees(negotiationCard.o4.maxSafeEmi)}
                <span className="text-xs font-normal text-slate-500"> / month ceiling</span>
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              <strong>Why:</strong> {negotiationCard.o4.reason}
            </p>
          </div>
        </div>

        {/* Counter-Offer Negotiation Script */}
        <div className="p-5 rounded-2xl bg-indigo-950 text-white space-y-2.5 page-break">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Lender Counter-Offer Script (Read to Loan Officer)
          </div>
          <p className="text-sm font-medium leading-relaxed text-indigo-100 italic">
            "{negotiationCard.counterOfferScript}"
          </p>
        </div>

        {/* 4 Critical Sanction Letter Interrogation Questions */}
        <div className="space-y-3 page-break">
          <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
            Sanction Letter Checklist: Questions to Ask Before Signing
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {negotiationCard.lenderQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-medium flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-snug">{q}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Auditable Footer & Confidence Disclosure */}
        <div className="border-t border-slate-200 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{negotiationCard.confidenceDisclosure}</span>
          </div>
          <div>
            <span>Verified Rules Engine v1.0 · Zero Bureau Inquiry</span>
          </div>
        </div>
      </div>
    </div>
  );
};

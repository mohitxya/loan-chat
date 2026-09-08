/**
 * Verdict logic (O1).
 * Evaluates: Borrow / Borrow less / Don't borrow with dynamic, transparent reasons.
 */

import { Answers, VerdictOutput, VerdictType, ConfidenceLevel } from './types';
import { computeFoirAndCashflow } from './foir';
import { computeMaxAmount } from './eligibility';
import {
  BORROW_LESS_MARGIN,
  HIGH_OBLIGATION_RATIO_BOUNCE_THRESHOLD,
  RATE_PREDATORY_THRESHOLD,
} from './constants';
import { formatRupeesShort } from './formatters';

export function computeVerdict(answers: Answers): VerdictOutput {
  const foir = computeFoirAndCashflow(answers);
  const eligibility = computeMaxAmount(answers);

  const amountWanted = answers.amountWanted || 0;
  const existingEmis = answers.existingEmis || 0;
  const monthlyIncome = foir.lenderMonthlyIncome;
  const existingObligationRatio = monthlyIncome > 0 ? existingEmis / monthlyIncome : 1;
  const hasBounce = (answers.bouncesLast12m || 0) > 0;
  const isUnemployed = answers.employmentType === 'unemployed';

  let verdict: VerdictType = 'BORROW';
  let label: 'Borrow' | 'Borrow less' | "Don't borrow" = 'Borrow';
  let reason = '';

  // 1. Critical "Don't borrow" check
  if (isUnemployed) {
    verdict = 'DONT_BORROW';
    label = "Don't borrow";
    reason = 'Without an active income stream, taking new debt creates an immediate risk of default.';
  } else if (foir.safeAvailableEmi <= 0) {
    verdict = 'DONT_BORROW';
    label = "Don't borrow";
    reason = `Your existing living expenses (${formatRupeesShort(answers.essentialExpenses || 0)}) and debt (${formatRupeesShort(existingEmis)}) leave no safe cashflow cushion for additional EMIs.`;
  } else if (hasBounce && existingObligationRatio >= HIGH_OBLIGATION_RATIO_BOUNCE_THRESHOLD) {
    verdict = 'DONT_BORROW';
    label = "Don't borrow";
    reason = `A recent payment bounce combined with existing debt consuming ${Math.round(existingObligationRatio * 100)}% of your income makes fresh borrowing high-risk.`;
  } else if (
    (answers.existingAppLoanApr || 0) >= RATE_PREDATORY_THRESHOLD &&
    answers.purpose !== 'debt_consolidation' &&
    existingObligationRatio > 0.35
  ) {
    verdict = 'DONT_BORROW';
    label = "Don't borrow";
    reason = `Existing high-cost app debt at ${answers.existingAppLoanApr}% APR is already straining cashflow; prioritize clearing existing debt before taking new loans.`;
  }
  // 2. "Borrow less" check
  else if (amountWanted > eligibility.safeToCarryAmount * (1 + BORROW_LESS_MARGIN)) {
    verdict = 'BORROW_LESS';
    label = 'Borrow less';
    if (eligibility.safeToCarryAmount > 0) {
      reason = `You asked for ${formatRupeesShort(amountWanted)}, which exceeds your safe cashflow ceiling of ${formatRupeesShort(eligibility.safeToCarryAmount)}; borrowing more risks eating into living essentials.`;
    } else {
      reason = `Your requested amount of ${formatRupeesShort(amountWanted)} exceeds your available debt-servicing buffer.`;
    }
  } else if (amountWanted > eligibility.lenderLikelyAmount) {
    verdict = 'BORROW_LESS';
    label = 'Borrow less';
    reason = `Your ask of ${formatRupeesShort(amountWanted)} exceeds the likely lender sanction ceiling of ${formatRupeesShort(eligibility.lenderLikelyAmount)} at current income levels.`;
  }
  // 3. Healthy "Borrow"
  else {
    verdict = 'BORROW';
    label = 'Borrow';
    reason = `Your requested loan of ${formatRupeesShort(amountWanted)} is comfortably within your safe borrowing capacity of ${formatRupeesShort(eligibility.safeToCarryAmount)}.`;
  }

  // Confidence computation
  let confidence: ConfidenceLevel = 'Low';
  let tighteningHint = 'Confirming income stability and bounce history will strengthen verdict confidence.';

  const count =
    (answers.incomeStability !== undefined ? 1 : 0) +
    (answers.bouncesLast12m !== undefined ? 1 : 0) +
    (answers.essentialExpenses !== undefined ? 1 : 0) +
    (answers.creditScoreKnown !== undefined ? 1 : 0);

  if (count >= 4) {
    confidence = 'High';
    tighteningHint = 'Verdict is backed by verified cashflow obligations, stability, and payment track record.';
  } else if (count >= 2) {
    confidence = 'Medium';
    tighteningHint = 'Verifying bounce history and savings cushion will make this verdict definitive.';
  }

  return {
    verdict,
    label,
    reason,
    confidence,
    tighteningHint,
  };
}

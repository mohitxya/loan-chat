/**
 * Confidence scoring and tightening hints for O1-O4 outputs.
 * Confidence genuinely increases based on relevant answers answered.
 */

import { Answers, ConfidenceLevel } from './types';

export interface ConfidenceEvaluation {
  level: ConfidenceLevel;
  answeredRelevantCount: number;
  totalRelevantCount: number;
  remainingQuestionNames: string[];
  tighteningHint: string;
}

export function evaluateVerdictConfidence(answers: Answers): ConfidenceEvaluation {
  const missing: string[] = [];
  let answered = 0;

  if (answers.incomeStability !== undefined) answered++;
  else missing.push('Job & Income Stability');

  if (answers.bouncesLast12m !== undefined) answered++;
  else missing.push('EMI / Bill Bounce History');

  if (answers.emergencySavingsMonths !== undefined) answered++;
  else missing.push('Emergency Savings Buffer');

  const total = 3;
  let level: ConfidenceLevel = 'Low';
  if (answered === 3) level = 'High';
  else if (answered >= 1) level = 'Medium';

  const remaining = total - answered;
  const tighteningHint =
    remaining === 0
      ? 'Verdict is backed by verified cashflow buffer, stability, and payment discipline.'
      : `${remaining} more answer${remaining > 1 ? 's' : ''} (${missing.join(', ')}) will tighten this verdict.`;

  return {
    level,
    answeredRelevantCount: answered,
    totalRelevantCount: total,
    remainingQuestionNames: missing,
    tighteningHint,
  };
}

export function evaluateEligibilityConfidence(answers: Answers): ConfidenceEvaluation {
  const missing: string[] = [];
  let answered = 0;

  if (answers.incomeStability !== undefined) answered++;
  else missing.push('Income Stability');

  if (answers.emergencySavingsMonths !== undefined) answered++;
  else missing.push('Emergency Savings Cushion');

  if (answers.bouncesLast12m !== undefined) answered++;
  else missing.push('Payment Bounce History');

  if (answers.upcomingLargeExpense !== undefined) answered++;
  else missing.push('Upcoming 12-Month Lump Expenses');

  const total = 4;
  let level: ConfidenceLevel = 'Low';
  if (answered >= 3) level = 'High';
  else if (answered >= 1) level = 'Medium';

  const remaining = total - answered;
  const tighteningHint =
    remaining === 0
      ? 'High confidence: Safe borrowing limits are based on your complete cashflow statement.'
      : `${remaining} more answer${remaining > 1 ? 's' : ''} (${missing.slice(0, 2).join(', ')}) will calibrate maximum borrowing limits.`;

  return {
    level,
    answeredRelevantCount: answered,
    totalRelevantCount: total,
    remainingQuestionNames: missing,
    tighteningHint,
  };
}

export function evaluateRateConfidence(answers: Answers): ConfidenceEvaluation {
  const missing: string[] = [];
  let answered = 0;

  const scoreKnown = answers.creditScoreKnown && answers.creditScore !== null && answers.creditScore !== undefined;
  if (scoreKnown) answered += 2;
  else if (answers.creditScoreKnown === false) {
    // Borrower explicitly stated "I don't know"
    answered += 1;
  } else {
    missing.push('Credit Score / Bureau Tier');
  }

  if (answers.incomeStability !== undefined) answered++;
  else missing.push('Employment Vintage');

  if (answers.existingOffers && answers.existingOffers.length > 0) answered++;
  else missing.push('Existing Quotes from Lenders');

  const total = 4;
  let level: ConfidenceLevel = 'Low';
  if (answered >= 3) level = 'High';
  else if (answered >= 1) level = 'Medium';

  const remaining = Math.max(0, total - answered);
  const tighteningHint =
    remaining === 0 || level === 'High'
      ? 'Rate band is calibrated tightly to your credit profile and lender benchmarks.'
      : `${missing.length} more answer${missing.length > 1 ? 's' : ''} (${missing.slice(0, 2).join(', ')}) will narrow this rate band.`;

  return {
    level,
    answeredRelevantCount: answered,
    totalRelevantCount: total,
    remainingQuestionNames: missing,
    tighteningHint,
  };
}

export function evaluateEmiCeilingConfidence(answers: Answers): ConfidenceEvaluation {
  const missing: string[] = [];
  let answered = 0;

  if (answers.emergencySavingsMonths !== undefined) answered++;
  else missing.push('Emergency Savings Buffer');

  if (answers.upcomingLargeExpense !== undefined) answered++;
  else missing.push('Upcoming Major Expenses');

  if (answers.variableIncomeShare !== undefined || answers.incomeStability !== undefined) answered++;
  else missing.push('Income Volatility / Stability');

  const total = 3;
  let level: ConfidenceLevel = 'Low';
  if (answered === 3) level = 'High';
  else if (answered >= 1) level = 'Medium';

  const remaining = total - answered;
  const tighteningHint =
    remaining === 0
      ? 'EMI ceiling and stress buffers are validated against your household cushion.'
      : `${remaining} more answer${remaining > 1 ? 's' : ''} (${missing.join(', ')}) will refine the safe EMI ceiling.`;

  return {
    level,
    answeredRelevantCount: answered,
    totalRelevantCount: total,
    remainingQuestionNames: missing,
    tighteningHint,
  };
}

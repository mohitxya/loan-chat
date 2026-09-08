/**
 * Eligibility calculations (O2: Maximum Amount).
 * Computes 'Lender will likely sanction' vs 'Safe to carry' with recommendations.
 */

import { Answers, MaxAmountOutput, ConfidenceLevel } from './types';
import { computeFoirAndCashflow } from './foir';
import { computeRateBandAndApr } from './rateBands';
import {
  LTV_PROPERTY_LAP,
  LTV_GOLD,
  LTV_FD,
  DEFAULT_TENURE_PERSONAL_MONTHS,
  DEFAULT_TENURE_HOME_MONTHS,
  DEFAULT_TENURE_LAP_MONTHS,
  DEFAULT_TENURE_GOLD_MONTHS,
  DEFAULT_TENURE_VEHICLE_MONTHS,
  DEFAULT_TENURE_BUSINESS_MONTHS,
} from './constants';
import { formatRupeesShort } from './formatters';

/**
 * Calculates principal loan amount supported by a given monthly EMI
 */
export function principalFromEmi(monthlyEmi: number, annualRatePercent: number, tenureMonths: number): number {
  if (monthlyEmi <= 0 || annualRatePercent <= 0 || tenureMonths <= 0) return 0;
  const r = annualRatePercent / 12 / 100;
  const principal = (monthlyEmi * (1 - Math.pow(1 + r, -tenureMonths))) / r;
  return Math.round(principal);
}

export function computeMaxAmount(answers: Answers): MaxAmountOutput {
  const foir = computeFoirAndCashflow(answers);
  const rates = computeRateBandAndApr(answers);

  const product = rates.productRecommended;
  const tenureMonths =
    answers.requestedTenureMonths ||
    (product === 'home'
      ? DEFAULT_TENURE_HOME_MONTHS
      : product === 'lap'
      ? DEFAULT_TENURE_LAP_MONTHS
      : product === 'gold'
      ? DEFAULT_TENURE_GOLD_MONTHS
      : product === 'vehicle_tw'
      ? DEFAULT_TENURE_VEHICLE_MONTHS
      : product === 'business_secured' || product === 'business_unsecured'
      ? DEFAULT_TENURE_BUSINESS_MONTHS
      : DEFAULT_TENURE_PERSONAL_MONTHS);

  // Use midpoint of fair nominal rate band for loan sizing
  const midRate = (rates.minNominalRate + rates.maxNominalRate) / 2;

  let lenderLikelyAmount = principalFromEmi(foir.lenderAvailableEmi, midRate, tenureMonths);
  let safeToCarryAmount = principalFromEmi(foir.safeAvailableEmi, midRate, tenureMonths);

  // Check collateral LTV constraints if applicable
  if (answers.collateralValue && answers.collateralValue > 0) {
    let ltvCap = 1.0;
    if (answers.collateral === 'property') ltvCap = LTV_PROPERTY_LAP;
    else if (answers.collateral === 'gold') ltvCap = LTV_GOLD;
    else if (answers.collateral === 'fd') ltvCap = LTV_FD;

    const collateralMax = Math.round(answers.collateralValue * ltvCap);
    lenderLikelyAmount = Math.min(lenderLikelyAmount, collateralMax);
  }

  // Determine recommendation
  let recommendation: 'lender_likely' | 'safe_to_carry';
  let recommendationReason: string;
  let recommendedAmount: number;

  if (safeToCarryAmount <= 0) {
    recommendation = 'safe_to_carry';
    recommendedAmount = 0;
    recommendationReason =
      'Your existing expenses and commitments consume your current income; carrying new debt risks cashflow distress.';
  } else if (lenderLikelyAmount > safeToCarryAmount) {
    recommendation = 'safe_to_carry';
    recommendedAmount = safeToCarryAmount;
    recommendationReason = `Stick to safe capacity (${formatRupeesShort(safeToCarryAmount)}) over lender limit (${formatRupeesShort(lenderLikelyAmount)}) to protect living expenses and emergency savings.`;
  } else {
    recommendation = 'lender_likely';
    recommendedAmount = lenderLikelyAmount;
    recommendationReason = `Your cashflow can support ${formatRupeesShort(safeToCarryAmount)}, but bank FOIR policies will likely cap sanction at ${formatRupeesShort(lenderLikelyAmount)}.`;
  }

  // Reason summary
  const reason = `Safe ceiling is ${formatRupeesShort(safeToCarryAmount)} (based on residual cashflow) vs ${formatRupeesShort(lenderLikelyAmount)} likely lender approval (at ${Math.round(foir.effectiveFoirCap * 100)}% FOIR).`;

  // Confidence
  let confidence: ConfidenceLevel = 'Low';
  let tighteningHint = 'Add job vintage, exact monthly expenses, and emergency savings to tighten max borrowing limits.';

  const answeredAdditional =
    (answers.incomeStability !== undefined ? 1 : 0) +
    (answers.emergencySavingsMonths !== undefined ? 1 : 0) +
    (answers.bouncesLast12m !== undefined ? 1 : 0) +
    (answers.upcomingLargeExpense !== undefined ? 1 : 0);

  if (answeredAdditional >= 3) {
    confidence = 'High';
    tighteningHint = 'High confidence based on verified cashflow buffer, job tenure, and obligation checks.';
  } else if (answeredAdditional >= 1) {
    confidence = 'Medium';
    tighteningHint = 'Answering remaining cashflow questions will fine-tune the safe borrowing ceiling.';
  }

  return {
    lenderLikelyAmount,
    safeToCarryAmount,
    recommendedAmount,
    recommendation,
    recommendationReason,
    reason,
    confidence,
    tighteningHint,
  };
}

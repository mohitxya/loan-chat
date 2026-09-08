/**
 * EMI Ceiling, Tenure Trade-off Matrix, and Deterministic Stress Testing (O4).
 */

import { Answers, EmiCeilingOutput, TenureOption, StressCase, ConfidenceLevel } from './types';
import { computeFoirAndCashflow } from './foir';
import { computeRateBandAndApr, calculateEmi } from './rateBands';
import {
  STRESS_INCOME_DROP_PERCENT,
  STRESS_RATE_HIKE_PERCENT,
  STRESS_SHORT_TENURE_INCOME_DROP_PERCENT,
  DEFAULT_TENURE_PERSONAL_MONTHS,
  DEFAULT_TENURE_HOME_MONTHS,
  DEFAULT_TENURE_LAP_MONTHS,
  DEFAULT_TENURE_GOLD_MONTHS,
  DEFAULT_TENURE_VEHICLE_MONTHS,
  DEFAULT_TENURE_BUSINESS_MONTHS,
} from './constants';
import { formatRupeesShort } from './formatters';

export function computeEmiCeiling(answers: Answers): EmiCeilingOutput {
  const foir = computeFoirAndCashflow(answers);
  const rates = computeRateBandAndApr(answers);

  const product = rates.productRecommended;
  const midRate = (rates.minNominalRate + rates.maxNominalRate) / 2;
  const amountWanted = answers.amountWanted || 500000;

  const maxSafeEmi = Math.round(foir.safeAvailableEmi);
  const lenderMaxEmi = Math.round(foir.lenderAvailableEmi);

  // Tenure trade-off options
  let tenureCandidateMonths: number[];
  if (product === 'home' || product === 'lap') {
    tenureCandidateMonths = [60, 120, 180, 240];
  } else if (product === 'gold') {
    tenureCandidateMonths = [6, 12, 24];
  } else {
    tenureCandidateMonths = [12, 24, 36, 48, 60];
  }

  const tenureOptions: TenureOption[] = tenureCandidateMonths.map((months) => {
    const emi = Math.round(calculateEmi(amountWanted, midRate, months));
    const totalPayment = emi * months;
    const totalInterest = Math.max(0, totalPayment - amountWanted);
    const isSafe = emi <= maxSafeEmi;
    return {
      tenureMonths: months,
      estimatedEmi: emi,
      totalInterest,
      isSafe,
    };
  });

  // Selected default tenure
  const defaultTenure =
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

  const proposedEmi = Math.round(calculateEmi(amountWanted, midRate, defaultTenure));

  // Deterministic Stress Testing
  // Selection rule:
  // Informal / gig / self-employed -> Income Drop shock (-20%)
  // Salaried long-tenure (>36 mo) -> Rate Hike shock (+200 bps)
  // Salaried short-tenure (<=36 mo) -> Income Shock (-15%)
  const empType = answers.employmentType || 'salaried';
  const isInformalOrSelfEmployed =
    empType === 'gig_informal' ||
    empType === 'self_employed_cash' ||
    empType === 'self_employed_itr' ||
    (answers.variableIncomeShare || 0) > 25;

  let stressCase: StressCase;

  if (isInformalOrSelfEmployed) {
    const stressedIncome = foir.safeMonthlyIncome * (1 - STRESS_INCOME_DROP_PERCENT);
    const essentialExpenses = answers.essentialExpenses || 0;
    const existingEmis = answers.existingEmis || 0;
    // Under stress, buffer is reduced to 10%
    const stressedBuffer = stressedIncome * 0.10;
    const stressedEmiCapacity = Math.max(
      0,
      Math.round(stressedIncome - essentialExpenses - existingEmis - stressedBuffer)
    );
    const stressedEmiForProposed = proposedEmi;
    const survivesStress = stressedEmiCapacity >= stressedEmiForProposed;

    stressCase = {
      scenarioType: 'income_drop',
      description: 'Income Drop (-20% cashflow disruption)',
      shockValue: '-20% income',
      stressedEmiCapacity,
      stressedEmiForProposed,
      survivesStress,
      stressVerdict: survivesStress
        ? `Even if monthly earnings fall by 20% to ${formatRupeesShort(stressedIncome)}, your surviving capacity (${formatRupeesShort(stressedEmiCapacity)}/mo) covers the ${formatRupeesShort(proposedEmi)} EMI.`
        : `If monthly income drops 20% to ${formatRupeesShort(stressedIncome)}, your safe capacity falls to ${formatRupeesShort(stressedEmiCapacity)}/mo, leaving a deficit against the proposed ${formatRupeesShort(proposedEmi)} EMI.`,
    };
  } else if (defaultTenure > 36 || product === 'home' || product === 'lap') {
    // Rate hike stress
    const stressedRate = midRate + STRESS_RATE_HIKE_PERCENT;
    const stressedProposedEmi = Math.round(calculateEmi(amountWanted, stressedRate, defaultTenure));
    const survivesStress = maxSafeEmi >= stressedProposedEmi;

    stressCase = {
      scenarioType: 'rate_rise',
      description: 'Macro Interest Rate Hike (+200 bps / +2.0%)',
      shockValue: '+2.0% rate',
      stressedEmiCapacity: maxSafeEmi,
      stressedEmiForProposed: stressedProposedEmi,
      survivesStress,
      stressVerdict: survivesStress
        ? `If interest rates climb by 2.0% (to ${stressedRate.toFixed(1)}%), the EMI rises to ${formatRupeesShort(stressedProposedEmi)}/mo, which remains inside your ${formatRupeesShort(maxSafeEmi)} safe ceiling.`
        : `If interest rates climb by 2.0% (to ${stressedRate.toFixed(1)}%), your EMI rises to ${formatRupeesShort(stressedProposedEmi)}/mo, which breaches your current safe ceiling of ${formatRupeesShort(maxSafeEmi)}/mo.`,
    };
  } else {
    // Salaried short-tenure income shock
    const stressedIncome = foir.safeMonthlyIncome * (1 - STRESS_SHORT_TENURE_INCOME_DROP_PERCENT);
    const essentialExpenses = answers.essentialExpenses || 0;
    const existingEmis = answers.existingEmis || 0;
    const stressedBuffer = stressedIncome * 0.10;
    const stressedEmiCapacity = Math.max(
      0,
      Math.round(stressedIncome - essentialExpenses - existingEmis - stressedBuffer)
    );
    const survivesStress = stressedEmiCapacity >= proposedEmi;

    stressCase = {
      scenarioType: 'income_drop',
      description: 'Emergency Income Shock (-15% salary shock / disruption)',
      shockValue: '-15% income',
      stressedEmiCapacity,
      stressedEmiForProposed: proposedEmi,
      survivesStress,
      stressVerdict: survivesStress
        ? `Under a 15% salary disruption, your surplus capacity (${formatRupeesShort(stressedEmiCapacity)}/mo) safely absorbs the proposed ${formatRupeesShort(proposedEmi)} EMI.`
        : `Under a 15% salary disruption, your monthly surplus capacity drops to ${formatRupeesShort(stressedEmiCapacity)}/mo, falling short of the required ${formatRupeesShort(proposedEmi)} EMI.`,
    };
  }

  // Reason
  const reason = `Safe monthly EMI ceiling is ${formatRupeesShort(maxSafeEmi)}/mo (household surplus) vs ${formatRupeesShort(lenderMaxEmi)}/mo lender maximum (at ${Math.round(foir.effectiveFoirCap * 100)}% FOIR).`;

  // Confidence
  let confidence: ConfidenceLevel = 'Low';
  let tighteningHint = 'Adding exact monthly expenses and emergency savings months tightens the EMI ceiling.';

  const additionalAnswered =
    (answers.essentialExpenses !== undefined ? 1 : 0) +
    (answers.emergencySavingsMonths !== undefined ? 1 : 0) +
    (answers.upcomingLargeExpense !== undefined ? 1 : 0);

  if (additionalAnswered >= 3) {
    confidence = 'High';
    tighteningHint = 'High confidence backed by documented living expenses and verified cash buffers.';
  } else if (additionalAnswered >= 1) {
    confidence = 'Medium';
    tighteningHint = 'Answering emergency savings details will finalize stress test margins.';
  }

  return {
    maxSafeEmi,
    lenderMaxEmi,
    tenureOptions,
    stressCase,
    reason,
    confidence,
    tighteningHint,
  };
}

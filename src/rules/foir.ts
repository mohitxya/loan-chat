/**
 * Pure functions for Affordability and FOIR (Fixed Obligation to Income Ratio).
 * Compares lender-likely maximum ceiling against household safe-to-carry cashflow.
 */

import { Answers } from './types';
import {
  FOIR_SALARIED_STABLE,
  FOIR_SALARIED_UNSTABLE,
  FOIR_SELF_EMPLOYED_ITR_STABLE,
  FOIR_SELF_EMPLOYED_ITR_UNSTABLE,
  FOIR_INFORMAL_VARIABLE,
  FOIR_UNEMPLOYED,
  FOIR_BOUNCE_PENALTY,
  PRODUCTIVE_DEBT_INCOME_HAIRCUT,
  PRODUCTIVE_DEBT_MAX_FOIR_UPLIFT,
  CO_APPLICANT_INCOME_LENDER_WEIGHT,
  CO_APPLICANT_INCOME_SAFE_WEIGHT,
  DEFAULT_SAVINGS_BUFFER_PERCENT,
  ELEVATED_SAVINGS_BUFFER_PERCENT,
  EMERGENCY_SAVINGS_THRESHOLD_MONTHS,
  UPCOMING_EXPENSE_MONTHLY_AMORTIZATION_MONTHS,
  VARIABLE_INCOME_CONSERVATIVE_FACTOR,
} from './constants';

export interface FoirComputation {
  lenderMonthlyIncome: number;
  safeMonthlyIncome: number;
  baseFoirCap: number;
  effectiveFoirCap: number;
  lenderMaxTotalObligation: number;
  lenderAvailableEmi: number;
  savingsBufferPercent: number;
  savingsBufferAmount: number;
  upcomingExpenseMonthlyDeduction: number;
  safeAvailableEmi: number;
  isBouncePenalized: boolean;
  isProductiveUplifted: boolean;
  foirReason: string;
}

export function computeFoirAndCashflow(answers: Answers): FoirComputation {
  const empType = answers.employmentType || 'salaried';
  const stability = answers.incomeStability;
  const isStable = stability === 'gt_2_years';
  const hasBounce = (answers.bouncesLast12m || 0) > 0;

  // Base income resolution
  let baseIncome = answers.monthlyIncome || 0;
  if (!answers.monthlyIncome && answers.incomeMin && answers.incomeMax) {
    baseIncome = (answers.incomeMin + answers.incomeMax) / 2;
  }

  // Co-applicant income
  const coIncome = answers.coApplicantIncome || 0;
  const lenderCoIncome = coIncome * CO_APPLICANT_INCOME_LENDER_WEIGHT;
  const safeCoIncome = coIncome * CO_APPLICANT_INCOME_SAFE_WEIGHT;

  // Productive business debt increment
  const isBusinessPurpose =
    answers.purpose === 'business_working_capital' || answers.purpose === 'business_asset';
  const rawProjectedIncome = answers.businessProjectedIncome || 0;
  const recognizedBusinessIncome = isBusinessPurpose
    ? rawProjectedIncome * PRODUCTIVE_DEBT_INCOME_HAIRCUT
    : 0;

  // Total lender-recognized monthly income
  const lenderMonthlyIncome = baseIncome + lenderCoIncome + recognizedBusinessIncome;

  // Safe income resolution (conservative if variable/informal)
  let safeBaseIncome = baseIncome;
  if (answers.incomeMin !== undefined && answers.incomeMax !== undefined) {
    // For informal or variable, lean towards lower-30th percentile of range
    safeBaseIncome = answers.incomeMin + 0.3 * (answers.incomeMax - answers.incomeMin);
  } else if (answers.variableIncomeShare && answers.variableIncomeShare > 30) {
    safeBaseIncome = baseIncome * VARIABLE_INCOME_CONSERVATIVE_FACTOR;
  }

  const safeMonthlyIncome = safeBaseIncome + safeCoIncome;

  // Determine Base FOIR Cap
  let baseFoirCap: number;
  switch (empType) {
    case 'salaried':
      baseFoirCap = isStable || stability === undefined ? FOIR_SALARIED_STABLE : FOIR_SALARIED_UNSTABLE;
      break;
    case 'self_employed_itr':
      baseFoirCap = isStable || stability === undefined ? FOIR_SELF_EMPLOYED_ITR_STABLE : FOIR_SELF_EMPLOYED_ITR_UNSTABLE;
      break;
    case 'self_employed_cash':
    case 'gig_informal':
      baseFoirCap = FOIR_INFORMAL_VARIABLE;
      break;
    case 'unemployed':
      baseFoirCap = FOIR_UNEMPLOYED;
      break;
    default:
      baseFoirCap = FOIR_INFORMAL_VARIABLE;
  }

  // Apply Adjustments to FOIR Cap
  let effectiveFoirCap = baseFoirCap;
  let isBouncePenalized = false;
  let isProductiveUplifted = false;

  if (hasBounce) {
    effectiveFoirCap = Math.max(0.1, effectiveFoirCap - FOIR_BOUNCE_PENALTY);
    isBouncePenalized = true;
  }

  if (isBusinessPurpose && recognizedBusinessIncome > 0) {
    const projectedUplift = Math.min(
      PRODUCTIVE_DEBT_MAX_FOIR_UPLIFT,
      (recognizedBusinessIncome / (baseIncome || 1)) * 0.2
    );
    effectiveFoirCap += projectedUplift;
    isProductiveUplifted = true;
  }

  // Lender Capacity
  const existingEmis = answers.existingEmis || 0;
  const lenderMaxTotalObligation = Math.round(lenderMonthlyIncome * effectiveFoirCap);
  const lenderAvailableEmi = Math.max(0, Math.round(lenderMaxTotalObligation - existingEmis));

  // Safe Household Cashflow Capacity
  const essentialExpenses = answers.essentialExpenses || 0;
  const savingsMonths = answers.emergencySavingsMonths;
  const savingsBufferPercent =
    savingsMonths !== undefined && savingsMonths >= EMERGENCY_SAVINGS_THRESHOLD_MONTHS
      ? DEFAULT_SAVINGS_BUFFER_PERCENT
      : ELEVATED_SAVINGS_BUFFER_PERCENT;

  const savingsBufferAmount = Math.round(safeMonthlyIncome * savingsBufferPercent);

  const upcomingExpenseMonthlyDeduction = answers.upcomingLargeExpense
    ? Math.round(answers.upcomingLargeExpense / UPCOMING_EXPENSE_MONTHLY_AMORTIZATION_MONTHS)
    : 0;

  const safeAvailableEmi = Math.max(
    0,
    Math.round(safeMonthlyIncome - existingEmis - essentialExpenses - savingsBufferAmount - upcomingExpenseMonthlyDeduction)
  );

  // Generate transparent plain-language reason
  const foirPercentStr = `${Math.round(effectiveFoirCap * 100)}%`;
  let foirReason = `Lenders allow up to ${foirPercentStr} of net monthly income for debt obligations.`;
  if (isBouncePenalized) {
    foirReason += ` (Reduced by 8% due to a recent payment bounce).`;
  }
  if (isProductiveUplifted) {
    foirReason += ` (Boosted slightly due to projected business income).`;
  }

  return {
    lenderMonthlyIncome,
    safeMonthlyIncome,
    baseFoirCap,
    effectiveFoirCap,
    lenderMaxTotalObligation,
    lenderAvailableEmi,
    savingsBufferPercent,
    savingsBufferAmount,
    upcomingExpenseMonthlyDeduction,
    safeAvailableEmi,
    isBouncePenalized,
    isProductiveUplifted,
    foirReason,
  };
}

import { describe, it, expect } from 'vitest';
import { computeFoirAndCashflow } from '../src/rules/foir';
import {
  FOIR_SALARIED_STABLE,
  FOIR_SALARIED_UNSTABLE,
  FOIR_INFORMAL_VARIABLE,
  FOIR_BOUNCE_PENALTY,
  DEFAULT_SAVINGS_BUFFER_PERCENT,
  ELEVATED_SAVINGS_BUFFER_PERCENT,
} from '../src/rules/constants';

describe('FOIR and Cashflow Calculations', () => {
  it('applies 55% FOIR cap for stable salaried borrowers (>2 years)', () => {
    const res = computeFoirAndCashflow({
      employmentType: 'salaried',
      incomeStability: 'gt_2_years',
      monthlyIncome: 100000,
      existingEmis: 10000,
      essentialExpenses: 40000,
    });

    expect(res.baseFoirCap).toBe(FOIR_SALARIED_STABLE);
    expect(res.effectiveFoirCap).toBe(0.55);
    expect(res.lenderMaxTotalObligation).toBe(55000);
    expect(res.lenderAvailableEmi).toBe(45000);
  });

  it('applies 45% FOIR cap for unstable salaried borrowers (<2 years)', () => {
    const res = computeFoirAndCashflow({
      employmentType: 'salaried',
      incomeStability: 'lt_2_years',
      monthlyIncome: 100000,
      existingEmis: 10000,
      essentialExpenses: 40000,
    });

    expect(res.effectiveFoirCap).toBe(FOIR_SALARIED_UNSTABLE);
    expect(res.lenderMaxTotalObligation).toBe(45000);
    expect(res.lenderAvailableEmi).toBe(35000);
  });

  it('applies 35% FOIR cap for informal/gig workers and applies conservative buffer', () => {
    const res = computeFoirAndCashflow({
      employmentType: 'gig_informal',
      incomeMin: 20000,
      incomeMax: 30000,
      existingEmis: 5000,
      essentialExpenses: 15000,
    });

    expect(res.effectiveFoirCap).toBe(FOIR_INFORMAL_VARIABLE);
    // Safe base income leans conservative towards 30th percentile: 20000 + 0.3 * 10000 = 23000
    expect(res.safeMonthlyIncome).toBe(23000);
  });

  it('penalizes FOIR by 8% when there is a recent bounce in last 12 months', () => {
    const res = computeFoirAndCashflow({
      employmentType: 'salaried',
      incomeStability: 'gt_2_years',
      monthlyIncome: 100000,
      existingEmis: 10000,
      bouncesLast12m: 1,
    });

    expect(res.isBouncePenalized).toBe(true);
    expect(res.effectiveFoirCap).toBeCloseTo(0.55 - FOIR_BOUNCE_PENALTY, 2);
  });

  it('uses 20% elevated savings buffer when emergency savings is under 3 months', () => {
    const res = computeFoirAndCashflow({
      employmentType: 'salaried',
      monthlyIncome: 100000,
      essentialExpenses: 30000,
      emergencySavingsMonths: 1,
    });

    expect(res.savingsBufferPercent).toBe(ELEVATED_SAVINGS_BUFFER_PERCENT);
    expect(res.savingsBufferAmount).toBe(20000);
  });

  it('uses 15% standard savings buffer when emergency savings is 3 months or more', () => {
    const res = computeFoirAndCashflow({
      employmentType: 'salaried',
      monthlyIncome: 100000,
      essentialExpenses: 30000,
      emergencySavingsMonths: 4,
    });

    expect(res.savingsBufferPercent).toBe(DEFAULT_SAVINGS_BUFFER_PERCENT);
    expect(res.savingsBufferAmount).toBe(15000);
  });

  it('weights co-applicant income at 100% for lender and 70% for safe cashflow', () => {
    const res = computeFoirAndCashflow({
      employmentType: 'salaried',
      monthlyIncome: 100000,
      coApplicantIncome: 50000,
    });

    expect(res.lenderMonthlyIncome).toBe(150000);
    expect(res.safeMonthlyIncome).toBe(135000); // 100000 + 0.7 * 50000
  });
});

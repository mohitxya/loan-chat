import { describe, it, expect } from 'vitest';
import { computeMaxAmount } from '../src/rules/eligibility';
import { computeEmiCeiling } from '../src/rules/emiCeiling';

describe('Eligibility (O2) and EMI Ceiling (O4)', () => {
  it('calculates distinct lender-likely and safe-to-carry loan amounts', () => {
    const res = computeMaxAmount({
      employmentType: 'salaried',
      monthlyIncome: 110000,
      existingEmis: 14000,
      essentialExpenses: 28000,
      collateral: 'none',
      purpose: 'wedding',
      amountWanted: 800000,
    });

    expect(res.lenderLikelyAmount).toBeGreaterThan(0);
    expect(res.safeToCarryAmount).toBeGreaterThan(0);
    // Because essential expenses and savings buffer are accounted for, safe amount is distinct
    expect(res.recommendation).toBeDefined();
    expect(res.recommendationReason).toContain('Stick to safe capacity');
  });

  it('evaluates stress cases for informal borrowers using income drop', () => {
    const res = computeEmiCeiling({
      employmentType: 'gig_informal',
      incomeMin: 26000,
      incomeMax: 30000,
      essentialExpenses: 18000,
      existingEmis: 3000,
      amountWanted: 150000,
      purpose: 'vehicle',
    });

    expect(res.stressCase.scenarioType).toBe('income_drop');
    expect(res.stressCase.shockValue).toBe('-20% income');
    expect(res.stressCase.stressVerdict).toBeDefined();
  });

  it('evaluates stress cases for long-tenure loans using interest rate hike', () => {
    const res = computeEmiCeiling({
      employmentType: 'salaried',
      monthlyIncome: 100000,
      essentialExpenses: 35000,
      existingEmis: 0,
      purpose: 'home_purchase',
      amountWanted: 3000000,
      requestedTenureMonths: 240,
    });

    expect(res.stressCase.scenarioType).toBe('rate_rise');
    expect(res.stressCase.shockValue).toBe('+2.0% rate');
    expect(res.stressCase.description).toContain('Macro Interest Rate Hike');
  });
});

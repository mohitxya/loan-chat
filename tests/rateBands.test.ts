import { describe, it, expect } from 'vitest';
import {
  computeRateBandAndApr,
  resolveRecommendedProduct,
  calculateEmi,
  calculateApr,
} from '../src/rules/rateBands';

describe('Rate Bands and All-In APR Calculations', () => {
  it('routes borrower with property collateral to LAP or Secured Business loan', () => {
    const res = resolveRecommendedProduct({
      purpose: 'business_working_capital',
      collateral: 'property',
    });

    expect(res.product).toBe('business_secured');
    expect(res.isSecuredRoute).toBe(true);

    const res2 = resolveRecommendedProduct({
      purpose: 'wedding',
      collateral: 'property',
    });
    expect(res2.product).toBe('lap');
    expect(res2.isSecuredRoute).toBe(true);
  });

  it('assigns 10.5% - 13.0% prime rate band for salaried with score >= 750', () => {
    const res = computeRateBandAndApr({
      employmentType: 'salaried',
      creditScoreKnown: true,
      creditScore: 780,
      collateral: 'none',
      amountWanted: 800000,
    });

    expect(res.productRecommended).toBe('personal');
    expect(res.minNominalRate).toBe(10.5);
    expect(res.maxNominalRate).toBe(13.0);
  });

  it('positions unknown credit score conservatively without defaulting to best or worst', () => {
    const res = computeRateBandAndApr({
      employmentType: 'salaried',
      creditScoreKnown: false,
      creditScore: null,
      collateral: 'none',
    });

    expect(res.minNominalRate).toBe(12.0);
    expect(res.maxNominalRate).toBe(15.0);
    expect(res.reason).toContain('unverified');
  });

  it('calculates standard EMI accurately', () => {
    // 10 Lakh at 12% for 36 months = ~₹33,214
    const emi = calculateEmi(1000000, 12, 36);
    expect(Math.round(emi)).toBe(33214);
  });

  it('calculates all-in APR higher than nominal rate due to processing fee and insurance', () => {
    const nominalRate = 12.0;
    const principal = 800000;
    const tenure = 36;
    const pf = 1.5;
    const insurance = 1200;

    const apr = calculateApr(principal, nominalRate, tenure, pf, insurance);
    expect(apr).toBeGreaterThan(nominalRate);
  });

  it('identifies predatory app loans charging >= 24% APR', () => {
    const res = computeRateBandAndApr({
      employmentType: 'gig_informal',
      existingAppLoanApr: 36,
      amountWanted: 150000,
      purpose: 'vehicle',
    });

    expect(res.isPredatoryTerritory).toBe(true);
    expect(res.existingDebtComparison).toBeDefined();
    expect(res.existingDebtComparison).toContain('above institutional fair lending rates');
  });
});

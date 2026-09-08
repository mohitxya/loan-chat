import { describe, it, expect } from 'vitest';
import { computeVerdict } from '../src/rules/verdict';

describe('Verdict Decision Rules (O1)', () => {
  it('triggers "Dont borrow" when borrower has zero active income', () => {
    const res = computeVerdict({
      employmentType: 'unemployed',
      amountWanted: 50000,
    });
    expect(res.verdict).toBe('DONT_BORROW');
    expect(res.label).toBe("Don't borrow");
  });

  it('triggers "Dont borrow" when essential expenses + existing EMIs exceed income', () => {
    const res = computeVerdict({
      employmentType: 'salaried',
      monthlyIncome: 50000,
      existingEmis: 25000,
      essentialExpenses: 30000, // Total = 55,000 > 50,000
      amountWanted: 200000,
    });
    expect(res.verdict).toBe('DONT_BORROW');
    expect(res.reason).toContain('leave no safe cashflow cushion');
  });

  it('triggers "Dont borrow" when there is a recent bounce and debt ratio > 45%', () => {
    const res = computeVerdict({
      employmentType: 'salaried',
      monthlyIncome: 60000,
      existingEmis: 30000, // 50% debt ratio
      bouncesLast12m: 1,
      essentialExpenses: 15000,
      amountWanted: 100000,
    });
    expect(res.verdict).toBe('DONT_BORROW');
    expect(res.reason).toContain('recent payment bounce');
  });

  it('triggers "Borrow less" when requested amount exceeds safe capacity by >10%', () => {
    const res = computeVerdict({
      employmentType: 'salaried',
      monthlyIncome: 80000,
      existingEmis: 10000,
      essentialExpenses: 35000,
      amountWanted: 2500000, // Very high ask
    });
    expect(res.verdict).toBe('BORROW_LESS');
    expect(res.label).toBe('Borrow less');
    expect(res.reason).toContain('exceeds');
  });

  it('triggers "Borrow" when requested amount is comfortably within safe capacity', () => {
    const res = computeVerdict({
      employmentType: 'salaried',
      monthlyIncome: 150000,
      existingEmis: 10000,
      essentialExpenses: 40000,
      amountWanted: 300000, // Modest ask
    });
    expect(res.verdict).toBe('BORROW');
    expect(res.label).toBe('Borrow');
    expect(res.reason).toContain('comfortably within your safe borrowing capacity');
  });
});

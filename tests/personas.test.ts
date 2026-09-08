import { describe, it, expect } from 'vitest';
import { runDecisionEngine } from '../src/rules/engine';
import { Answers } from '../src/rules/types';

describe('Persona Acceptance Tests (Priya, Ravi, Anita & Must-Ask Only)', () => {
  it('Priya: Salaried engineer, ₹8L wedding loan, 780 score, car EMI ₹14k', () => {
    const priyaAnswers: Answers = {
      purpose: 'wedding',
      loanProductWanted: 'personal',
      amountWanted: 800000,
      employmentType: 'salaried',
      monthlyIncome: 110000,
      existingEmis: 14000,
      essentialExpenses: 28000,
      age: 29,
      creditScoreKnown: true,
      creditScore: 780,
      collateral: 'none',
      incomeStability: 'gt_2_years',
      bouncesLast12m: 0,
      emergencySavingsMonths: 4,
      creditCardUtilisation: 15,
    };

    const result = runDecisionEngine(priyaAnswers, 14, 14);

    // O1: Verdict
    expect(result.o1.verdict).toBe('BORROW');
    expect(result.o1.reason).toContain('8 Lakh');
    expect(result.o1.confidence).toBe('High');

    // O2: Safe-to-carry vs Lender-likely
    expect(result.o2.lenderLikelyAmount).toBeGreaterThan(0);
    expect(result.o2.safeToCarryAmount).toBeGreaterThan(0);
    expect(result.o2.lenderLikelyAmount).not.toBe(result.o2.safeToCarryAmount);
    expect(result.o2.recommendation).toBe('lender_likely');
    expect(result.o2.recommendationReason).toContain('bank FOIR policies will likely cap sanction');

    // O3: Fair interest rate band (10.5% - 13.0%)
    expect(result.o3.productRecommended).toBe('personal');
    expect(result.o3.minNominalRate).toBe(10.5);
    expect(result.o3.maxNominalRate).toBe(13.0);
    expect(result.o3.minApr).toBeGreaterThan(10.5);
    expect(result.o3.reason).toContain('780');

    // O4: EMI ceiling
    expect(result.o4.maxSafeEmi).toBeGreaterThan(0);
    expect(result.o4.stressCase.survivesStress).toBe(true);

    // Every card has a non-empty why
    expect(result.o1.reason.length).toBeGreaterThan(10);
    expect(result.o2.reason.length).toBeGreaterThan(10);
    expect(result.o3.reason.length).toBeGreaterThan(10);
    expect(result.o4.reason.length).toBeGreaterThan(10);
  });

  it('Ravi: Kirana store owner, cash ₹40k-80k, ITR ₹4.2L, shop collateral ₹45L, ₹15L ask', () => {
    const raviAnswers: Answers = {
      purpose: 'business_working_capital',
      amountWanted: 1500000,
      employmentType: 'self_employed_cash',
      incomeMin: 40000,
      incomeMax: 80000,
      existingEmis: 0,
      essentialExpenses: 25000,
      age: 42,
      creditScoreKnown: false,
      creditScore: null,
      collateral: 'property',
      collateralValue: 4500000,
      incomeStability: 'gt_2_years',
      bouncesLast12m: 0,
      coApplicantIncome: 18000, // wife
      variableIncomeShare: 35,
      businessProjectedIncome: 25000,
    };

    const result = runDecisionEngine(raviAnswers, 15, 15);

    // O3: Routes to secured product (business_secured) with significantly lower rate band!
    expect(result.o3.productRecommended).toBe('business_secured');
    expect(result.o3.minNominalRate).toBe(10.0);
    expect(result.o3.maxNominalRate).toBe(14.0);
    // Unsecured personal loan for self-employed would be 15%-20%, so secured is materially lower
    expect(result.o3.minNominalRate).toBeLessThan(15.0);
    expect(result.o3.reason).toContain('property collateral');

    // O2: Collateral supports loan
    expect(result.o2.lenderLikelyAmount).toBeGreaterThan(0);
    expect(result.o2.reason).toBeDefined();

    // Why statements are populated
    expect(result.o1.reason.length).toBeGreaterThan(10);
    expect(result.o2.reason.length).toBeGreaterThan(10);
    expect(result.o3.reason.length).toBeGreaterThan(10);
    expect(result.o4.reason.length).toBeGreaterThan(10);
  });

  it('Anita: Informal delivery/tailor, ₹26k-30k, 3 app loans at 30%+, bounce last month, ₹1.5L EV ask', () => {
    const anitaAnswers: Answers = {
      purpose: 'vehicle',
      loanProductWanted: 'vehicle_tw',
      amountWanted: 150000,
      employmentType: 'gig_informal',
      incomeMin: 26000,
      incomeMax: 30000,
      existingEmis: 7500, // app loan EMIs
      essentialExpenses: 18000,
      age: 35,
      creditScoreKnown: false,
      creditScore: null,
      collateral: 'none',
      incomeStability: 'lt_2_years',
      bouncesLast12m: 1, // recent bounce
      emergencySavingsMonths: 0,
      existingAppLoanApr: 36, // 30%+ app debt
    };

    const result = runDecisionEngine(anitaAnswers, 14, 14);

    // O1: Anita should produce "Don't borrow" or "Borrow less"
    expect(['DONT_BORROW', 'BORROW_LESS']).toContain(result.o1.verdict);

    // O3: Identifies existing debt as predatory (>24%)
    expect(result.o3.isPredatoryTerritory).toBe(true);
    expect(result.o3.existingDebtComparison).toBeDefined();
    expect(result.o3.existingDebtComparison).toContain('above institutional fair lending rates');

    // O4: Stress test shows vulnerability
    expect(result.o4.stressCase.scenarioType).toBe('income_drop');
  });

  it('Must-ask tier answered only: produces all four outputs with Low confidence and tightening hints', () => {
    const mustAskOnlyAnswers: Answers = {
      purpose: 'wedding',
      amountWanted: 500000,
      employmentType: 'salaried',
      monthlyIncome: 60000,
      existingEmis: 5000,
      essentialExpenses: 25000,
      age: 30,
      creditScoreKnown: false,
      creditScore: null,
      collateral: 'none',
    };

    const result = runDecisionEngine(mustAskOnlyAnswers, 10, 14);

    // All four outputs are produced
    expect(result.o1).toBeDefined();
    expect(result.o2).toBeDefined();
    expect(result.o3).toBeDefined();
    expect(result.o4).toBeDefined();

    // All four marked Low confidence
    expect(result.o1.confidence).toBe('Low');
    expect(result.o2.confidence).toBe('Low');
    expect(result.o3.confidence).toBe('Low');
    expect(result.o4.confidence).toBe('Low');

    // All four have visible tightening hints
    expect(result.o1.tighteningHint).toContain('Must-ask tier answered');
    expect(result.o2.tighteningHint).toContain('Must-ask tier answered');
    expect(result.o3.tighteningHint).toContain('Must-ask tier answered');
    expect(result.o4.tighteningHint).toContain('Must-ask tier answered');
  });
});

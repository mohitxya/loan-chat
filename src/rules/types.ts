/**
 * Pure data types for Borrower Copilot decision engine.
 * No React/JSX dependencies permitted.
 */

export type EmploymentType =
  | 'salaried'
  | 'self_employed_itr'
  | 'self_employed_cash'
  | 'gig_informal'
  | 'unemployed';

export type LoanPurpose =
  | 'wedding'
  | 'education'
  | 'medical'
  | 'vehicle'
  | 'business_working_capital'
  | 'business_asset'
  | 'home_purchase'
  | 'home_renovation'
  | 'debt_consolidation'
  | 'other';

export type LoanProduct =
  | 'personal'
  | 'home'
  | 'lap'
  | 'gold'
  | 'vehicle_tw'
  | 'business_secured'
  | 'business_unsecured'
  | 'informal_app';

export type CollateralType = 'property' | 'gold' | 'fd' | 'none';

export type IncomeStability = 'gt_2_years' | 'lt_2_years' | 'lt_6_months';

export interface Answers {
  // Must-ask tier (1-10)
  purpose?: LoanPurpose;
  loanProductWanted?: LoanProduct;
  amountWanted?: number;
  employmentType?: EmploymentType;
  monthlyIncome?: number;
  incomeMin?: number;
  incomeMax?: number;
  existingEmis?: number;
  essentialExpenses?: number;
  age?: number;
  creditScoreKnown?: boolean;
  creditScore?: number | null; // null if unknown
  collateral?: CollateralType;

  // Additional adaptive tier
  incomeStability?: IncomeStability;
  bouncesLast12m?: number;
  emergencySavingsMonths?: number;
  upcomingLargeExpense?: number;
  existingOffers?: { rate: number; amount: number; lenderName?: string }[];
  coApplicantIncome?: number;
  creditCardUtilisation?: number; // 0 to 100
  variableIncomeShare?: number; // 0 to 100
  collateralValue?: number;
  businessProjectedIncome?: number; // incremental monthly income expected
  existingAppLoanApr?: number; // e.g. 30%+
  requestedTenureMonths?: number;
}

export type ConfidenceLevel = 'Low' | 'Medium' | 'High';

export type VerdictType = 'BORROW' | 'BORROW_LESS' | 'DONT_BORROW';

export interface VerdictOutput {
  verdict: VerdictType;
  label: 'Borrow' | 'Borrow less' | "Don't borrow";
  reason: string;
  confidence: ConfidenceLevel;
  tighteningHint: string;
}

export interface MaxAmountOutput {
  lenderLikelyAmount: number;
  safeToCarryAmount: number;
  recommendedAmount: number;
  recommendation: 'lender_likely' | 'safe_to_carry';
  recommendationReason: string;
  reason: string;
  confidence: ConfidenceLevel;
  tighteningHint: string;
}

export interface InterestRateOutput {
  productRecommended: LoanProduct;
  productLabel: string;
  minNominalRate: number; // in percent e.g. 10.5
  maxNominalRate: number; // in percent e.g. 13.0
  minApr: number; // in percent e.g. 11.2
  maxApr: number; // in percent e.g. 13.9
  assumedProcessingFeePercent: number; // e.g. 1.5
  mandatoryInsuranceEstimate: number; // in ₹
  isPredatoryTerritory: boolean;
  competingOfferComparison?: string;
  existingDebtComparison?: string;
  reason: string;
  confidence: ConfidenceLevel;
  tighteningHint: string;
}

export interface TenureOption {
  tenureMonths: number;
  estimatedEmi: number;
  totalInterest: number;
  isSafe: boolean;
}

export interface StressCase {
  scenarioType: 'income_drop' | 'rate_rise';
  description: string;
  shockValue: string; // e.g. "-20% income" or "+2.0% interest rate"
  stressedEmiCapacity: number;
  stressedEmiForProposed: number;
  survivesStress: boolean;
  stressVerdict: string;
}

export interface EmiCeilingOutput {
  maxSafeEmi: number;
  lenderMaxEmi: number;
  tenureOptions: TenureOption[];
  stressCase: StressCase;
  reason: string;
  confidence: ConfidenceLevel;
  tighteningHint: string;
}

export interface NegotiationCardPayload {
  borrowerAsk: {
    amount: number;
    purpose: string;
    suggestedProduct: string;
  };
  o1: VerdictOutput;
  o2: MaxAmountOutput;
  o3: InterestRateOutput;
  o4: EmiCeilingOutput;
  counterOfferScript: string;
  lenderQuestions: string[];
  answeredQuestionCount: number;
  totalPossibleQuestions: number;
  confidenceDisclosure: string;
}

export interface EngineResult {
  o1: VerdictOutput;
  o2: MaxAmountOutput;
  o3: InterestRateOutput;
  o4: EmiCeilingOutput;
  negotiationCard: NegotiationCardPayload;
  answeredCount: number;
  totalApplicableCount: number;
}

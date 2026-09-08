/**
 * All numeric thresholds, bands, penalties, and cutoffs live here.
 * Absolutely NO bare numeric literals in /src/rules/ outside this file.
 * Auditable 1:1 against RULES.md.
 */

// ==========================================
// 1. FOIR (Fixed Obligation to Income Ratio) Caps
// ==========================================

/** Maximum obligation ratio for salaried borrowers with stable job (>2 years) */
export const FOIR_SALARIED_STABLE = 0.55;

/** Maximum obligation ratio for salaried borrowers with tenure <2 years or contract */
export const FOIR_SALARIED_UNSTABLE = 0.45;

/** Maximum obligation ratio for self-employed with ITR and >2 years business vintage */
export const FOIR_SELF_EMPLOYED_ITR_STABLE = 0.45;

/** Maximum obligation ratio for self-employed with ITR and <2 years vintage */
export const FOIR_SELF_EMPLOYED_ITR_UNSTABLE = 0.40;

/** Maximum obligation ratio for cash-based self-employed or gig/informal workers */
export const FOIR_INFORMAL_VARIABLE = 0.35;

/** Maximum obligation ratio for unemployed borrowers */
export const FOIR_UNEMPLOYED = 0.00;

/** FOIR cap reduction penalty if borrower had any EMI/bill bounce in last 12 months */
export const FOIR_BOUNCE_PENALTY = 0.08;

/** Haircut on projected incremental business income for productive debt (recognize 50%) */
export const PRODUCTIVE_DEBT_INCOME_HAIRCUT = 0.50;

/** Hard ceiling on total FOIR uplift granted for productive business debt */
export const PRODUCTIVE_DEBT_MAX_FOIR_UPLIFT = 0.10;

/** Co-applicant income weight used by lenders (100% of verified net income) */
export const CO_APPLICANT_INCOME_LENDER_WEIGHT = 1.00;

/** Co-applicant income weight for safe cashflow (70% weight, 30% safety haircut) */
export const CO_APPLICANT_INCOME_SAFE_WEIGHT = 0.70;


// ==========================================
// 2. Household Cashflow & Buffer Thresholds
// ==========================================

/** Baseline percentage of net income reserved for non-discretionary savings/cushion */
export const DEFAULT_SAVINGS_BUFFER_PERCENT = 0.15;

/** Elevated savings buffer percentage when borrower has under 3 months emergency fund */
export const ELEVATED_SAVINGS_BUFFER_PERCENT = 0.20;

/** Threshold in months of essential expenses defining adequate emergency savings */
export const EMERGENCY_SAVINGS_THRESHOLD_MONTHS = 3;

/** Number of months over which an upcoming large lump-sum expense is amortized */
export const UPCOMING_EXPENSE_MONTHLY_AMORTIZATION_MONTHS = 12;

/** Haircut factor applied to safe borrowing capacity if borrower has high income volatility */
export const VARIABLE_INCOME_CONSERVATIVE_FACTOR = 0.85;


// ==========================================
// 3. Product Base Rate Bands (% per annum)
// ==========================================

// Home Loan
export const RATE_BAND_HOME_MIN = 8.50;
export const RATE_BAND_HOME_MAX = 9.50;

// Loan Against Property (LAP) - Secured
export const RATE_BAND_LAP_MIN = 9.50;
export const RATE_BAND_LAP_MAX = 11.50;

// Gold Loan - Secured
export const RATE_BAND_GOLD_MIN = 9.00;
export const RATE_BAND_GOLD_MAX = 15.00;

// Personal Loan - Salaried Tier 1 (Bureau Score >= 750, Stable)
export const RATE_BAND_PERSONAL_TIER1_MIN = 10.50;
export const RATE_BAND_PERSONAL_TIER1_MAX = 13.00;

// Personal Loan - Salaried Tier 2 (Bureau Score 650 - 749)
export const RATE_BAND_PERSONAL_TIER2_MIN = 13.00;
export const RATE_BAND_PERSONAL_TIER2_MAX = 16.00;

// Personal Loan - Self-employed or No Formal Bureau Score
export const RATE_BAND_PERSONAL_NO_SCORE_MIN = 15.00;
export const RATE_BAND_PERSONAL_NO_SCORE_MAX = 20.00;

// Two-Wheeler / Electric Vehicle (EV) Loan
export const RATE_BAND_VEHICLE_TW_MIN = 11.00;
export const RATE_BAND_VEHICLE_TW_MAX = 16.00;

// Business Loan - Secured (Collateralized)
export const RATE_BAND_BUSINESS_SECURED_MIN = 10.00;
export const RATE_BAND_BUSINESS_SECURED_MAX = 14.00;

// Business Loan - Unsecured (Formal NBFC / Bank)
export const RATE_BAND_BUSINESS_UNSECURED_MIN = 16.00;
export const RATE_BAND_BUSINESS_UNSECURED_MAX = 22.00;

// Threshold for informal/app-based predatory rate warning
export const RATE_PREDATORY_THRESHOLD = 24.00;


// ==========================================
// 4. Credit Score & Profile Adjusters
// ==========================================

/** Excellent bureau credit score threshold */
export const CREDIT_SCORE_TIER1_THRESHOLD = 750;

/** Fair bureau credit score threshold */
export const CREDIT_SCORE_TIER2_THRESHOLD = 650;

/** Placement ratio within rate band when credit score is Unknown (65% = upper-middle) */
export const SCORE_UNKNOWN_BAND_POSITION = 0.65;

/** High revolving credit card utilization percentage threshold */
export const HIGH_CC_UTILIZATION_THRESHOLD = 40.0;

/** Rate penalty added to nominal rate band for high credit card utilization */
export const CC_UTILIZATION_RATE_PENALTY = 0.75;


// ==========================================
// 5. Processing Fees, Insurance & All-In APR
// ==========================================

/** Standard industry average processing fee percentage of sanctioned loan amount */
export const DEFAULT_PROCESSING_FEE_PERCENT = 1.50;

/** Minimum processing fee percentage typically seen in prime lender promotions */
export const MIN_PROCESSING_FEE_PERCENT = 0.50;

/** Maximum processing fee percentage typically charged by retail lenders */
export const MAX_PROCESSING_FEE_PERCENT = 2.50;

/** Estimated annual loan protection insurance premium per ₹1,00,000 loan balance */
export const MANDATORY_INSURANCE_RATE_PER_LAKH = 150;


// ==========================================
// 6. Default Tenures by Product (Months)
// ==========================================

export const DEFAULT_TENURE_PERSONAL_MONTHS = 36;
export const DEFAULT_TENURE_HOME_MONTHS = 240;
export const DEFAULT_TENURE_LAP_MONTHS = 120;
export const DEFAULT_TENURE_GOLD_MONTHS = 12;
export const DEFAULT_TENURE_VEHICLE_MONTHS = 36;
export const DEFAULT_TENURE_BUSINESS_MONTHS = 36;


// ==========================================
// 7. Collateral Loan-To-Value (LTV) Caps
// ==========================================

/** Maximum Loan-to-Value for unencumbered residential/commercial property (LAP) */
export const LTV_PROPERTY_LAP = 0.65;

/** RBI statutory regulatory Loan-to-Value cap for Gold Loans */
export const LTV_GOLD = 0.75;

/** Loan-to-Value for loans against Fixed Deposits */
export const LTV_FD = 0.90;


// ==========================================
// 8. Verdict Decision Thresholds
// ==========================================

/** Percentage margin by which requested amount can exceed safe amount before 'Borrow less' triggers */
export const BORROW_LESS_MARGIN = 0.10;

/** Existing debt obligation ratio that triggers 'Don't borrow' when combined with recent bounce */
export const HIGH_OBLIGATION_RATIO_BOUNCE_THRESHOLD = 0.45;


// ==========================================
// 9. Deterministic Stress Testing
// ==========================================

/** Income drop shock percentage applied to variable/gig/informal borrowers (-20%) */
export const STRESS_INCOME_DROP_PERCENT = 0.20;

/** Interest rate hike shock in percentage points applied to long-tenure/floating loans (+2.0%) */
export const STRESS_RATE_HIKE_PERCENT = 2.00;

/** Income drop shock percentage applied to salaried borrowers on short tenure loans (-15%) */
export const STRESS_SHORT_TENURE_INCOME_DROP_PERCENT = 0.15;

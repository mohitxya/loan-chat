# Borrower Copilot: Domain Rules & Auditable Thresholds

This document is the single source of truth for all mathematical assumptions, eligibility formulas, pricing bands, and stress testing multipliers implemented in Borrower Copilot. Every value here maps 1:1 to a named constant in [`src/rules/constants.ts`](file:///home/mohit/projects/loan-chat/src/rules/constants.ts).

| What | Value | Why | Source or "my judgement" |
| :--- | :--- | :--- | :--- |
| `FOIR_SALARIED_STABLE` | `0.55` (55%) | Maximum permissible debt obligations (existing + new EMI) as a percentage of verified net monthly salary for borrowers with >2 years job stability. | Industry standard Indian retail banking credit policy (HDFC/ICICI/SBI credit manual guidelines). |
| `FOIR_SALARIED_UNSTABLE` | `0.45` (45%) | Lower obligation ceiling for salaried employees with <2 years tenure, probationary status, or contract roles due to higher layoff/attrition risk. | Standard Indian NBFC underwriting risk discount. |
| `FOIR_SELF_EMPLOYED_ITR_STABLE` | `0.45` (45%) | Obligation ceiling for self-employed professionals/business owners with documented Income Tax Returns (ITR) and >2 years business vintage. | Banking policy acknowledging business working capital cycles and operating overheads. |
| `FOIR_SELF_EMPLOYED_ITR_UNSTABLE` | `0.40` (40%) | Stricter ceiling for newer self-employed enterprises (<2 years vintage) lacking multi-year financial audits. | Standard retail risk policy. |
| `FOIR_INFORMAL_VARIABLE` | `0.35` (35%) | Conservative obligation ceiling for cash-based self-employed and informal/gig workers lacking formal documentation. Prevents catastrophic debt traps. | Microfinance & informal lending prudence; "my judgement". |
| `FOIR_UNEMPLOYED` | `0.00` (0%) | Zero borrowing allowance for borrowers without an active income stream. | Fundamental lending credit risk principle. |
| `FOIR_BOUNCE_PENALTY` | `0.08` (-8%) | Direct reduction applied to permissible FOIR cap if borrower had any NACH/ECS, cheque, or EMI bounce in the prior 12 months. | Credit scoring impact of unpaid clearing debits; "my judgement". |
| `PRODUCTIVE_DEBT_INCOME_HAIRCUT` | `0.50` (50%) | Recognizes 50% of claimed future incremental monthly earnings when loan is taken for productive business assets or working capital. | Conservative discounting of unrealized business projections; "my judgement". |
| `PRODUCTIVE_DEBT_MAX_FOIR_UPLIFT` | `0.10` (+10%) | Hard ceiling on the FOIR uplift that can be unlocked via projected business revenue (e.g. 40% cap can rise to at most 50%). | Prevents overleveraging on speculative forward-looking business projections; "my judgement". |
| `CO_APPLICANT_INCOME_LENDER_WEIGHT` | `1.00` (100%) | Lenders pool 100% of verified co-borrower net monthly income into household FOIR calculation. | Standard Indian joint-borrower banking practice (RBI/Bank master circulars). |
| `CO_APPLICANT_INCOME_SAFE_WEIGHT` | `0.70` (70%) | Borrower Copilot haircuts co-applicant income by 30% when computing safe household cashflow capacity. Protects against career interruptions or non-co-liability in practice. | Conservative household risk management; "my judgement". |
| `DEFAULT_SAVINGS_BUFFER_PERCENT` | `0.15` (15%) | Percentage of monthly net income set aside for living contingency and non-discretionary savings before allocating money to debt servicing. | Household finance best practices (50-30-20 rule adapted for retail debt). |
| `ELEVATED_SAVINGS_BUFFER_PERCENT` | `0.20` (20%) | Increased buffer enforced when borrower reports having under 3 months of emergency expenses saved. | Financial resilience defense against sudden medical or job shocks; "my judgement". |
| `EMERGENCY_SAVINGS_THRESHOLD_MONTHS` | `3` months | Minimum emergency fund threshold to be considered adequately buffered against temporary income disruption. | RBI & SEBI financial literacy guidelines. |
| `UPCOMING_EXPENSE_MONTHLY_AMORTIZATION_MONTHS` | `12` months | Amortizes a known upcoming lump-sum expense (e.g. school fee, surgery, deposit) over 12 months, deducting it directly from monthly EMI capacity. | Cash-flow smoothing principle; "my judgement". |
| `VARIABLE_INCOME_CONSERVATIVE_FACTOR` | `0.85` (85%) | Multiplier applied to safe capacity if borrower has high income volatility (>30% variation between best and worst months). | Risk haircut for cyclical earnings; "my judgement". |
| `RATE_BAND_HOME_MIN` | `8.50%` | Lower bound of prevailing prime home loan interest rates for Tier-1 salaried borrowers. | Current Indian mortgage market benchmark (Repo Rate + spread, SBI/HDFC 2024-2026). |
| `RATE_BAND_HOME_MAX` | `9.50%` | Upper bound of prime home loan rates for standard retail profiles. | Prevailing retail floating home loan card rates. |
| `RATE_BAND_LAP_MIN` | `9.50%` | Lower bound for Loan Against Property (LAP) secured against unencumbered residential property. | Indian mortgage market benchmarks (Repo + 300 bps). |
| `RATE_BAND_LAP_MAX` | `11.50%` | Upper bound for standard retail LAP financing across commercial and private banks. | Standard NBFC and private bank LAP card rates. |
| `RATE_BAND_GOLD_MIN` | `9.00%` | Low-end promotional rate for Gold Loans from public sector banks (SBI, Canara). | Market gold loan benchmarks. |
| `RATE_BAND_GOLD_MAX` | `15.00%` | Upper end for retail NBFC gold loan schemes (Muthoot, Manappuram). | Standard gold loan NBFC pricing schedules. |
| `RATE_BAND_PERSONAL_TIER1_MIN` | `10.50%` | Lowest prime rate for salaried professionals at top-tier employers with bureau score ≥750. | Prime salaried personal loan pricing (Tata Capital, HDFC, ICICI). |
| `RATE_BAND_PERSONAL_TIER1_MAX` | `13.00%` | Upper bound of prime tier personal loan rates. | Prime salaried personal loan pricing. |
| `RATE_BAND_PERSONAL_TIER2_MIN` | `13.00%` | Entry rate for salaried borrowers with moderate bureau score (650–749). | Standard private bank/NBFC personal loan pricing. |
| `RATE_BAND_PERSONAL_TIER2_MAX` | `16.00%` | Upper bound for moderate salaried personal loans. | Standard retail risk pricing. |
| `RATE_BAND_PERSONAL_NO_SCORE_MIN` | `15.00%` | Lower bound for self-employed individuals or thin-file borrowers with no formal bureau credit history. | NBFC unrated personal loan pricing bands. |
| `RATE_BAND_PERSONAL_NO_SCORE_MAX` | `20.00%` | Upper bound for formal unsecured credit extended to unrated informal borrowers. | FinTech & NBFC risk-adjusted pricing. |
| `RATE_BAND_VEHICLE_TW_MIN` | `11.00%` | Lower bound for two-wheeler and electric vehicle (EV) hypothecated financing. | Two-wheeler manufacturer captive finance (Hero Fincorp, Bajaj Auto Finance). |
| `RATE_BAND_VEHICLE_TW_MAX` | `16.00%` | Upper bound for standard retail two-wheeler loans. | Retail two-wheeler card rates. |
| `RATE_BAND_BUSINESS_SECURED_MIN` | `10.00%` | Prime interest rate for collateralized SME / business working capital facilities against property/FD. | MSME secured priority sector lending benchmark. |
| `RATE_BAND_BUSINESS_SECURED_MAX` | `14.00%` | Upper bound for secured business credit. | Standard commercial secured lending. |
| `RATE_BAND_BUSINESS_UNSECURED_MIN` | `16.00%` | Lower bound for unsecured business term loans and merchant cash advances. | FinTech MSME lending rates (Lendingkart, Indifi). |
| `RATE_BAND_BUSINESS_UNSECURED_MAX` | `22.00%` | Upper bound for unsecured business loans before venturing into distressed risk territory. | Formal NBFC MSME ceiling. |
| `RATE_PREDATORY_THRESHOLD` | `24.00%` | Annual percentage rate (APR) at or above which loans are explicitly flagged to the borrower as predatory/usurious. | RBI Fair Practices Code on Micro-loans & Usurious Lending; "my judgement". |
| `CREDIT_SCORE_TIER1_THRESHOLD` | `750` | Bureau score qualifying for prime interest rates and simplified underwriting. | CIBIL/Experian prime threshold adopted by Indian retail banks. |
| `CREDIT_SCORE_TIER2_THRESHOLD` | `650` | Cutoff separating acceptable retail credit profiles from high-risk/subprime bands. | TransUnion CIBIL retail threshold. |
| `SCORE_UNKNOWN_BAND_POSITION` | `0.65` (65%) | When credit score is unknown, position borrower at 65% up the applicable product band (upper-middle) rather than worst-case (100%) or best-case (0%). | Fair estimation avoiding punitive assumptions; "my judgement". |
| `HIGH_CC_UTILIZATION_THRESHOLD` | `40.0%` | Credit card revolving utilization percentage above which underwriting flags credit stress. | CIBIL credit scoring algorithm trigger point. |
| `CC_UTILIZATION_RATE_PENALTY` | `0.75%` | Interest rate penalty added to personal loan offers if card utilization exceeds 40%. | Bureau score impact pricing adjustment; "my judgement". |
| `DEFAULT_PROCESSING_FEE_PERCENT` | `1.50%` | Standard retail loan upfront processing fee percentage applied in all-in APR calculations. | Retail banking market median. |
| `MIN_PROCESSING_FEE_PERCENT` | `0.50%` | Promotional festive season processing fee floor. | Festive bank campaign benchmarks. |
| `MAX_PROCESSING_FEE_PERCENT` | `2.50%` | Retail processing fee ceiling commonly observed for unsecured credit. | Regulatory norms on transparent fee caps. |
| `MANDATORY_INSURANCE_RATE_PER_LAKH` | `₹150` | Annualized credit protection / term insurance premium per ₹1,00,000 of sanctioned loan amount. | Group credit life insurance rates (SBI Life/ICICI Pru). |
| `DEFAULT_TENURE_PERSONAL_MONTHS` | `36` (3 yrs) | Standard retail personal loan repayment tenure. | Market convention. |
| `DEFAULT_TENURE_HOME_MONTHS` | `240` (20 yrs) | Benchmark mortgage duration for retail affordability and EMI sizing. | Standard Indian housing finance tenure. |
| `DEFAULT_TENURE_LAP_MONTHS` | `120` (10 yrs) | Benchmark duration for Loan Against Property. | Commercial mortgage standard. |
| `DEFAULT_TENURE_GOLD_MONTHS` | `12` (1 yr) | Standard bullet or EMI gold loan cycle. | RBI gold loan regulatory tenure norms. |
| `DEFAULT_TENURE_VEHICLE_MONTHS` | `36` (3 yrs) | Typical two-wheeler / EV loan duration. | Auto finance industry standard. |
| `DEFAULT_TENURE_BUSINESS_MONTHS` | `36` (3 yrs) | Medium-term working capital repayment schedule. | Commercial banking convention. |
| `LTV_PROPERTY_LAP` | `0.65` (65%) | Maximum Loan-to-Value permissible on unencumbered property collateral for LAP. | RBI master circular on housing/commercial mortgage LTV caps. |
| `LTV_GOLD` | `0.75` (75%) | Statutory regulatory ceiling on Loan-to-Value for gold loans in India. | RBI statutory directive on gold pledge LTV. |
| `LTV_FD` | `0.90` (90%) | Maximum Loan-to-Value permissible against bank Fixed Deposits. | Banking regulation on lien-marked term deposits. |
| `BORROW_LESS_MARGIN` | `0.10` (10%) | Percentage threshold by which requested loan can exceed safe-to-carry capacity before triggering a "Borrow less" verdict. | Behavioral buffer to prevent over-indebtedness; "my judgement". |
| `HIGH_OBLIGATION_RATIO_BOUNCE_THRESHOLD` | `0.45` (45%) | Existing debt ratio that, when combined with any bounce in the last 12 months, automatically triggers "Don't borrow". | Early default risk prevention rule; "my judgement". |
| `STRESS_INCOME_DROP_PERCENT` | `0.20` (-20%) | Deterministic stress shock simulating a 20% drop in net monthly earnings for variable/informal/gig workers. | Cashflow volatility buffer for informal economy; "my judgement". |
| `STRESS_RATE_HIKE_PERCENT` | `2.00%` (+200 bps) | Deterministic stress shock simulating a 200 bps interest rate hike for floating/long-tenure loans (>36 months). | Historical RBI repo rate tightening cycle amplitude (2022–2023). |
| `STRESS_SHORT_TENURE_INCOME_DROP_PERCENT` | `0.15` (-15%) | Deterministic stress shock simulating a 15% salary shock / emergency disruption for salaried borrowers with short-term loans. | Standard personal financial resilience buffer; "my judgement". |

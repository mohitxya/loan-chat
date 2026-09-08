# Borrower Persona Run-Through: Priya

## 1. Borrower Profile
- **Name & Age:** Priya, 29 years old, Bengaluru
- **Profession & Stability:** Salaried Software Engineer, 5 years vintage at current tech firm
- **Monthly Income:** ₹1,10,000 (net take-home bank credit)
- **Existing Obligations:** Car loan EMI ₹14,000/month (2 years remaining)
- **Essential Living Costs:** Rent ₹28,000/month + utilities & living expenses
- **Credit Profile:** CIBIL Score 780 (Tier 1 Prime)
- **Collateral:** None (seeking unsecured credit)
- **Loan Request:** ₹8,00,000 for wedding expenses (36 months tenure)

---

## 2. Questionnaire Branching & Answers Submitted

Priya encountered 14 total questions (10 Must-Ask + 4 Adaptive Additional):

| Step | Question ID | Question Prompt | Priya's Answer | Why This Was Asked / Branching Logic |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `purpose` | What is the primary purpose of this loan? | `wedding` (Wedding / Family Ceremony) | Base question: identifies loan intent. |
| 2 | `amountWanted` | How much money are you looking to borrow? | `₹8,00,000` | Sizing anchor for FOIR and EMI obligations. |
| 3 | `loanProductWanted` | Which loan product are you seeking? | `personal` (Personal Loan - Unsecured) | Baseline product preference. |
| 4 | `employmentType` | Primary employment source? | `salaried` (Salaried Professional) | Routes to salaried branching path; sets 55% baseline FOIR. |
| 5 | `monthlyIncome` | Net monthly take-home salary? | `₹1,10,000` | Anchor for repayment capacity. |
| 6 | `existingEmis` | Total monthly EMIs currently paid? | `₹14,000` (Car Loan) | Deducted from permissible debt ceiling. |
| 7 | `essentialExpenses` | Essential household living expenses? | `₹28,000` (Rent & essentials) | Fundamental for Safe-to-Carry cashflow model. |
| 8 | `age` | What is your age? | `29` | Well clear of retirement ceiling (no tenure truncation). |
| 9 | `creditScore` | Credit score tier? | `780` | Unlocks Tier-1 prime pricing band (10.5%–13.0%). |
| 10 | `collateral` | Any unencumbered collateral to pledge? | `none` (No collateral) | Confirms unsecured personal loan path. |
| 11 | `incomeStability` | Vintage in current job/profession? | `gt_2_years` (5 years, stable) | Confirms full 55% FOIR cap without discount. |
| 12 | `bouncesLast12m` | Any EMI/cheque bounces in last 12m? | `0` (Clean track record) | Zero penalty applied; preserves clean underwriting. |
| 13 | `emergencySavingsMonths` | Months of expenses in emergency fund? | `4` (3 to 5 months) | Maintains standard 15% savings buffer (no elevated 20% penalty). |
| 14 | `creditCardUtilisation` | Credit card limit utilization %? | `15` (<30% ideal) | No rate surcharge; prime rate intact. |

---

## 3. Computed Outputs (Live Live Live)

### O1 — Verdict: **Borrow**
- **Verdict:** `BORROW` (Green)
- **One-Sentence Reason:** *"Your requested loan of ₹8 Lakh is comfortably within your safe borrowing capacity of ₹15.56 Lakh."*
- **Confidence Level:** `High`
- **Tightening Note:** *"Verdict is backed by verified cashflow buffer, stability, and payment discipline."*

### O2 — Maximum Amount: Two Numbers
- **Lender Will Likely Sanction:** **₹14,05,373** (~₹14.05 Lakh)
  - *Calculation:* ₹1,10,000 × 55% FOIR = ₹60,500 max obligation. Minus ₹14,000 existing EMI = ₹46,500/month available EMI. Over 36 months at 11.75% mid-rate = ₹14.05 Lakh.
- **Safe to Carry:** **₹15,56,513** (~₹15.56 Lakh)
  - *Calculation:* Net Income (₹1,10,000) − Existing Car EMI (₹14,000) − Rent & Essentials (₹28,000) − 15% Savings Cushion (₹16,500) = ₹51,500 safe monthly cashflow surplus. Over 36 months at 11.75% = ₹15.56 Lakh.
- **Recommendation:** **Lender Likely (₹14.05 Lakh)**
- **Recommendation Reason:** *"Your cashflow can support ₹15.56 Lakh, but bank FOIR policies will likely cap sanction at ₹14.05 Lakh."*
- **Confidence Level:** `High`
- **Tightening Note:** *"High confidence: Safe borrowing limits are based on your complete cashflow statement."*

### O3 — Fair Interest Rate & APR
- **Recommended Product:** Personal Loan (Unsecured)
- **Fair Nominal Rate Band:** **10.5% – 13.0%**
- **All-in APR Band:** **11.6% – 14.1%** (includes 1.5% upfront processing fee + ₹1,200/yr loan life insurance)
- **One-Sentence Reason:** *"Fair rate is 10.5%–13.0% for a Personal Loan (Unsecured) with your strong credit score of 780."*
- **Confidence Level:** `High`
- **Tightening Note:** *"Rate band is calibrated tightly to your credit profile and lender benchmarks."*

### O4 — EMI Ceiling & Stress Testing
- **Safe Monthly EMI Ceiling:** **₹51,500/month** (Household cashflow surplus)
- **Lender Max Obligation Ceiling:** **₹46,500/month** (Bank 55% FOIR ceiling)
- **Proposed Loan Monthly EMI (at 11.75% mid-rate, 36m):** **₹26,478/month**
- **Tenure Trade-off Matrix (for ₹8,00,000 loan):**
  - *12 Months:* EMI ₹70,985/mo (Unsafe: breaches ₹51,500 ceiling) | Total Interest: ₹51,820
  - *24 Months:* EMI ₹37,566/mo (Safe) | Total Interest: ₹1,01,584
  - *36 Months (Selected):* EMI ₹26,478/mo (Safe) | Total Interest: ₹1,53,208
  - *48 Months:* EMI ₹20,983/mo (Safe) | Total Interest: ₹2,07,184
  - *60 Months:* EMI ₹17,725/mo (Safe) | Total Interest: ₹2,63,500
- **Deterministic Stress Case:** Emergency Income Shock (-15% salary disruption)
  - *Stressed Monthly Income:* ₹93,500
  - *Stressed Safe EMI Capacity:* ₹41,150/month
  - *Proposed EMI:* ₹26,478/month
  - *Survives Stress?* **Yes**
  - *Stress Verdict:* *"Under a 15% salary disruption, your surplus capacity (₹41.1k/mo) safely absorbs the proposed ₹26.5k EMI."*
- **Confidence Level:** `High`

---

## 4. Resulting Negotiation Card Summary

```
================================================================================
                           BORROWER COPILOT NEGOTIATION CARD
================================================================================
Borrower Ask: ₹8,00,000 for Wedding & Family Ceremony (Personal Loan - Unsecured)

O1. VERDICT: BORROW
    Why: Your requested loan of ₹8 Lakh is comfortably within your safe borrowing
         capacity of ₹15.56 Lakh.

O2. MAXIMUM SANCTION:
    - Lender Limit: ₹14.05 Lakh  |  Safe Capacity: ₹15.56 Lakh
    - Recommendation: ₹14.05 Lakh (Bank FOIR limit governs)
    - Why: Safe ceiling is ₹15.56 Lakh (based on residual cashflow) vs ₹14.05 Lakh
           likely lender approval (at 55% FOIR).

O3. FAIR PRICING BENCHMARK:
    - Nominal Rate: 10.5% – 13.0%  |  All-in APR: 11.6% – 14.1%
    - Upfront Fee: 1.5% max  |  Insurance: ₹1,200/yr
    - Why: Fair rate is 10.5%–13.0% for a Personal Loan with credit score of 780.

O4. MONTHLY EMI CEILING:
    - Safe Outflow Limit: ₹51,500/mo (Proposed 36m EMI: ₹26,478/mo)
    - Stress Test: Survives 15% income disruption with ₹14.6k surplus buffer.

COUNTER-OFFER SCRIPT:
"My debt-to-income profile and 780 CIBIL score qualify for 10.5%–13.0% across prime
lenders. Can you match the 10.5% base rate and waive the 1.5% processing fee?"
================================================================================
```

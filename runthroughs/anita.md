# Borrower Persona Run-Through: Anita

## 1. Borrower Profile
- **Name & Age:** Anita, 35 years old, Hubballi
- **Profession & Stability:** Informal Earner (E-commerce delivery + tailoring), <2 years vintage
- **Household Structure:** 2 dependent children; husband unemployed for 8 months
- **Monthly Earnings:** Fluctuation between ₹26,000 and ₹30,000/month (cash & app payouts)
- **Existing Debt Overhang:** 3 instant mobile app loans totaling ₹35,000 principal at **30%+ APR**, consuming **₹7,500/month** in EMIs
- **Banking Discipline:** 1 ECS/NACH bounce last month due to temporary cash shortage
- **Emergency Savings:** ₹0 (living paycheck-to-paycheck)
- **Collateral:** None
- **Loan Request:** ₹1,50,000 for an Electric Two-Wheeler / Scooter (EV Loan)

---

## 2. Questionnaire Branching & Answers Submitted

Anita encountered 14 adaptively branched questions, exposing her severe cashflow vulnerability:

| Step | Question ID | Question Prompt | Anita's Answer | Why This Was Asked / Branching Logic |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `purpose` | Primary purpose of loan? | `vehicle` (Two-Wheeler / EV) | Identifies intent as vehicle acquisition. |
| 2 | `amountWanted` | How much money to borrow? | `₹1,50,000` | Anchor for EV scooter purchase. |
| 3 | `loanProductWanted` | Preferred product? | `vehicle_tw` (Two-Wheeler / EV Loan) | Hypothecated vehicle finance path. |
| 4 | `employmentType` | Primary employment source? | `gig_informal` (Gig / Informal) | Sets 35% informal FOIR cap ceiling. |
| 5 | `incomeRange` | Monthly income range? | `₹26,000 – ₹30,000` | Anchors conservative baseline to ₹27,200. |
| 6 | `existingEmis` | Total monthly EMIs currently paid? | `₹7,500` (3 App Loans) | Represents 28% of entire household income. |
| 7 | `essentialExpenses` | Essential household living expenses? | `₹18,000` (Rent, food, school fees) | Combined with EMIs, leaves almost zero buffer. |
| 8 | `age` | Borrower age? | `35` | Standard retail horizon. |
| 9 | `creditScore` | Credit score? | *Selects "I do not know"* | Avoids arbitrary penalty, treats as unrated. |
| 10 | `collateral` | Any collateral to pledge? | `none` | Confirms unsecured / hypothecated profile. |
| 11 | `incomeStability` | Job / gig vintage? | `lt_2_years` | Confirms informal risk profile. |
| 12 | `bouncesLast12m` | Payment bounces in last 12m? | `1` (Recent bounce last month) | **CRITICAL:** Triggers 8% FOIR cap penalty (35% → 27%) and +1% rate surcharge. |
| 13 | `emergencySavingsMonths`| Emergency savings cushion? | `0` (Nil emergency fund) | Enforces elevated 20% savings buffer. |
| 14 | `existingAppLoanApr` | APR paid on existing app loans? | `36` (30%+ APR instant apps) | **PREDATORY FLAG:** Identifies usurious existing debt. |

---

## 3. Computed Outputs (Live Live Live)

### O1 — Verdict: **Don't Borrow**
- **Verdict:** `DONT_BORROW` (Red)
- **One-Sentence Reason:** *"Your existing living expenses (₹18k) and debt (₹7.5k) leave no safe cashflow cushion for additional EMIs."*
- **Alternative Trigger Check:** Recent bounce + high obligation ratio (28%) + predatory app loan at 36% APR confirms that fresh borrowing will cause immediate debt distress.
- **Confidence Level:** `High`
- **Tightening Note:** *"Verdict is backed by verified cashflow buffer, stability, and payment discipline."*

### O2 — Maximum Amount: Severe Deficit
- **Lender Will Likely Sanction:** **₹0** (or under ₹30,000)
  - *Calculation:* Net Income ₹27,200 × Penalized FOIR (27% due to bounce) = ₹7,344 maximum allowable total monthly obligation. Since existing EMIs are already ₹7,500/month, Anita has **₹0 allowable lender headroom**!
- **Safe to Carry:** **₹0**
  - *Calculation:* Net Income (₹27,200) − Essentials (₹18,000) − Existing App EMIs (₹7,500) − 20% Emergency Buffer (₹5,440) = **-₹3,740 monthly cashflow deficit**.
- **Recommendation:** **Safe to Carry (₹0)**
- **Recommendation Reason:** *"Your existing expenses and commitments consume your current income; carrying new debt risks cashflow distress."*
- **Confidence Level:** `High`

### O3 — Fair Interest Rate & APR: Predatory Debt Disclosure
- **Recommended Product:** Two-Wheeler / EV Loan
- **Institutional Fair Band:** **12.0% – 17.0%** (includes 1% bounce surcharge)
- **All-in Fair APR:** **13.2% – 18.4%**
- **Predatory Warning Flag:** `TRUE`
- **Existing Debt Comparison:** *"Your current loans at 36% APR are 19.0% above institutional fair lending rates."*
- **One-Sentence Reason:** *"Fair rate is 12.0%–17.0% for a Two-Wheeler / EV Loan. (Includes a 1% risk surcharge due to a recent payment bounce)."*
- **Confidence Level:** `High`

### O4 — EMI Ceiling & Stress Testing
- **Safe Monthly EMI Ceiling:** **₹0/month** (Household in structural deficit)
- **Lender Max Obligation Ceiling:** **₹0/month** (Exceeded by existing ₹7,500 EMIs)
- **Requested Loan EMI (for ₹1.5L EV over 36m at 14.5%):** **₹5,164/month**
- **Deterministic Stress Case:** Income Drop (-20% gig disruption)
  - *Stressed Monthly Earnings:* Drops from ₹27,200 to ₹21,760
  - *Stressed Monthly Capacity:* Deficit widens to -₹8,100/month
  - *Survives Stress?* **No (Severe Default Risk)**
  - *Stress Verdict:* *"If monthly income drops 20% to ₹21.8k, your safe capacity falls to ₹0/mo, leaving a severe deficit against the proposed ₹5.2k EMI."*
- **Confidence Level:** `High`

---

## 4. Resulting Negotiation Card Summary

```
================================================================================
                           BORROWER COPILOT NEGOTIATION CARD
================================================================================
Borrower Ask: ₹1,50,000 for Vehicle Purchase (Two-Wheeler / EV Loan)

O1. VERDICT: DON'T BORROW
    Why: Your existing living expenses (₹18k) and existing debt (₹7.5k) leave
         no safe cashflow cushion for additional EMIs.

O2. MAXIMUM SANCTION:
    - Lender Limit: ₹0  |  Safe Capacity: ₹0
    - Recommendation: ₹0 (Resolve existing debt first)
    - Why: Existing app loan payments (₹7,500/mo) already exceed the 27% FOIR
           ceiling imposed following your recent payment bounce.

O3. PREDATORY DEBT WARNING:
    - Current App Loans: 36.0% APR  |  Institutional Fair Ceiling: 17.0%
    - Gap: You are paying 19.0% excess interest to instant loan apps.
    - Recommendation: Prioritize consolidating or closing the 3 app loans
      before taking on vehicle financing.

O4. MONTHLY EMI CEILING:
    - Safe Outflow Limit: ₹0/month (Household currently has -₹3.7k deficit)
    - Stress Test: Fails 20% income disruption test.

ACTION PLAN FOR ANITA:
1. Do not apply for fresh EV loan yet; lenders will reject due to last month's
   bounce and high existing obligation ratio.
2. Direct every spare rupee toward paying off the ₹35,000 in 36% app loans.
3. Once app loans are cleared, Anita unlocks ₹7,500/month in cashflow, which
   will comfortably support a ₹1,50,000 EV scooter loan at ~₹5,100/mo!
================================================================================
```

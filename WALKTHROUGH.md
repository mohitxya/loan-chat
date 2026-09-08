# Walkthrough: Borrower Copilot

Borrower Copilot is an Indian retail credit decision-support web application. It operates entirely client-side with zero backend, zero persistence, zero bureau inquiries, and zero black-box machine learning. Every calculation traces back to an inspectable, auditable rule.

---

## 1. Five-Minute End-to-End Walkthrough (Running Example: Priya)

To understand how Borrower Copilot functions in practice, follow **Priya's** journey through the application:

### Step 1: Initiating the Profile
- **Borrower Persona:** Priya, 29, Bengaluru. Software engineer with 5 years tenure, earning net ₹1,10,000/month.
- **The Ask:** Priya wants to borrow **₹8,00,000** for her upcoming wedding. She already pays ₹14,000/month on an existing car loan and spends ₹28,000/month on rent and essentials. Her CIBIL score is **780**.
- **User Interface:** As Priya enters the application, she is greeted by a focused, clean two-column dashboard on desktop (or stacked mobile layout at 375px). The left 45% presents an interactive, conversational **Chat Interface** ("Borrower Copilot Assistant") with in-chat response widgets (choice chips, Indian currency inputs, credit score selectors); the right 55% displays live-updating cards for O1–O4.

### Step 2: Adaptive Questioning & Zero Deadweight
- Priya selects *Wedding* as loan purpose, enters *₹8,00,000*, selects *Salaried*, and inputs her ₹1,10,000 salary.
- Because she is salaried, the engine automatically skips informal/gig questions (like cash volatility and daily wage spreads) and branches directly to salaried-relevant criteria: job stability (>2 years), credit score (780), and credit card utilization (15%).
- When asked if she has collateral, Priya selects *None*. The engine locks her to an unsecured personal loan without asking irrelevant property valuation questions.

### Step 3: Live Output Synthesis (O1 – O4)
Within 1 millisecond of inputting her profile, the live right-hand panel renders all four outputs:
1. **O1 — Verdict (Borrow):**
   - *Result:* **Borrow** (Green badge)
   - *One-sentence why:* *"Your requested loan of ₹8 Lakh is comfortably within your safe borrowing capacity of ₹15.56 Lakh."*
   - *Confidence:* **High** (Verified income stability, zero bounce history, and documented cashflow buffer).
2. **O2 — Maximum Sanction (Lender Likely vs Safe to Carry):**
   - *Lender Likely:* **₹14.05 Lakh** (Bank 55% FOIR cap allows ₹46,500/mo available EMI).
   - *Safe to Carry:* **₹15.56 Lakh** (Priya's residual cashflow after essentials and a 15% savings buffer allows ₹51,500/mo).
   - *Recommendation:* **Lender Likely (₹14.05 Lakh)**.
   - *One-sentence why:* *"Your cashflow can support ₹15.56 Lakh, but bank FOIR policies will likely cap sanction at ₹14.05 Lakh."*
3. **O3 — Fair Interest Rate & All-In APR:**
   - *Fair Nominal Band:* **10.5% – 13.0%** for prime salaried borrowers with score 780.
   - *All-In APR Band:* **11.6% – 14.1%** (including 1.5% processing fee and mandatory credit life insurance).
   - *One-sentence why:* *"Fair rate is 10.5%–13.0% for a Personal Loan (Unsecured) with your strong credit score of 780."*
4. **O4 — Safe Monthly EMI Ceiling & Stress Case:**
   - *Safe Monthly Ceiling:* **₹51,500/month**.
   - *Proposed 36m EMI:* **₹26,478/month** (well inside the safe ceiling).
   - *Deterministic Stress Case:* A 15% emergency salary disruption reduces safe capacity to ₹41,150/mo — still comfortably clearing the proposed ₹26,478 EMI.

### Step 4: The Negotiation Card
- Priya clicks **"Negotiation Card"** in the header.
- The UI transitions to a frozen, high-contrast document designed to be printed or screenshotted.
- It displays her ask, the four outputs with their exact "why" statements, four critical sanction letter interrogation questions (e.g. verifying all-in APR, daily reducing balance, and foreclosure charges), and a verbatim counter-offer script:
  > *"My debt-to-income profile and 780 CIBIL score qualify for 10.5%–13.0% across prime lenders. Can you match the 10.5% base rate and waive the 1.5% processing fee?"*

---

## 2. The Three Explicit Domain Judgments (Per Section 11 of Spec)

1. **Co-applicant Income Weighting:**
   - *Lender-likely calculation:* 100% of verified co-applicant net income is pooled into the household denominator for the bank FOIR calculation, mirroring standard Indian commercial credit manuals (e.g. HDFC/SBI).
   - *Safe-to-carry calculation:* Co-applicant income is haircut by **30%** (70% recognized). This accounts for career breaks, non-co-liability in practice, and separate personal obligations.
2. **Deterministic Stress Shock Selection:**
   - *Informal / Variable Income / Gig Workers (e.g. Anita):* Subjected to an **Income Drop Shock (-20% net cashflow)**, because earnings volatility is the primary structural default trigger.
   - *Salaried with Long-Tenure or Floating Debt (>36 months, e.g. Home Loans, LAP):* Subjected to an **Interest Rate Shock (+200 bps / +2.0% APR)**, because macroeconomic monetary tightening cycles dominate long repayment horizons.
   - *Salaried with Short-Tenure Fixed Loans (Personal, Vehicle):* Subjected to an **Emergency Income Disruption Shock (-15%)** to simulate medical or unexpected family expenses.
3. **Productive Debt Uplift for Business Loans (e.g. Ravi):**
   - When a business loan is intended for working capital or asset purchase (e.g., buying delivery vehicle and stock), we recognize **50% of the projected incremental earnings** and cap the maximum FOIR allowance uplift at **+10 percentage points** above baseline (max 50% FOIR overall).

---

## 3. What We Would Build Next (Future Roadmap)

1. **Sanction Letter OCR / PDF Diff Engine (Client-Side via PDF.js):** Allow borrowers to upload a lender's sanction PDF; automatically parse interest rate, processing fee, and insurance to flag discrepancies against the Negotiation Card.
2. **Vernacular Localization (Kannada, Hindi, Tamil, Telugu):** Indian retail borrowers in tier-2 and tier-3 cities (like Ravi in Mysuru or Anita in Hubballi) benefit hugely from vernacular language interfaces.
3. **Multi-Loan Waterfall Optimizer:** For borrowers with multiple existing debts (like Anita with 3 app loans), add a snowball/avalanche debt consolidation calculator showing exactly how much monthly cashflow is unlocked by paying off high-cost loans first.

---

## 4. What We Deliberately Cut and Why

1. **Machine Learning / Credit Scoring Models:**
   - *Why Cut:* Black-box ML models cannot explain "why" a specific threshold was chosen to an anxious borrower or regulatory reviewer. Pure rules allow every number to map 1:1 to auditable public benchmarks in `constants.ts` and `RULES.md`.
2. **Bureau Scraping / Direct API Inquiries:**
   - *Why Cut:* Bureau pulls create a "hard inquiry" flag on the borrower's credit report, dragging down their score. Borrower Copilot maintains zero credit impact and zero privacy leakage.
3. **User Authentication & Cloud Persistence:**
   - *Why Cut:* Borrowers should never have to surrender phone numbers, PAN cards, or passwords to get unbiased financial advice. Running 100% in-session in the browser eliminates data liability and ensures total privacy.

---

## 5. Deliverables & Acceptance Checklist Verification

| Acceptance Check | Status | Verification Detail |
| :--- | :---: | :--- |
| `constants.ts` has zero unexplained magic numbers reachable from `/rules` | **PASS** | Every threshold, band, and haircut is exported as a named constant. |
| `RULES.md` rows and `constants.ts` values map 1:1 | **PASS** | All 56 constants documented in a single table with value, why, and source. |
| Running with only must-ask tier produces all four outputs marked Low confidence with tightening hints | **PASS** | Automated test in `tests/personas.test.ts` asserts all 4 outputs Low confidence with tightening hints. |
| Ravi's profile results in secured-product recommendation and materially lower rate band | **PASS** | Automated test asserts Ravi is routed to `business_secured` (10.0%–14.0%) vs 18%+ unsecured. |
| Anita's profile produces "Don't borrow" or "Borrow less" and flags predatory existing debt | **PASS** | Automated test asserts `DONT_BORROW` verdict and predatory warning for 36% APR app debt. |
| Priya's safe-to-carry number differs from lender-likely number with clear recommendation | **PASS** | Automated test asserts Safe (₹15.56L) vs Lender Likely (₹14.05L) with bank FOIR explanation. |
| Every output card has a dynamic one-sentence "why" referencing answer values | **PASS** | Automated tests assert all output cards contain dynamic variables. |
| 375px mobile responsiveness without horizontal scrolling | **PASS** | Mobile summary strip, responsive padding, full-width inputs tested. |
| Zero runtime network calls | **PASS** | Self-contained client-side bundle with strict CSP. |
| `npm test` and `npm run build` succeed | **PASS** | All 25 automated tests passing; production build succeeds in <7s. |

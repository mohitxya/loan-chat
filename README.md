# Borrower Copilot

> **Unbiased, rules-based financial decision support for Indian retail borrowers.**
> Live client-side evaluation of borrowing capacity, fair pricing bands, EMI ceilings, and lender negotiation power. Zero machine learning, zero bureau pulls, zero persistence, zero backend required.

---

## 1. Quickstart (Under 3 Minutes)

Run the application locally offline with standard Node.js:

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
```

Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/) in any modern web browser or mobile browser.

To run the automated rule and persona test suite:
```bash
npm test
```

To build for static production deployment:
```bash
npm run build
```

---

## 2. Core Features & The Four Live Outputs

As the user answers an adaptive questionnaire, the engine continuously recomputes four key outputs live without page refresh:

1. **O1 — Borrowing Verdict**: `Borrow`, `Borrow less`, or `Don't borrow`, accompanied by a dynamic one-sentence explanation built directly from the driving cashflow variables.
2. **O2 — Maximum Amount**: Dual comparative numbers — *"Lender Likely Sanction"* (calculated via standard banking FOIR guidelines) vs *"Safe To Carry"* (calculated via residual household cashflow after expenses and savings cushions), with a direct recommendation on which limit to adhere to.
3. **O3 — Fair Interest Rate & APR**: Realistic product pricing bands (nominal interest rate and all-in APR including processing fees and insurance) tailored to profile, collateral, and bureau score tier. Flags usurious/predatory debt (≥24% APR).
4. **O4 — Safe Monthly EMI Ceiling**: Monthly debt servicing capacity, tenure trade-off matrix, and deterministic stress testing (-20% income disruption or +200 bps interest rate hike).
5. **The Negotiation Card**: A printable, high-contrast summary screen designed to be held up against a lender's sanction letter, complete with counter-offer scripts and sanction interrogation questions.

---

## 3. Architecture & Strict Code Separation

```
loan-chat/
├── RULES.md                  # Complete auditable domain table (1:1 with constants.ts)
├── README.md                 # Setup, architecture, and verification
├── runthroughs/              # Documented persona journeys
│   ├── priya.md              # Salaried software engineer, 780 score, ₹8L wedding loan
│   ├── ravi.md               # Kirana store owner, shop collateral, ₹15L business loan
│   └── anita.md              # Gig worker, 3 app loans at 30%+, recent bounce, ₹1.5L EV ask
├── src/
│   ├── rules/                # PURE RULES ENGINE: Zero JSX, Zero React imports
│   │   ├── types.ts          # Strongly typed domain answers and outputs
│   │   ├── constants.ts      # ALL numerical thresholds, cutoffs, and rate bands
│   │   ├── formatters.ts     # Indian Rupee (en-IN) and short notation formatters
│   │   ├── foir.ts           # Affordability and FOIR ceiling logic
│   │   ├── rateBands.ts      # Product routing, nominal rate bands, and all-in APR
│   │   ├── eligibility.ts    # O2: Lender-likely vs Safe-to-carry calculations
│   │   ├── verdict.ts        # O1: Verdict decision tree with dynamic reasons
│   │   ├── emiCeiling.ts     # O4: EMI ceilings, tenure matrix, and stress testing
│   │   ├── confidence.ts     # Explicit confidence scoring (Low/Medium/High)
│   │   ├── negotiationCard.ts# Frozen negotiation payload assembler
│   │   └── engine.ts         # Top-level decision engine entrypoint
│   ├── questions/            # ADAPTIVE QUESTIONNAIRE
│   │   ├── types.ts          # Question interfaces
│   │   ├── questionBank.ts   # Must-ask tier (1-10) + Additional adaptive tier
│   │   └── branching.ts      # Pure getNextQuestion() and information gain ordering
│   ├── state/
│   │   └── sessionStore.tsx  # In-session React Context state with 1-click presets
│   └── components/           # MODERN RESPONSIVE UI
│       ├── Header.tsx        # Navigation, logo, demo preset switcher
│       ├── ChatPanel.tsx     # Conversational chat interface with in-chat response widgets
│       ├── ChatMessage.tsx   # Conversational message bubble with inline answer editing
│       ├── QuestionPanel.tsx # Adaptive questionnaire card with skip/back affordances
│       ├── OutputsPanel.tsx  # Live updating O1-O4 cards with drilldowns
│       ├── OutputCard.tsx    # Reusable card component with confidence badge & 'why'
│       ├── ConfidenceBadge.tsx# Low/Medium/High badge with tightening hints
│       ├── NegotiationCard.tsx# Printable/screenshotable sanction comparison card
│       ├── MobileSummaryStrip.tsx # Sticky bottom summary strip (<768px)
│       ├── CurrencyInput.tsx # Accessible Indian Rupee formatted input
│       └── DebugPathViewer.tsx # Interactive decision tree visualizer
└── tests/                    # VITEST UNIT & ACCEPTANCE TESTS
    ├── foir.test.ts
    ├── rateBands.test.ts
    ├── eligibility.test.ts
    ├── verdict.test.ts
    └── personas.test.ts      # Verified against Priya, Ravi, Anita, and Must-Ask
```

---

## 4. Key Domain Assumptions & Judgments Made

Per Section 11 of the specification, three domain judgment calls were documented:
1. **Co-applicant Income Weighting**: Lenders count 100% of verified co-applicant income into household FOIR. Borrower Copilot applies a 30% safety haircut (70% recognized) for the safe-to-carry cashflow test to account for career gaps and shared dependencies.
2. **Deterministic Stress Shock Selection**: Informal / gig / self-employed borrowers are subjected to an **Income Drop Shock (-20%)**; salaried borrowers with long-term/floating debt (>36m) are subjected to a **Rate Hike Shock (+200 bps / +2.0%)**; salaried borrowers with short-term loans face a **15% emergency income disruption shock**.
3. **Productive Debt Uplift for Business Loans**: When a business loan generates incremental monthly profits, our model recognizes 50% of the projected earnings and caps the maximum FOIR allowance uplift at +10 percentage points above baseline (up to a 50% overall cap).

All values are fully audited in [RULES.md](file:///home/mohit/projects/loan-chat/RULES.md).

---

## 5. Security & Privacy Guarantees

- **No Remote Calls at Runtime**: Computations are 100% local in the borrower's browser.
- **Zero Bureau Pulls**: No credit inquiry is logged against the user's PAN or CIBIL score.
- **Zero Persistence**: Refreshing the page or closing the tab completely resets in-memory state. No sensitive financial information is stored in `localStorage` or `sessionStorage`.
- **Content Security Policy (CSP)**: Hardened meta headers preventing third-party script injection.

---

## 6. Persona Test Cases

You can test the three canonical personas instantly using the header preset buttons:
- **Priya (Salaried)**: ₹1.1L salary, car loan ₹14k, 780 CIBIL score, ₹8L wedding loan ask. Shows safe capacity (₹15.56L) vs bank FOIR ceiling (₹14.05L) with prime 10.5%–13.0% rate band.
- **Ravi (Kirana Store)**: Self-employed cash earner, thin-file, unencumbered shop property worth ₹45L, ₹15L ask. Pledging property routes Ravi to a Secured Business Loan / LAP, slashing his interest rate from 18%+ to 10.0%–14.0%.
- **Anita (Gig Worker)**: Delivery/tailoring, 3 app loans at 30%+ APR, recent bounce, ₹1.5L EV ask. Produces "Don't borrow" verdict and flags existing app debt as predatory (>24% APR).

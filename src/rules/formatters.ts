/**
 * Indian currency and numerical formatters.
 * Adheres strictly to Indian numbering system (Lakhs / Crores) and en-IN locale.
 */

/**
 * Formats a number to standard Indian Rupee notation (e.g. ₹8,00,000)
 */
export function formatRupees(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  const rounded = Math.round(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rounded);
}

/**
 * Formats a number to short Indian denomination (e.g. ₹8 Lakh, ₹1.5 Cr, ₹35k)
 */
export function formatRupeesShort(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 10000000) {
    const cr = (abs / 10000000).toFixed(2).replace(/\.00$/, '');
    return `${sign}₹${cr} Cr`;
  }
  if (abs >= 100000) {
    const lakh = (abs / 100000).toFixed(2).replace(/\.00$/, '');
    return `${sign}₹${lakh} Lakh`;
  }
  if (abs >= 1000) {
    const k = (abs / 1000).toFixed(1).replace(/\.0$/, '');
    return `${sign}₹${k}k`;
  }
  return `${sign}₹${Math.round(abs)}`;
}

/**
 * Formats a percentage value (e.g. 10.5%)
 */
export function formatPercent(rate: number | undefined | null, decimals = 1): string {
  if (rate === undefined || rate === null || isNaN(rate)) {
    return '0%';
  }
  return `${rate.toFixed(decimals)}%`;
}

/**
 * Formats a rate band (e.g. "10.5% – 13.0%")
 */
export function formatRateBand(min: number, max: number, decimals = 1): string {
  return `${min.toFixed(decimals)}% – ${max.toFixed(decimals)}%`;
}

/**
 * Formats any question answer value into a clean, human-readable string for chat bubbles.
 */
export function formatAnswerValue(questionId: string, value: any): string {
  if (value === undefined || value === null) return '';

  switch (questionId) {
    case 'amountWanted':
    case 'collateralValue':
    case 'upcomingLargeExpense':
      return formatRupees(value);

    case 'monthlyIncome':
    case 'coApplicantIncome':
    case 'businessProjectedIncome':
      return `${formatRupees(value)} / month`;

    case 'existingEmis':
      return value === 0 ? '₹0 (Debt-free)' : `${formatRupees(value)} / month`;

    case 'essentialExpenses':
      return `${formatRupees(value)} / month`;

    case 'age':
      return `${value} years old`;

    case 'creditScore':
      return value === null ? 'I do not know / No formal score' : `CIBIL / Experian Score: ${value}`;

    case 'creditCardUtilisation':
      return `${value}% card limit utilization`;

    case 'bouncesLast12m':
      return value === 0 ? 'Zero bounces (Clean record)' : `${value} bounce in last 12 months`;

    case 'emergencySavingsMonths':
      return value === 0 ? 'Less than 1 month / Nil' : `${value} months of expenses`;

    case 'existingAppLoanApr':
      return value === 0 ? 'No app loans' : `${value}% APR on app loans`;

    case 'incomeStability':
      if (value === 'gt_2_years') return 'More than 2 years (Stable)';
      if (value === 'lt_2_years') return '6 months to 2 years';
      return 'Under 6 months / Probationary';

    case 'employmentType':
      if (value === 'salaried') return 'Salaried Professional';
      if (value === 'self_employed_itr') return 'Self-Employed (ITR / GST)';
      if (value === 'self_employed_cash') return 'Self-Employed (Cash Accounts)';
      if (value === 'gig_informal') return 'Gig Worker / Informal Earner';
      if (value === 'unemployed') return 'Currently Unemployed';
      return String(value);

    case 'purpose':
      if (value === 'wedding') return 'Wedding / Family Ceremony';
      if (value === 'education') return 'Higher Education';
      if (value === 'medical') return 'Medical Emergency';
      if (value === 'vehicle') return 'Vehicle Purchase (Two-Wheeler / EV)';
      if (value === 'business_working_capital') return 'Business Working Capital / Stock';
      if (value === 'business_asset') return 'Business Asset / Equipment';
      if (value === 'home_purchase') return 'Home / Flat Purchase';
      if (value === 'home_renovation') return 'Home Renovation';
      if (value === 'debt_consolidation') return 'Debt Consolidation';
      return 'Other Personal Expense';

    case 'collateral':
      if (value === 'property') return 'Residential / Commercial Property';
      if (value === 'gold') return 'Gold Jewellery / Coins';
      if (value === 'fd') return 'Fixed Deposit (FD)';
      return 'No Collateral (Unsecured)';

    case 'loanProductWanted':
      if (value === 'personal') return 'Personal Loan (Unsecured)';
      if (value === 'home') return 'Home Loan';
      if (value === 'lap') return 'Loan Against Property (LAP)';
      if (value === 'gold') return 'Gold Loan';
      if (value === 'vehicle_tw') return 'Two-Wheeler / EV Loan';
      if (value === 'business_secured') return 'Secured Business Loan';
      if (value === 'business_unsecured') return 'Unsecured Business Loan';
      return String(value);

    case 'variableIncomeShare':
      return `Fluctuates ~${value}% month-to-month`;

    case 'existingOfferRate':
      return `Quoted ${value}% interest rate`;

    default:
      return String(value);
  }
}


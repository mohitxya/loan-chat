/**
 * Rate bands and All-In APR calculations.
 * Adheres to RBI-style fair disclosure: nominal rate band vs total APR (including fees and insurance).
 */

import { Answers, LoanProduct, InterestRateOutput, ConfidenceLevel } from './types';
import {
  RATE_BAND_HOME_MIN,
  RATE_BAND_HOME_MAX,
  RATE_BAND_LAP_MIN,
  RATE_BAND_LAP_MAX,
  RATE_BAND_GOLD_MIN,
  RATE_BAND_GOLD_MAX,
  RATE_BAND_PERSONAL_TIER1_MIN,
  RATE_BAND_PERSONAL_TIER1_MAX,
  RATE_BAND_PERSONAL_TIER2_MIN,
  RATE_BAND_PERSONAL_TIER2_MAX,
  RATE_BAND_PERSONAL_NO_SCORE_MIN,
  RATE_BAND_PERSONAL_NO_SCORE_MAX,
  RATE_BAND_VEHICLE_TW_MIN,
  RATE_BAND_VEHICLE_TW_MAX,
  RATE_BAND_BUSINESS_SECURED_MIN,
  RATE_BAND_BUSINESS_SECURED_MAX,
  RATE_BAND_BUSINESS_UNSECURED_MIN,
  RATE_BAND_BUSINESS_UNSECURED_MAX,
  RATE_PREDATORY_THRESHOLD,
  CREDIT_SCORE_TIER1_THRESHOLD,
  CREDIT_SCORE_TIER2_THRESHOLD,
  HIGH_CC_UTILIZATION_THRESHOLD,
  CC_UTILIZATION_RATE_PENALTY,
  DEFAULT_PROCESSING_FEE_PERCENT,
  MANDATORY_INSURANCE_RATE_PER_LAKH,
  DEFAULT_TENURE_PERSONAL_MONTHS,
  DEFAULT_TENURE_HOME_MONTHS,
  DEFAULT_TENURE_LAP_MONTHS,
  DEFAULT_TENURE_GOLD_MONTHS,
  DEFAULT_TENURE_VEHICLE_MONTHS,
  DEFAULT_TENURE_BUSINESS_MONTHS,
} from './constants';

export function resolveRecommendedProduct(answers: Answers): {
  product: LoanProduct;
  label: string;
  isSecuredRoute: boolean;
  routingReason: string;
} {
  const hasProperty = answers.collateral === 'property';
  const hasGold = answers.collateral === 'gold';
  const hasFd = answers.collateral === 'fd';
  const isBusiness =
    answers.purpose === 'business_working_capital' || answers.purpose === 'business_asset';

  // High leverage routing: if borrower has property collateral and wants business/general loan,
  // routing them to LAP or Secured Business loan saves massive interest.
  if (hasProperty) {
    if (isBusiness) {
      return {
        product: 'business_secured',
        label: 'Secured Business Loan (against Property)',
        isSecuredRoute: true,
        routingReason: 'Your property collateral qualifies you for a secured business loan at much lower interest rates.',
      };
    }
    if (answers.purpose !== 'home_purchase') {
      return {
        product: 'lap',
        label: 'Loan Against Property (LAP)',
        isSecuredRoute: true,
        routingReason: 'Your unencumbered property enables a Loan Against Property (LAP), offering lower rates than personal loans.',
      };
    }
  }

  if (hasGold) {
    return {
      product: 'gold',
      label: 'Gold Loan',
      isSecuredRoute: true,
      routingReason: 'Pledging gold provides fast approval and lower borrowing rates than unsecured personal debt.',
    };
  }

  if (answers.purpose === 'home_purchase') {
    return {
      product: 'home',
      label: 'Home Loan',
      isSecuredRoute: true,
      routingReason: 'Home purchase loans benefit from subsidized residential mortgage rates.',
    };
  }

  if (answers.purpose === 'vehicle') {
    return {
      product: 'vehicle_tw',
      label: 'Two-Wheeler / EV Loan',
      isSecuredRoute: false,
      routingReason: 'Hypothecated vehicle financing offers competitive rates for two-wheeler and EV purchases.',
    };
  }

  if (isBusiness) {
    if (hasFd) {
      return {
        product: 'business_secured',
        label: 'Secured Business Loan (against FD)',
        isSecuredRoute: true,
        routingReason: 'Fixed deposit pledge secures low-cost working capital funding.',
      };
    }
    return {
      product: 'business_unsecured',
      label: 'Unsecured Business Loan',
      isSecuredRoute: false,
      routingReason: 'Unsecured business funding requires no collateral but carries higher interest.',
    };
  }

  // Default personal loan
  return {
    product: 'personal',
    label: 'Personal Loan (Unsecured)',
    isSecuredRoute: false,
    routingReason: 'Standard multipurpose personal loan based on income and credit profile.',
  };
}

/**
 * Calculates monthly EMI for a principal, annual rate %, and tenure in months
 */
export function calculateEmi(principal: number, annualRatePercent: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualRatePercent <= 0) return principal / tenureMonths;

  const r = annualRatePercent / 12 / 100;
  const emi = (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
  return emi;
}

/**
 * Computes exact all-in APR by finding the Internal Rate of Return (IRR)
 * where Disbursed = Principal - Upfront Processing Fee - Insurance,
 * and repayment consists of N monthly EMIs.
 */
export function calculateApr(
  principal: number,
  annualNominalRate: number,
  tenureMonths: number,
  processingFeePercent: number,
  insuranceAmount: number
): number {
  if (principal <= 0 || tenureMonths <= 0) return annualNominalRate;

  const emi = calculateEmi(principal, annualNominalRate, tenureMonths);
  const upfrontFees = (principal * processingFeePercent) / 100 + insuranceAmount;
  const netDisbursed = principal - upfrontFees;

  if (netDisbursed <= 0) return annualNominalRate;

  // Solve for monthly rate m such that netDisbursed = sum(emi / (1+m)^t)
  // Newton-Raphson solver
  let m = annualNominalRate / 12 / 100;
  for (let iter = 0; iter < 20; iter++) {
    let f = -netDisbursed;
    let df = 0;
    for (let t = 1; t <= tenureMonths; t++) {
      const discount = Math.pow(1 + m, -t);
      f += emi * discount;
      df -= t * emi * discount / (1 + m);
    }
    if (Math.abs(f) < 0.0001) break;
    if (Math.abs(df) < 1e-10) break;
    const nextM = m - f / df;
    if (nextM <= 0) break;
    m = nextM;
  }

  const annualizedApr = m * 12 * 100;
  return Math.round(annualizedApr * 10) / 10;
}

export function computeRateBandAndApr(answers: Answers): InterestRateOutput {
  const { product, label, routingReason } = resolveRecommendedProduct(answers);
  const empType = answers.employmentType || 'salaried';
  const scoreKnown = answers.creditScoreKnown !== false && answers.creditScore !== null && answers.creditScore !== undefined;
  const score = scoreKnown ? answers.creditScore! : null;
  const hasBounce = (answers.bouncesLast12m || 0) > 0;
  const highCcUtil = (answers.creditCardUtilisation || 0) > HIGH_CC_UTILIZATION_THRESHOLD;

  let minNominal = 0;
  let maxNominal = 0;
  let scoreContext = '';

  switch (product) {
    case 'home':
      minNominal = RATE_BAND_HOME_MIN;
      maxNominal = RATE_BAND_HOME_MAX;
      break;
    case 'lap':
      minNominal = RATE_BAND_LAP_MIN;
      maxNominal = RATE_BAND_LAP_MAX;
      break;
    case 'gold':
      minNominal = RATE_BAND_GOLD_MIN;
      maxNominal = RATE_BAND_GOLD_MAX;
      break;
    case 'vehicle_tw':
      minNominal = RATE_BAND_VEHICLE_TW_MIN;
      maxNominal = RATE_BAND_VEHICLE_TW_MAX;
      break;
    case 'business_secured':
      minNominal = RATE_BAND_BUSINESS_SECURED_MIN;
      maxNominal = RATE_BAND_BUSINESS_SECURED_MAX;
      break;
    case 'business_unsecured':
      minNominal = RATE_BAND_BUSINESS_UNSECURED_MIN;
      maxNominal = RATE_BAND_BUSINESS_UNSECURED_MAX;
      break;
    case 'personal':
    default:
      if (empType === 'salaried') {
        if (score !== null && score >= CREDIT_SCORE_TIER1_THRESHOLD) {
          minNominal = RATE_BAND_PERSONAL_TIER1_MIN;
          maxNominal = RATE_BAND_PERSONAL_TIER1_MAX;
          scoreContext = `with your strong credit score of ${score}`;
        } else if (score !== null && score >= CREDIT_SCORE_TIER2_THRESHOLD) {
          minNominal = RATE_BAND_PERSONAL_TIER2_MIN;
          maxNominal = RATE_BAND_PERSONAL_TIER2_MAX;
          scoreContext = `with a moderate credit score of ${score}`;
        } else if (score === null) {
          // Unknown credit score: conservative upper-middle band, not 0 and not best
          minNominal = 12.0;
          maxNominal = 15.0;
          scoreContext = `with credit score unverified (positioned conservatively in mid-band)`;
        } else {
          // Sub-prime score
          minNominal = 14.5;
          maxNominal = 18.5;
          scoreContext = `reflecting an impaired credit score of ${score}`;
        }
      } else {
        // Self-employed / informal personal loan
        minNominal = RATE_BAND_PERSONAL_NO_SCORE_MIN;
        maxNominal = RATE_BAND_PERSONAL_NO_SCORE_MAX;
        scoreContext = `for self-employed / informal profile without corporate salary slip`;
      }
      break;
  }

  // Adjustments
  if (hasBounce) {
    minNominal += 1.0;
    maxNominal += 1.0;
  }
  if (highCcUtil) {
    minNominal += CC_UTILIZATION_RATE_PENALTY;
    maxNominal += CC_UTILIZATION_RATE_PENALTY;
  }

  // Default tenure for APR calculations
  const tenureMonths =
    answers.requestedTenureMonths ||
    (product === 'home'
      ? DEFAULT_TENURE_HOME_MONTHS
      : product === 'lap'
      ? DEFAULT_TENURE_LAP_MONTHS
      : product === 'gold'
      ? DEFAULT_TENURE_GOLD_MONTHS
      : product === 'vehicle_tw'
      ? DEFAULT_TENURE_VEHICLE_MONTHS
      : product === 'business_secured' || product === 'business_unsecured'
      ? DEFAULT_TENURE_BUSINESS_MONTHS
      : DEFAULT_TENURE_PERSONAL_MONTHS);

  const amount = answers.amountWanted || 500000;
  const processingFeePercent = DEFAULT_PROCESSING_FEE_PERCENT;
  const insuranceEstimate = Math.round((amount / 100000) * MANDATORY_INSURANCE_RATE_PER_LAKH);

  const minApr = calculateApr(amount, minNominal, tenureMonths, processingFeePercent, insuranceEstimate);
  const maxApr = calculateApr(amount, maxNominal, tenureMonths, processingFeePercent, insuranceEstimate);

  const isPredatoryTerritory = minNominal >= RATE_PREDATORY_THRESHOLD || (answers.existingAppLoanApr || 0) >= RATE_PREDATORY_THRESHOLD;

  // Comparison strings
  let competingOfferComparison: string | undefined;
  if (answers.existingOffers && answers.existingOffers.length > 0) {
    const quotedRate = answers.existingOffers[0].rate;
    if (quotedRate > maxNominal) {
      const diff = (quotedRate - maxNominal).toFixed(1);
      competingOfferComparison = `You were quoted ${quotedRate}%, which is ${diff}% higher than the fair market ceiling of ${maxNominal}%.`;
    } else if (quotedRate < minNominal) {
      competingOfferComparison = `Your quoted rate of ${quotedRate}% is very competitive against market standards.`;
    } else {
      competingOfferComparison = `Your quoted rate of ${quotedRate}% sits squarely inside the fair market band.`;
    }
  }

  let existingDebtComparison: string | undefined;
  if (answers.existingAppLoanApr && answers.existingAppLoanApr >= RATE_PREDATORY_THRESHOLD) {
    const diff = (answers.existingAppLoanApr - maxNominal).toFixed(1);
    existingDebtComparison = `Your current loans at ${answers.existingAppLoanApr}% APR are ${diff}% above institutional fair lending rates.`;
  }

  // Reason formulation
  let reason = `Fair rate is ${minNominal.toFixed(1)}%–${maxNominal.toFixed(1)}% for a ${label}`;
  if (scoreContext) {
    reason += ` ${scoreContext}.`;
  } else {
    reason += `. ${routingReason}`;
  }
  if (hasBounce) {
    reason += ` (Includes a 1% risk surcharge due to a recent payment bounce).`;
  }

  // Confidence
  let confidence: ConfidenceLevel = 'Low';
  let tighteningHint = 'Provide credit score and recent loan quotes to tighten the rate band.';

  if (scoreKnown && answers.incomeStability !== undefined) {
    confidence = 'High';
    tighteningHint = 'Rate band is tightly calibrated to your verified credit score and job stability.';
  } else if (scoreKnown || answers.incomeStability !== undefined) {
    confidence = 'Medium';
    tighteningHint = 'Confirming income stability tenure and existing lender offers will maximize rate confidence.';
  }

  return {
    productRecommended: product,
    productLabel: label,
    minNominalRate: minNominal,
    maxNominalRate: maxNominal,
    minApr,
    maxApr,
    assumedProcessingFeePercent: processingFeePercent,
    mandatoryInsuranceEstimate: insuranceEstimate,
    isPredatoryTerritory,
    competingOfferComparison,
    existingDebtComparison,
    reason,
    confidence,
    tighteningHint,
  };
}

/**
 * Assembles the frozen Negotiation Card payload from O1-O4 outputs.
 * Designed to be held up against a lender's sanction letter.
 */

import { Answers, NegotiationCardPayload } from './types';
import { computeVerdict } from './verdict';
import { computeMaxAmount } from './eligibility';
import { computeRateBandAndApr } from './rateBands';
import { computeEmiCeiling } from './emiCeiling';

export function assembleNegotiationCard(
  answers: Answers,
  answeredCount: number,
  totalPossibleCount: number
): NegotiationCardPayload {
  const o1 = computeVerdict(answers);
  const o2 = computeMaxAmount(answers);
  const o3 = computeRateBandAndApr(answers);
  const o4 = computeEmiCeiling(answers);

  const purposeLabels: Record<string, string> = {
    wedding: 'Wedding & Family Event',
    education: 'Higher Education',
    medical: 'Medical Treatment',
    vehicle: 'Vehicle Purchase',
    business_working_capital: 'Business Working Capital',
    business_asset: 'Business Asset Purchase / Equipment',
    home_purchase: 'Home Purchase',
    home_renovation: 'Home Renovation / Improvement',
    debt_consolidation: 'Debt Consolidation',
    other: 'General Purpose',
  };

  const purposeStr = answers.purpose ? purposeLabels[answers.purpose] || answers.purpose : 'General Purpose';
  const amount = answers.amountWanted || 500000;

  // Counter offer script
  let counterOfferScript = '';
  if (o3.maxApr > 0) {
    counterOfferScript = `If your lender quotes an APR above ${o3.maxApr.toFixed(1)}% (nominal rate above ${o3.maxNominalRate.toFixed(1)}%), show them this card. State: "My debt-to-income profile and collateral benchmark at ${o3.minNominalRate.toFixed(1)}%–${o3.maxNominalRate.toFixed(1)}% across prime lenders. Can you waive the ${o3.assumedProcessingFeePercent}% processing fee or match the ${o3.minNominalRate.toFixed(1)}% base rate?"`;
  }

  // Hard-hitting questions to interrogate lender sanction letters
  const lenderQuestions = [
    `"What is the all-in APR including processing fees, documentation charges, and mandatory insurance?"`,
    `"Are there any prepayment or foreclosure penalties if I pay this off within 12 to 24 months?"`,
    `"Is the interest calculated on a daily reducing balance or flat rate basis?"`,
    o3.productRecommended === 'business_secured' || o3.productRecommended === 'lap'
      ? `"Since I am offering unencumbered property as collateral, have you applied your best secured lending band?"`
      : `"Can you match the prime benchmark rate of ${o3.minNominalRate.toFixed(1)}% with zero processing fee?"`,
  ];

  const confidenceDisclosure = `Based on ${answeredCount} of ${totalPossibleCount} applicable profile questions answered in this session. All calculations run client-side without bureau inquiry.`;

  return {
    borrowerAsk: {
      amount,
      purpose: purposeStr,
      suggestedProduct: o3.productLabel,
    },
    o1,
    o2,
    o3,
    o4,
    counterOfferScript,
    lenderQuestions,
    answeredQuestionCount: answeredCount,
    totalPossibleQuestions: totalPossibleCount,
    confidenceDisclosure,
  };
}

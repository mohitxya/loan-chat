/**
 * Top-level pure rule execution engine.
 * Computes all four outputs (O1-O4) and the negotiation card payload.
 * Zero JSX or UI imports.
 */

import { Answers, EngineResult } from './types';
import { computeVerdict } from './verdict';
import { computeMaxAmount } from './eligibility';
import { computeRateBandAndApr } from './rateBands';
import { computeEmiCeiling } from './emiCeiling';
import { assembleNegotiationCard } from './negotiationCard';
import {
  evaluateVerdictConfidence,
  evaluateEligibilityConfidence,
  evaluateRateConfidence,
  evaluateEmiCeilingConfidence,
} from './confidence';

export function runDecisionEngine(
  answers: Answers,
  answeredCount: number = 10,
  totalApplicableCount: number = 14
): EngineResult {
  const o1 = computeVerdict(answers);
  const o2 = computeMaxAmount(answers);
  const o3 = computeRateBandAndApr(answers);
  const o4 = computeEmiCeiling(answers);

  // Apply explicit confidence evaluations
  const vConf = evaluateVerdictConfidence(answers);
  const eConf = evaluateEligibilityConfidence(answers);
  const rConf = evaluateRateConfidence(answers);
  const emiConf = evaluateEmiCeilingConfidence(answers);

  // If only must-ask questions are answered, enforce Low confidence across the board
  // with explicit guidance on what tightens each output.
  const hasOnlyMustAsk =
    answers.incomeStability === undefined &&
    answers.bouncesLast12m === undefined &&
    answers.emergencySavingsMonths === undefined &&
    answers.upcomingLargeExpense === undefined;

  if (hasOnlyMustAsk) {
    o1.confidence = 'Low';
    o1.tighteningHint = 'Must-ask tier answered. Add income stability and bounce history to tighten verdict.';

    o2.confidence = 'Low';
    o2.tighteningHint = 'Must-ask tier answered. Add job tenure and emergency cushion to tighten loan ceilings.';

    o3.confidence = 'Low';
    o3.tighteningHint = 'Must-ask tier answered. Verify credit score and existing offers to tighten rate band.';

    o4.confidence = 'Low';
    o4.tighteningHint = 'Must-ask tier answered. Add emergency savings to validate safe monthly EMI ceiling.';
  } else {
    o1.confidence = vConf.level;
    o1.tighteningHint = vConf.tighteningHint;

    o2.confidence = eConf.level;
    o2.tighteningHint = eConf.tighteningHint;

    o3.confidence = rConf.level;
    o3.tighteningHint = rConf.tighteningHint;

    o4.confidence = emiConf.level;
    o4.tighteningHint = emiConf.tighteningHint;
  }

  const negotiationCard = assembleNegotiationCard(answers, answeredCount, totalApplicableCount);
  // Synchronize outputs in card
  negotiationCard.o1 = o1;
  negotiationCard.o2 = o2;
  negotiationCard.o3 = o3;
  negotiationCard.o4 = o4;

  return {
    o1,
    o2,
    o3,
    o4,
    negotiationCard,
    answeredCount,
    totalApplicableCount,
  };
}

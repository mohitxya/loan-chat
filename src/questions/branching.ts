/**
 * Pure adaptive branching logic.
 * No UI or React hooks.
 */

import { Question } from './types';
import { Answers } from '../rules/types';
import { QUESTION_BANK } from './questionBank';

/**
 * Checks if a specific question has already been answered
 */
export function isQuestionAnswered(question: Question, answers: Answers): boolean {
  switch (question.id) {
    case 'purpose':
      return answers.purpose !== undefined;
    case 'amountWanted':
      return answers.amountWanted !== undefined && answers.amountWanted > 0;
    case 'loanProductWanted':
      return answers.loanProductWanted !== undefined;
    case 'employmentType':
      return answers.employmentType !== undefined;
    case 'monthlyIncome':
      return answers.monthlyIncome !== undefined;
    case 'incomeRange':
      return (
        (answers.incomeMin !== undefined && answers.incomeMax !== undefined) ||
        answers.monthlyIncome !== undefined
      );
    case 'existingEmis':
      return answers.existingEmis !== undefined;
    case 'essentialExpenses':
      return answers.essentialExpenses !== undefined;
    case 'age':
      return answers.age !== undefined;
    case 'creditScore':
      return answers.creditScoreKnown !== undefined;
    case 'collateral':
      return answers.collateral !== undefined;
    case 'collateralValue':
      return answers.collateralValue !== undefined;
    case 'incomeStability':
      return answers.incomeStability !== undefined;
    case 'bouncesLast12m':
      return answers.bouncesLast12m !== undefined;
    case 'emergencySavingsMonths':
      return answers.emergencySavingsMonths !== undefined;
    case 'coApplicantIncome':
      return answers.coApplicantIncome !== undefined;
    case 'upcomingLargeExpense':
      return answers.upcomingLargeExpense !== undefined;
    case 'creditCardUtilisation':
      return answers.creditCardUtilisation !== undefined;
    case 'businessProjectedIncome':
      return answers.businessProjectedIncome !== undefined;
    case 'variableIncomeShare':
      return answers.variableIncomeShare !== undefined;
    case 'existingAppLoanApr':
      return answers.existingAppLoanApr !== undefined;
    case 'existingOfferRate':
      return (
        answers.existingOffers !== undefined &&
        answers.existingOffers.length > 0 &&
        answers.existingOffers[0].rate !== undefined
      );
    default:
      return false;
  }
}

/**
 * Returns all questions applicable to the current borrower's profile
 */
export function getApplicableQuestions(
  answers: Answers,
  bank: Question[] = QUESTION_BANK
): Question[] {
  return bank.filter((q) => q.appliesIf(answers));
}

/**
 * Returns the next unanswered applicable question according to the information-gain heuristic,
 * or null if all applicable questions are answered.
 */
export function getNextQuestion(
  answers: Answers,
  bank: Question[] = QUESTION_BANK
): Question | null {
  const applicable = getApplicableQuestions(answers, bank);

  // Must-ask tier questions are answered first
  for (const q of applicable) {
    if (q.tier === 'must_ask' && !isQuestionAnswered(q, answers)) {
      return q;
    }
  }

  // Additional tier questions in order of information gain
  for (const q of applicable) {
    if (q.tier === 'additional' && !isQuestionAnswered(q, answers)) {
      return q;
    }
  }

  return null;
}

/**
 * Computes progress stats: answered count, total applicable count, and percentage
 */
export function getProgressStats(
  answers: Answers,
  bank: Question[] = QUESTION_BANK
): {
  answeredCount: number;
  totalApplicableCount: number;
  mustAskAnswered: number;
  mustAskTotal: number;
  isMustAskComplete: boolean;
  isAllComplete: boolean;
  percentage: number;
} {
  const applicable = getApplicableQuestions(answers, bank);
  const mustAsk = applicable.filter((q) => q.tier === 'must_ask');

  let answeredCount = 0;
  let mustAskAnswered = 0;

  for (const q of applicable) {
    if (isQuestionAnswered(q, answers)) {
      answeredCount++;
      if (q.tier === 'must_ask') {
        mustAskAnswered++;
      }
    }
  }

  const mustAskTotal = mustAsk.length;
  const totalApplicableCount = applicable.length;
  const isMustAskComplete = mustAskAnswered >= mustAskTotal;
  const isAllComplete = answeredCount >= totalApplicableCount;
  const percentage = totalApplicableCount > 0 ? Math.round((answeredCount / totalApplicableCount) * 100) : 0;

  return {
    answeredCount,
    totalApplicableCount,
    mustAskAnswered,
    mustAskTotal,
    isMustAskComplete,
    isAllComplete,
    percentage,
  };
}

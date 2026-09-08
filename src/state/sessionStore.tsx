import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Answers, EngineResult } from '../rules/types';
import { runDecisionEngine } from '../rules/engine';
import { QUESTION_BANK } from '../questions/questionBank';
import { Question } from '../questions/types';
import {
  getApplicableQuestions,
  getNextQuestion,
  getProgressStats,
  isQuestionAnswered,
} from '../questions/branching';

export const INITIAL_ANSWERS: Answers = {
  amountWanted: 500000,
};

export const PRIYA_PRESET: Answers = {
  purpose: 'wedding',
  loanProductWanted: 'personal',
  amountWanted: 800000,
  employmentType: 'salaried',
  monthlyIncome: 110000,
  existingEmis: 14000,
  essentialExpenses: 28000,
  age: 29,
  creditScoreKnown: true,
  creditScore: 780,
  collateral: 'none',
  incomeStability: 'gt_2_years',
  bouncesLast12m: 0,
  emergencySavingsMonths: 4,
  creditCardUtilisation: 15,
};

export const RAVI_PRESET: Answers = {
  purpose: 'business_working_capital',
  amountWanted: 1500000,
  loanProductWanted: 'business_secured',
  employmentType: 'self_employed_cash',
  incomeMin: 40000,
  incomeMax: 80000,
  existingEmis: 0,
  essentialExpenses: 25000,
  age: 42,
  creditScoreKnown: false,
  creditScore: null,
  collateral: 'property',
  collateralValue: 4500000,
  incomeStability: 'gt_2_years',
  bouncesLast12m: 0,
  coApplicantIncome: 18000,
  variableIncomeShare: 35,
  businessProjectedIncome: 25000,
};

export const ANITA_PRESET: Answers = {
  purpose: 'vehicle',
  loanProductWanted: 'vehicle_tw',
  amountWanted: 150000,
  employmentType: 'gig_informal',
  incomeMin: 26000,
  incomeMax: 30000,
  existingEmis: 7500,
  essentialExpenses: 18000,
  age: 35,
  creditScoreKnown: false,
  creditScore: null,
  collateral: 'none',
  incomeStability: 'lt_2_years',
  bouncesLast12m: 1,
  emergencySavingsMonths: 0,
  existingAppLoanApr: 36,
};

interface SessionContextValue {
  answers: Answers;
  setAnswer: <K extends keyof Answers>(key: K, value: Answers[K]) => void;
  setMultipleAnswers: (newAnswers: Partial<Answers>) => void;
  currentQuestion: Question | null;
  history: string[];
  goToQuestion: (questionId: string) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  activeView: 'questionnaire' | 'negotiation_card';
  setActiveView: (view: 'questionnaire' | 'negotiation_card') => void;
  mobileTab: 'question' | 'numbers';
  setMobileTab: (tab: 'question' | 'numbers') => void;
  results: EngineResult;
  stats: ReturnType<typeof getProgressStats>;
  loadPreset: (name: 'priya' | 'ravi' | 'anita' | 'blank') => void;
  resetSession: () => void;
  applicableQuestions: Question[];
  showDebugModal: boolean;
  setShowDebugModal: (show: boolean) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [answers, setAnswers] = useState<Answers>(INITIAL_ANSWERS);
  const [history, setHistory] = useState<string[]>([]);
  const [currentQuestionId, setCurrentQuestionId] = useState<string>('purpose');
  const [activeView, setActiveView] = useState<'questionnaire' | 'negotiation_card'>('questionnaire');
  const [mobileTab, setMobileTab] = useState<'question' | 'numbers'>('question');
  const [showDebugModal, setShowDebugModal] = useState<boolean>(false);

  const applicableQuestions = useMemo(
    () => getApplicableQuestions(answers, QUESTION_BANK),
    [answers]
  );

  const stats = useMemo(() => getProgressStats(answers, QUESTION_BANK), [answers]);

  const results = useMemo(
    () => runDecisionEngine(answers, stats.answeredCount, stats.totalApplicableCount),
    [answers, stats.answeredCount, stats.totalApplicableCount]
  );

  const currentQuestion = useMemo(() => {
    // If currentQuestionId is explicitly selected and unanswered
    const found = applicableQuestions.find((q) => q.id === currentQuestionId && !isQuestionAnswered(q, answers));
    if (found) return found;
    return getNextQuestion(answers, QUESTION_BANK);
  }, [applicableQuestions, currentQuestionId, answers]);

  const setAnswer = useCallback(<K extends keyof Answers>(key: K, value: Answers[K]) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const setMultipleAnswers = useCallback((newAnswers: Partial<Answers>) => {
    setAnswers((prev) => ({
      ...prev,
      ...newAnswers,
    }));
  }, []);

  const goToNext = useCallback(() => {
    if (currentQuestion) {
      setHistory((prev) => (prev.includes(currentQuestion.id) ? prev : [...prev, currentQuestion.id]));
    }
    const nextQ = getNextQuestion(answers, QUESTION_BANK);
    if (nextQ) {
      setCurrentQuestionId(nextQ.id);
    } else {
      setActiveView('negotiation_card');
    }
  }, [answers, currentQuestion]);

  const goToPrevious = useCallback(() => {
    if (history.length > 0) {
      const newHistory = [...history];
      const prevId = newHistory.pop()!;
      setHistory(newHistory);
      setCurrentQuestionId(prevId);
    }
  }, [history]);

  const goToQuestion = useCallback((questionId: string) => {
    setCurrentQuestionId(questionId);
    setActiveView('questionnaire');
  }, []);

  const loadPreset = useCallback((name: 'priya' | 'ravi' | 'anita' | 'blank') => {
    let target: Answers;
    if (name === 'priya') target = PRIYA_PRESET;
    else if (name === 'ravi') target = RAVI_PRESET;
    else if (name === 'anita') target = ANITA_PRESET;
    else target = INITIAL_ANSWERS;

    setAnswers(target);
    const applicable = getApplicableQuestions(target, QUESTION_BANK);
    const answeredIds = applicable.filter((q) => isQuestionAnswered(q, target)).map((q) => q.id);
    const firstUnanswered = applicable.find((q) => !isQuestionAnswered(q, target));
    const targetId = firstUnanswered ? firstUnanswered.id : 'purpose';
    setCurrentQuestionId(targetId);
    setHistory(answeredIds);
  }, []);

  const resetSession = useCallback(() => {
    setAnswers(INITIAL_ANSWERS);
    setCurrentQuestionId('purpose');
    setHistory([]);
    setActiveView('questionnaire');
    setMobileTab('question');
  }, []);

  const value: SessionContextValue = {
    answers,
    setAnswer,
    setMultipleAnswers,
    currentQuestion,
    history,
    goToQuestion,
    goToNext,
    goToPrevious,
    activeView,
    setActiveView,
    mobileTab,
    setMobileTab,
    results,
    stats,
    loadPreset,
    resetSession,
    applicableQuestions,
    showDebugModal,
    setShowDebugModal,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = (): SessionContextValue => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

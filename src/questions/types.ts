import { Answers } from '../rules/types';

export type QuestionType =
  | 'select'
  | 'currency'
  | 'number'
  | 'radio'
  | 'currency_range'
  | 'boolean'
  | 'credit_score';

export interface QuestionOption {
  value: any;
  label: string;
  sublabel?: string;
  badge?: string;
}

export interface Question {
  id: string;
  tier: 'must_ask' | 'additional';
  category: 'core' | 'salaried' | 'self_employed' | 'informal' | 'all';
  title: string;
  helpText: string;
  type: QuestionType;
  options?: QuestionOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  appliesIf: (answers: Answers) => boolean;
  informationGainReason: string;
}

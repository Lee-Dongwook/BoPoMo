import { Word } from "../types";

export type QuizType =
  | "TONE_MATCH"
  | "MEANING_MATCH"
  | "BOPOMO_MATCH"
  | "PINYIN_MATCH";

export interface BaseQuizQuestion {
  readonly id: string;
  readonly type: QuizType;
  readonly targetWord: Word;
  readonly options: readonly string[];
}

export interface ToneMatchQuestion extends BaseQuizQuestion {
  readonly type: "TONE_MATCH";
  readonly options: readonly string[];
}

export interface MeaningMatchQuestion extends BaseQuizQuestion {
  readonly type: "MEANING_MATCH";
  readonly options: readonly string[];
}

export interface BopomoMatchQuestion extends BaseQuizQuestion {
  readonly type: "BOPOMO_MATCH";
  readonly options: readonly string[];
}

export interface PinyinMatchQuestion extends BaseQuizQuestion {
  readonly type: "PINYIN_MATCH";
  readonly options: readonly string[];
}

export type QuizQuestion =
  | ToneMatchQuestion
  | MeaningMatchQuestion
  | BopomoMatchQuestion
  | PinyinMatchQuestion;

export interface QuizSubmission {
  readonly question: QuizQuestion;
  readonly selectedOption: string;
  readonly responseTimeMs: number;
}

export interface QuizEvaluation {
  readonly wordId: string;
  readonly isCorrect: boolean;
  readonly selectedOption: string;
  readonly correctOption: string;
  readonly responseTimeMs: number;
  readonly explanation?: string;
}


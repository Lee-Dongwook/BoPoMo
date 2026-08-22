import { Word } from "../types";

export type QuizType = "TONE_MATCH" | "MEANING_MATCH";

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

export type QuizQuestion = ToneMatchQuestion | MeaningMatchQuestion;

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
}

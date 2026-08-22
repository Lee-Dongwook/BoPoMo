import type { QuizResult } from "../types";

export interface ReviewState {
  readonly wordId: string;
  readonly intervalDays: number;
  readonly easeFactor: number;
  readonly reviewCount: number;
}

const calculateNextInterval = (
  reviewCount: number,
  currentInterval: number,
  easeFactor: number,
): number => {
  if (reviewCount === 0) return 1;
  if (reviewCount === 1) return 3;
  return Math.round(currentInterval * easeFactor);
};

export const calculateNextReview = (
  currentState: ReviewState,
  result: QuizResult,
): ReviewState => {
  if (!result.isCorrect) {
    return {
      wordId: result.wordId,
      intervalDays: 1,
      easeFactor: Math.max(1.3, currentState.easeFactor - 0.2),
      reviewCount: 0,
    };
  }

  const nextInterval = calculateNextInterval(
    currentState.reviewCount,
    currentState.intervalDays,
    currentState.easeFactor,
  );

  const bonusEase = result.responseTimeMs < 2000 ? 0.1 : 0;
  const nextEaseFactor =
    Math.round((currentState.easeFactor + bonusEase) * 100) / 100;

  return {
    wordId: result.wordId,
    intervalDays: nextInterval,
    easeFactor: nextEaseFactor,
    reviewCount: currentState.reviewCount + 1,
  };
};

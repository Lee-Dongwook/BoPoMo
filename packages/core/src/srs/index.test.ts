import { describe, expect, it } from "vitest";
import { calculateNextReview, ReviewState } from "./index";
import { QuizResult } from "../types";

describe("calculateNextReview (SRS Algorithm)", () => {
  const initialState: ReviewState = {
    wordId: "w-1",
    intervalDays: 1,
    easeFactor: 2.5,
    reviewCount: 0,
  };

  it("오답일 경우 간격을 1일로 리셋하고 easeFactor를 차감해야 한다", () => {
    const wrongResult: QuizResult = {
      wordId: "w-1",
      isCorrect: false,
      selectedTone: 2,
      responseTimeMs: 3000,
    };

    const nextState = calculateNextReview(initialState, wrongResult);

    expect(nextState.intervalDays).toBe(1);
    expect(nextState.reviewCount).toBe(0);
    expect(nextState.easeFactor).toBe(2.3);
  });

  it("정답이고 응답 시간이 빠른 경우 복습 간격 증가 및 easeFactor 보상을 지급해야 한다", () => {
    const correctResult: QuizResult = {
      wordId: "w-1",
      isCorrect: true,
      selectedTone: 1,
      responseTimeMs: 1500, // < 2000ms
    };

    const nextState = calculateNextReview(initialState, correctResult);

    expect(nextState.intervalDays).toBe(1);
    expect(nextState.reviewCount).toBe(1);
    expect(nextState.easeFactor).toBe(2.6);
  });
});

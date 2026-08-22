import { describe, expect, it } from "vitest";
import { evaluateQuiz, getToneLabel } from "./engine";
import { ToneMatchQuestion, QuizSubmission } from "./types";
import { Word } from "../types";

describe("Quiz Engine", () => {
  const mockWord: Word = {
    id: "w-1",
    pinyin: "mā",
    pinyinNumeric: "ma1",
    hanzi: "妈",
    zhuyin: "ㄇㄚ",
    meaning: "엄마",
    tone: 1,
    level: 1,
  };

  const mockQuestion: ToneMatchQuestion = {
    id: "q-1",
    type: "TONE_MATCH",
    targetWord: mockWord,
    options: [
      getToneLabel(1),
      getToneLabel(2),
      getToneLabel(3),
      getToneLabel(4),
      getToneLabel(5),
    ],
  };

  it("올바른 성조 선택 시 정답 판정을 내리고 채점 결과를 반환해야 한다", () => {
    const submission: QuizSubmission = {
      question: mockQuestion,
      selectedOption: getToneLabel(1),
      responseTimeMs: 1200,
    };

    const result = evaluateQuiz(submission);

    expect(result.isCorrect).toBe(true);
    expect(result.wordId).toBe("w-1");
    expect(result.correctOption).toBe(getToneLabel(1));
  });

  it("보포모포 퀴즈 문제 생성 및 채점이 정확해야 한다", () => {
    import("./engine").then(({ createBopomoMatchQuestion, evaluateQuiz }) => {
      const allWords: Word[] = [
        mockWord,
        { id: "w-2", pinyin: "nǐ", pinyinNumeric: "ni3", hanzi: "你", meaning: "너", tone: 3, level: 1 },
      ];
      const q = createBopomoMatchQuestion(mockWord, allWords, "q-bopomo-1");
      expect(q.type).toBe("BOPOMO_MATCH");
      expect(q.options).toContain("ㄇㄚ");

      const sub: QuizSubmission = {
        question: q,
        selectedOption: "ㄇㄚ",
        responseTimeMs: 800,
      };
      const res = evaluateQuiz(sub);
      expect(res.isCorrect).toBe(true);
    });
  });
});


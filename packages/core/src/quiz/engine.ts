import type { ToneNumber, Word } from "../types";
import type {
  QuizEvaluation,
  QuizSubmission,
  MeaningMatchQuestion,
  ToneMatchQuestion,
} from "./types";

const TONE_LABELS: Record<ToneNumber, string> = {
  1: "1성 (¯)",
  2: "2성 (ˊ)",
  3: "3성 (ˇ)",
  4: "4성 (ˋ)",
  5: "경성 (•)",
};

export const getToneLabel = (tone: ToneNumber): string => TONE_LABELS[tone];

const shuffleArray = <T>(array: readonly T[]): readonly T[] =>
  [...array].sort(() => Math.random() - 0.5);

export const createToneMatchQuestion = (
  targetWord: Word,
  questionId: string,
): ToneMatchQuestion => ({
  id: questionId,
  type: "TONE_MATCH",
  targetWord,
  options: [
    TONE_LABELS[1],
    TONE_LABELS[2],
    TONE_LABELS[3],
    TONE_LABELS[4],
    TONE_LABELS[5],
  ],
});

export const createMeaningMatchQuestion = (
  targetWord: Word,
  allWords: readonly Word[],
  questionId: string,
): MeaningMatchQuestion => {
  const incorrectCandidates = allWords
    .filter((w) => w.id !== targetWord.id)
    .map((w) => w.meaning);

  const shuffledIncorrects = shuffleArray(incorrectCandidates).slice(0, 3);
  const options = shuffleArray([targetWord.meaning, ...shuffledIncorrects]);

  return {
    id: questionId,
    type: "MEANING_MATCH",
    targetWord,
    options,
  };
};

export const evaluateQuiz = (submission: QuizSubmission): QuizEvaluation => {
  const { question, selectedOption, responseTimeMs } = submission;
  const { targetWord } = question;

  const correctOption =
    question.type == "TONE_MATCH"
      ? TONE_LABELS[targetWord.tone]
      : targetWord.meaning;

  const isCorrect = selectedOption === correctOption;

  return {
    wordId: targetWord.id,
    isCorrect,
    selectedOption,
    correctOption,
    responseTimeMs,
  };
};

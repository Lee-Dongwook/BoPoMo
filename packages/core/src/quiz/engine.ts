import type { ToneNumber, Word } from "../types";
import { pinyinToZhuyin } from "../utils/pinyin";
import type {
  QuizEvaluation,
  QuizSubmission,
  MeaningMatchQuestion,
  ToneMatchQuestion,
  BopomoMatchQuestion,
  PinyinMatchQuestion,
  QuizQuestion,
  QuizType,
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

export const createBopomoMatchQuestion = (
  targetWord: Word,
  allWords: readonly Word[],
  questionId: string,
): BopomoMatchQuestion => {
  const correctZhuyin =
    targetWord.zhuyin || pinyinToZhuyin(targetWord.pinyinNumeric);
  const incorrectCandidates = allWords
    .filter((w) => w.id !== targetWord.id)
    .map((w) => w.zhuyin || pinyinToZhuyin(w.pinyinNumeric));

  const shuffledIncorrects = shuffleArray(incorrectCandidates).slice(0, 3);
  const options = shuffleArray([correctZhuyin, ...shuffledIncorrects]);

  return {
    id: questionId,
    type: "BOPOMO_MATCH",
    targetWord,
    options,
  };
};

export const createPinyinMatchQuestion = (
  targetWord: Word,
  allWords: readonly Word[],
  questionId: string,
): PinyinMatchQuestion => {
  const incorrectCandidates = allWords
    .filter((w) => w.id !== targetWord.id)
    .map((w) => w.pinyin);

  const shuffledIncorrects = shuffleArray(incorrectCandidates).slice(0, 3);
  const options = shuffleArray([targetWord.pinyin, ...shuffledIncorrects]);

  return {
    id: questionId,
    type: "PINYIN_MATCH",
    targetWord,
    options,
  };
};

export const generateQuizSession = (
  words: readonly Word[],
  count: number = 5,
  allowedTypes: readonly QuizType[] = [
    "TONE_MATCH",
    "MEANING_MATCH",
    "BOPOMO_MATCH",
    "PINYIN_MATCH",
  ],
): QuizQuestion[] => {
  const shuffledWords = shuffleArray(words).slice(0, count);
  return shuffledWords.map((word, idx) => {
    const qId = `quiz-${Date.now()}-${idx + 1}`;
    const selectedType =
      allowedTypes[Math.floor(Math.random() * allowedTypes.length)] ||
      "TONE_MATCH";

    switch (selectedType) {
      case "MEANING_MATCH":
        return createMeaningMatchQuestion(word, words, qId);
      case "BOPOMO_MATCH":
        return createBopomoMatchQuestion(word, words, qId);
      case "PINYIN_MATCH":
        return createPinyinMatchQuestion(word, words, qId);
      case "TONE_MATCH":
      default:
        return createToneMatchQuestion(word, qId);
    }
  });
};

export const evaluateQuiz = (submission: QuizSubmission): QuizEvaluation => {
  const { question, selectedOption, responseTimeMs } = submission;
  const { targetWord } = question;

  let correctOption = "";
  let explanation = "";

  switch (question.type) {
    case "TONE_MATCH":
      correctOption = TONE_LABELS[targetWord.tone];
      explanation = `${targetWord.hanzi}(${targetWord.pinyin})는 ${targetWord.tone}성입니다.`;
      break;
    case "MEANING_MATCH":
      correctOption = targetWord.meaning;
      explanation = `${targetWord.hanzi}(${targetWord.pinyin})의 뜻은 '${targetWord.meaning}'입니다.`;
      break;
    case "BOPOMO_MATCH":
      correctOption =
        targetWord.zhuyin || pinyinToZhuyin(targetWord.pinyinNumeric);
      explanation = `${targetWord.hanzi}(${targetWord.pinyin})의 보포모포 표기는 '${correctOption}'입니다.`;
      break;
    case "PINYIN_MATCH":
      correctOption = targetWord.pinyin;
      explanation = `${targetWord.hanzi}의 병음 표기는 '${targetWord.pinyin}'입니다.`;
      break;
  }

  const isCorrect = selectedOption === correctOption;

  return {
    wordId: targetWord.id,
    isCorrect,
    selectedOption,
    correctOption,
    responseTimeMs,
    explanation,
  };
};


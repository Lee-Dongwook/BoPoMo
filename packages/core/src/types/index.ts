// 성조 (1, 2, 3, 4성, 경성)
export type ToneNumber = 1 | 2 | 3 | 4 | 5;

// 발음 요소 타입 (성모 / 운모)
export type PinyinElementType = "INITIAL" | "FINAL";

export interface PinyinElement {
  id: string;
  type: PinyinElementType;
  symbol: string;
  description: string;
  audioUrl?: string;
}

export interface Word {
  id: string;
  pinyin: string;
  pinyinNumeric: string;
  hanzi?: string;
  meaning: string;
  tone: ToneNumber;
  level: number;
}

export interface QuizResult {
  wordId: string;
  isCorrect: boolean;
  selectedTone: ToneNumber;
  responseTimeMs: number;
}

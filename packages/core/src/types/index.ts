// 성조 (1, 2, 3, 4성, 경성)
export type ToneNumber = 1 | 2 | 3 | 4 | 5;

// 발음 요소 타입 (성모 / 운모 / 개음 / 성조)
export type PinyinElementType = "INITIAL" | "FINAL" | "MEDIAL" | "TONE";

export interface PinyinElement {
  id: string;
  type: PinyinElementType;
  symbol: string;
  zhuyin?: string;
  ipa?: string;
  description: string;
  koreanGuide?: string;
  exampleHanzi?: string;
  examplePinyin?: string;
  exampleMeaning?: string;
  audioUrl?: string;
}

export type ZhuyinCategory = "INITIAL" | "MEDIAL" | "FINAL" | "TONE";

export interface ZhuyinSymbol {
  id: string;
  symbol: string;
  name: string;
  category: ZhuyinCategory;
  pinyin: string;
  ipa: string;
  description: string;
  koreanGuide: string;
  exampleWord: string;
  exampleMeaning: string;
}

export interface ToneInfo {
  tone: ToneNumber;
  name: string;
  chineseName: string;
  pinyinMark: string;
  zhuyinMark: string;
  pitchDescription: string;
  pitchContour: number[];
  audioTip: string;
}

export interface Word {
  id: string;
  pinyin: string;
  pinyinNumeric: string;
  zhuyin?: string;
  hanzi: string;
  meaning: string;
  tone: ToneNumber;
  level: number;
  category?: string;
  rules?: readonly string[];
}

export interface SandhiApplication {
  ruleId: string;
  ruleName: string;
  originalPinyin: string;
  modifiedPinyin: string;
  description: string;
}

export interface QuizResult {
  wordId: string;
  isCorrect: boolean;
  selectedTone: ToneNumber;
  responseTimeMs: number;
}


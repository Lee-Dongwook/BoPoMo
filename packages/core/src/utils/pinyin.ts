import { ToneNumber } from "../types";

// 성조 기호 맵
const TONE_MARKS: Record<string, readonly string[]> = {
  a: ["a", "ā", "á", "ǎ", "à", "a"],
  e: ["e", "ē", "é", "ě", "è", "e"],
  o: ["o", "ō", "ó", "ǒ", "ò", "o"],
  i: ["i", "ī", "í", "ǐ", "ì", "i"],
  u: ["u", "ū", "ú", "ǔ", "ù", "u"],
  v: ["ü", "ǖ", "ǘ", "ǚ", "ǜ", "ü"],
};

const TONE_NUMBERS: ReadonlySet<ToneNumber> = new Set([1, 2, 3, 4, 5]);

const regexPattern = /^([a-z]+)([1-5])$/i;

const isToneNumber = (value: number): value is ToneNumber =>
  TONE_NUMBERS.has(value as ToneNumber);

const replaceVowelWithTone = (
  text: string,
  vowel: string,
  tone: ToneNumber,
): string => {
  const toneMark = TONE_MARKS[vowel]?.[tone];
  return toneMark ? text.replace(vowel, toneMark) : text;
};

const replaceVowels = (text: string, tone: ToneNumber): string => {
  const priorityVowels = ["a", "e", "o"];
  const matchedVowel = priorityVowels.find((v) => text.includes(v));

  if (matchedVowel && TONE_MARKS[matchedVowel]) {
    return replaceVowelWithTone(text, matchedVowel, tone);
  }

  if (text.includes("iu")) return replaceVowelWithTone(text, "u", tone);
  if (text.includes("ui")) return replaceVowelWithTone(text, "i", tone);

  const secondaryVowel = ["i", "u", "v"].find((v) => text.includes(v));
  if (secondaryVowel && TONE_MARKS[secondaryVowel]) {
    return replaceVowelWithTone(text, secondaryVowel, tone);
  }

  return text;
};

export function convertNumericToPinyin(numbericPinyin: string): string {
  const match = new RegExp(regexPattern).exec(numbericPinyin);
  if (!match) return numbericPinyin;

  const [, rawText = "", toneStr = ""] = match;
  const parsedTone = Number.parseInt(toneStr, 10);

  if (!isToneNumber(parsedTone)) return numbericPinyin;

  const normalizedText = rawText.toLowerCase().replace("u:", "v");
  return replaceVowels(normalizedText, parsedTone);
}

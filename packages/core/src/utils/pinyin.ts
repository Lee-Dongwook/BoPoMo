import { ToneNumber, Word, SandhiApplication } from "../types";

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

export function convertNumericToPinyin(numericPinyin: string): string {
  const match = new RegExp(regexPattern).exec(numericPinyin);
  if (!match) return numericPinyin;

  const [, rawText = "", toneStr = ""] = match;
  const parsedTone = Number.parseInt(toneStr, 10);

  if (!isToneNumber(parsedTone)) return numericPinyin;

  const normalizedText = rawText.toLowerCase().replace("u:", "v");
  return replaceVowels(normalizedText, parsedTone);
}

// Bopomofo Tone Marks mapping
export const ZHUYIN_TONE_MARKS: Record<ToneNumber, string> = {
  1: "",
  2: "ˊ",
  3: "ˇ",
  4: "ˋ",
  5: "˙",
};

// Pinyin to Bopomofo syllable mappings for standard lexicon
const PINYIN_TO_ZHUYIN_MAP: Record<string, string> = {
  ba: "ㄅㄚ", bo: "ㄅㄛ", bai: "ㄅㄞ", bei: "ㄅㄟ", bao: "ㄅㄠ", ban: "ㄅㄢ", ben: "ㄅㄣ", bang: "ㄅㄤ", beng: "ㄅㄥ", bi: "ㄅㄧ", bie: "ㄅㄧㄝ", biao: "ㄅㄧㄠ", bian: "ㄅㄧㄢ", bin: "ㄅㄧㄣ", bing: "ㄅㄧㄥ", bu: "ㄅㄨ",
  pa: "ㄆㄚ", po: "ㄆㄛ", pai: "ㄆㄞ", pei: "ㄆㄟ", pao: "ㄆㄠ", pou: "ㄆㄡ", pan: "ㄆㄢ", pen: "ㄆㄣ", pang: "ㄆㄤ", peng: "ㄆㄥ", pi: "ㄆㄧ", pie: "ㄆㄧㄝ", piao: "ㄆㄧㄠ", pian: "ㄆㄧㄢ", pin: "ㄆㄧㄣ", ping: "ㄆㄧㄥ", pu: "ㄆㄨ",
  ma: "ㄇㄚ", mo: "ㄇㄛ", me: "ㄇㄜ", mai: "ㄇㄞ", mei: "ㄇㄟ", mao: "ㄇㄠ", mou: "ㄇㄡ", man: "ㄇㄢ", men: "ㄇㄣ", mang: "ㄇㄤ", meng: "ㄇㄥ", mi: "ㄇㄧ", mie: "ㄇㄧㄝ", miao: "ㄇㄧㄠ", miu: "ㄇㄧㄡ", mian: "ㄇㄧㄢ", min: "ㄇㄧㄣ", ming: "ㄇㄧㄥ", mu: "ㄇㄨ",
  fa: "ㄈㄚ", fo: "ㄈㄛ", fei: "ㄈㄟ", fou: "ㄈㄡ", fan: "ㄈㄢ", fen: "ㄈㄣ", fang: "ㄈㄤ", feng: "ㄈㄥ", fu: "ㄈㄨ",
  da: "ㄉㄚ", de: "ㄉㄜ", dai: "ㄉㄞ", dei: "ㄉㄟ", dao: "ㄉㄠ", dou: "ㄉㄡ", dan: "ㄉㄢ", den: "ㄉㄣ", dang: "ㄉㄤ", deng: "ㄉㄥ", di: "ㄉㄧ", die: "ㄉㄧㄝ", diao: "ㄉㄧㄠ", diu: "ㄉㄧㄡ", dian: "ㄉㄧㄢ", ding: "ㄉㄧㄥ", du: "ㄉㄨ", duo: "ㄉㄨㄛ", dui: "ㄉㄨㄟ", duan: "ㄉㄨㄢ", dun: "ㄉㄨㄣ", dong: "ㄉㄨㄥ",
  ta: "ㄊㄚ", te: "ㄊㄜ", tai: "ㄊㄞ", tao: "ㄊㄠ", tou: "ㄊㄡ", tan: "ㄊㄢ", tang: "ㄊㄤ", teng: "ㄊㄥ", ti: "ㄊㄧ", tie: "ㄊㄧㄝ", tiao: "ㄊㄧㄠ", tian: "ㄊㄧㄢ", ting: "ㄊㄧㄥ", tu: "ㄊㄨ", tuo: "ㄊㄨㄛ", tui: "ㄊㄨㄟ", tuan: "ㄊㄨㄢ", tun: "ㄊㄨㄣ", tong: "ㄊㄨㄥ",
  na: "ㄋㄚ", ne: "ㄋㄜ", nai: "ㄋㄞ", nei: "ㄋㄟ", nao: "ㄋㄠ", nou: "ㄋㄡ", nan: "ㄋㄢ", nen: "ㄋㄣ", nang: "ㄋㄤ", neng: "ㄋㄥ", ni: "ㄋㄧ", nie: "ㄋㄧㄝ", niao: "ㄋㄧㄠ", niu: "ㄋㄧㄡ", nian: "ㄋㄧㄢ", nin: "ㄋㄧㄣ", niang: "ㄋㄧㄤ", ning: "ㄋㄧㄥ", nu: "ㄋㄨ", nuo: "ㄋㄨㄛ", nuan: "ㄋㄨㄢ", nong: "ㄋㄨㄥ", nv: "ㄋㄩ", nü: "ㄋㄩ", nue: "ㄋㄩㄝ",
  la: "ㄌㄚ", lo: "ㄌㄛ", le: "ㄌㄜ", lai: "ㄌㄞ", lei: "ㄌㄟ", lao: "ㄌㄠ", lou: "ㄌㄡ", lan: "ㄌㄢ", lang: "ㄌㄤ", leng: "ㄌㄥ", li: "ㄌㄧ", lia: "ㄌㄧㄚ", lie: "ㄌㄧㄝ", liao: "ㄌㄧㄠ", liu: "ㄌㄧㄡ", lian: "ㄌㄧㄢ", lin: "ㄌㄧㄣ", liang: "ㄌㄧㄤ", ling: "ㄌㄧㄥ", lu: "ㄌㄨ", luo: "ㄌㄨㄛ", luan: "ㄌㄨㄢ", lun: "ㄌㄨㄣ", long: "ㄌㄨㄥ", lv: "ㄌㄩ", lü: "ㄌㄩ", lue: "ㄌㄩㄝ",
  ga: "ㄍㄚ", ge: "ㄍㄜ", gai: "ㄍㄞ", gei: "ㄍㄟ", gao: "ㄍㄠ", gou: "ㄍㄡ", gan: "ㄍㄢ", gen: "ㄍㄣ", gang: "ㄍㄤ", geng: "ㄍㄥ", gu: "ㄍㄨ", gua: "ㄍㄨㄚ", guo: "ㄍㄨㄛ", guai: "ㄍㄨㄞ", gui: "ㄍㄨㄟ", guan: "ㄍㄨㄢ", gun: "ㄍㄨㄣ", guang: "ㄍㄨㄤ", gong: "ㄍㄨㄥ",
  ka: "ㄎㄚ", ke: "ㄎㄜ", kai: "ㄎㄞ", kei: "ㄎㄟ", kao: "ㄎㄠ", kou: "ㄎㄡ", kan: "ㄎㄢ", ken: "ㄎㄣ", kang: "ㄎㄤ", keng: "ㄎㄥ", ku: "ㄎㄨ", kua: "ㄎㄨㄚ", kuo: "ㄎㄨㄛ", kuai: "ㄎㄨㄞ", kui: "ㄎㄨㄟ", kuan: "ㄎㄨㄢ", kun: "ㄎㄨㄣ", kuang: "ㄎㄨㄤ", kong: "ㄎㄨㄥ",
  ha: "ㄏㄚ", he: "ㄏㄜ", hai: "ㄏㄞ", hei: "ㄏㄟ", hao: "ㄏㄠ", hou: "ㄏㄡ", han: "ㄏㄢ", hen: "ㄏㄣ", hang: "ㄏㄤ", heng: "ㄏㄥ", hu: "ㄏㄨ", hua: "ㄏㄨㄚ", huo: "ㄏㄨㄛ", huai: "ㄏㄨㄞ", hui: "ㄏㄨㄟ", huan: "ㄏㄨㄢ", hun: "ㄏㄨㄣ", huang: "ㄏㄨㄤ", hong: "ㄏㄨㄥ",
  ji: "ㄐㄧ", jia: "ㄐㄧㄚ", jie: "ㄐㄧㄝ", jiao: "ㄐㄧㄠ", jiu: "ㄐㄧㄡ", jian: "ㄐㄧㄢ", jin: "ㄐㄧㄣ", jiang: "ㄐㄧㄤ", jing: "ㄐㄧㄥ", jiong: "ㄐㄩㄥ", ju: "ㄐㄩ", jue: "ㄐㄩㄝ", juan: "ㄐㄩㄢ", jun: "ㄐㄩㄣ",
  qi: "ㄑㄧ", qia: "ㄑㄧㄚ", qie: "ㄑㄧㄝ", qiao: "ㄑㄧㄠ", qiu: "ㄑㄧㄡ", qian: "ㄑㄧㄢ", qin: "ㄑㄧㄣ", qiang: "ㄑㄧㄤ", qing: "ㄑㄧㄥ", qiong: "ㄑㄩㄥ", qu: "ㄑㄩ", que: "ㄑㄩㄝ", quan: "ㄑㄩㄢ", qun: "ㄑㄩㄣ",
  xi: "ㄒㄧ", xia: "ㄒㄧㄚ", xie: "ㄒㄧㄝ", xiao: "ㄒㄧㄠ", xiu: "ㄒㄧㄡ", xian: "ㄒㄧㄢ", xin: "ㄒㄧㄣ", xiang: "ㄒㄧㄤ", xing: "ㄒㄧㄥ", xiong: "ㄒㄩㄥ", xu: "ㄒㄩ", xue: "ㄒㄩㄝ", xuan: "ㄒㄩㄢ", xun: "ㄒㄩㄣ",
  zhi: "ㄓ", zha: "ㄓㄚ", zhe: "ㄓㄜ", zhai: "ㄓㄞ", zhei: "ㄓㄟ", zhao: "ㄓㄠ", zhou: "ㄓㄡ", zhan: "ㄓㄢ", zhen: "ㄓㄣ", zhang: "ㄓㄤ", zheng: "ㄓㄥ", zhu: "ㄓㄨ", zhua: "ㄓㄨㄚ", zhuo: "ㄓㄨㄛ", zhuai: "ㄓㄨㄞ", zhui: "ㄓㄨㄟ", zhuan: "ㄓㄨㄢ", zhun: "ㄓㄨㄣ", zhuang: "ㄓㄨㄤ", zhong: "ㄓㄨㄥ",
  chi: "ㄔ", cha: "ㄔㄚ", che: "ㄔㄜ", chai: "ㄔㄞ", chao: "ㄔㄠ", chou: "ㄔㄡ", chan: "ㄔㄢ", chen: "ㄔㄣ", chang: "ㄔㄤ", cheng: "ㄔㄥ", chu: "ㄔㄨ", chua: "ㄔㄨㄚ", chuo: "ㄔㄨㄛ", chuai: "ㄔㄨㄞ", chui: "ㄔㄨㄟ", chuan: "ㄔㄨㄢ", chun: "ㄔㄨㄣ", chuang: "ㄔㄨㄤ", chong: "ㄔㄨㄥ",
  shi: "ㄕ", sha: "ㄕㄚ", she: "ㄕㄜ", shai: "ㄕㄞ", shei: "ㄕㄟ", shao: "ㄕㄠ", shou: "ㄕㄡ", shan: "ㄕㄢ", shen: "ㄕㄣ", shang: "ㄕㄤ", sheng: "ㄕㄥ", shu: "ㄕㄨ", shua: "ㄕㄨㄚ", shuo: "ㄕㄨㄛ", shuai: "ㄕㄨㄞ", shui: "ㄕㄨㄟ", shuan: "ㄕㄨㄢ", shun: "ㄕㄨㄣ", shuang: "ㄕㄨㄤ",
  ri: "ㄖ", re: "ㄖㄜ", rao: "ㄖㄠ", rou: "ㄖㄡ", ran: "ㄖㄢ", ren: "ㄖㄣ", rang: "ㄖㄤ", reng: "ㄖㄥ", ru: "ㄖㄨ", rua: "ㄖㄨㄚ", ruo: "ㄖㄨㄛ", rui: "ㄖㄨㄟ", ruan: "ㄖㄨㄢ", run: "ㄖㄨㄣ", rong: "ㄖㄨㄥ",
  zi: "ㄗ", za: "ㄗㄚ", ze: "ㄗㄜ", zai: "ㄗㄞ", zei: "ㄗㄟ", zao: "ㄗㄠ", zou: "ㄗㄡ", zan: "ㄗㄢ", zen: "ㄗㄣ", zang: "ㄗㄤ", zeng: "ㄗㄥ", zu: "ㄗㄨ", zuo: "ㄗㄨㄛ", zui: "ㄗㄨㄟ", zuan: "ㄗㄨㄢ", zun: "ㄗㄨㄣ", zong: "ㄗㄨㄥ",
  ci: "ㄘ", ca: "ㄘㄚ", ce: "ㄘㄜ", cai: "ㄘㄞ", cao: "ㄘㄠ", cou: "ㄘㄡ", can: "ㄘㄢ", cen: "ㄘㄣ", cang: "ㄘㄤ", ceng: "ㄘㄥ", cu: "ㄘㄨ", cuo: "ㄘㄨㄛ", cui: "ㄘㄨㄟ", cuan: "ㄘㄨㄢ", cun: "ㄘㄨㄣ", cong: "ㄘㄨㄥ",
  si: "ㄙ", sa: "ㄙㄚ", se: "ㄙㄜ", sai: "ㄙㄞ", sao: "ㄙㄠ", sou: "ㄙㄡ", san: "ㄙㄢ", sen: "ㄙㄣ", sang: "ㄙㄤ", seng: "ㄙㄥ", su: "ㄙㄨ", suo: "ㄙㄨㄛ", sui: "ㄙㄨㄟ", suan: "ㄙㄨㄢ", sun: "ㄙㄨㄣ", song: "ㄙㄨㄥ",
  a: "ㄚ", o: "ㄛ", e: "ㄜ", ai: "ㄞ", ei: "ㄟ", ao: "ㄠ", ou: "ㄡ", an: "ㄢ", en: "ㄣ", ang: "ㄤ", eng: "ㄥ", er: "ㄦ",
  yi: "ㄧ", ya: "ㄧㄚ", yo: "ㄧㄛ", ye: "ㄧㄝ", yao: "ㄧㄠ", you: "ㄧㄡ", yan: "ㄧㄢ", yin: "ㄧㄣ", yang: "ㄧㄤ", ying: "ㄧㄥ",
  wu: "ㄨ", wa: "ㄨㄚ", wo: "ㄨㄛ", wai: "ㄨㄞ", wei: "ㄨㄟ", wan: "ㄨㄢ", wen: "ㄨㄣ", wang: "ㄨㄤ", weng: "ㄨㄥ",
  yu: "ㄩ", yue: "ㄩㄝ", yuan: "ㄩㄢ", yun: "ㄩㄣ", yong: "ㄩㄥ",
};

export function pinyinToZhuyin(pinyinOrNumeric: string): string {
  // If string has numeric tone e.g. "ni3"
  const match = new RegExp(regexPattern).exec(pinyinOrNumeric.trim());
  if (match) {
    const [, rawText = "", toneStr = ""] = match;
    const tone = Number.parseInt(toneStr, 10) as ToneNumber;
    const baseZhuyin = PINYIN_TO_ZHUYIN_MAP[rawText.toLowerCase()] || rawText;
    const toneMark = isToneNumber(tone) ? ZHUYIN_TONE_MARKS[tone] : "";
    return `${baseZhuyin}${toneMark}`;
  }

  // If plain pinyin
  const clean = pinyinOrNumeric.toLowerCase().trim();
  return PINYIN_TO_ZHUYIN_MAP[clean] || clean;
}

/**
 * 성조 변조(Tone Sandhi) 검출 엔진
 */
export function detectToneSandhi(words: readonly Word[]): SandhiApplication[] {
  const results: SandhiApplication[] = [];

  for (let i = 0; i < words.length - 1; i++) {
    const curr = words[i];
    const next = words[i + 1];
    if (!curr || !next) continue;

    // 1. 3성 + 3성 -> 2성 + 3성 변조
    if (curr.tone === 3 && next.tone === 3) {
      results.push({
        ruleId: "rule-sandhi-33",
        ruleName: "3성 + 3성 변조",
        originalPinyin: `${curr.pinyin} ${next.pinyin}`,
        modifiedPinyin: `${curr.pinyinNumeric.replace("3", "2")} ${next.pinyin}`,
        description: `앞의 3성 음절(${curr.hanzi})이 뒤의 3성 음절(${next.hanzi})을 만나 2성으로 변조됩니다.`,
      });
    }

    // 2. 不(bù, 4성) + 4성 -> bú(2성)
    if (curr.hanzi === "不" && next.tone === 4) {
      results.push({
        ruleId: "rule-bu-4th",
        ruleName: "'不' 4성 앞 변조",
        originalPinyin: `bù ${next.pinyin}`,
        modifiedPinyin: `bú ${next.pinyin}`,
        description: `'不' 뒤에 4성(${next.hanzi})이 오면 '不'는 2성(bú)으로 변조됩니다.`,
      });
    }

    // 3. 一(yī, 1성) + 4성 -> yí(2성), 一 + 1/2/3성 -> yì(4성)
    if (curr.hanzi === "一") {
      if (next.tone === 4) {
        results.push({
          ruleId: "rule-yi-4th",
          ruleName: "'一' 4성 앞 변조",
          originalPinyin: `yī ${next.pinyin}`,
          modifiedPinyin: `yí ${next.pinyin}`,
          description: `'一' 뒤에 4성(${next.hanzi})이 오면 '一'는 2성(yí)으로 변조됩니다.`,
        });
      } else if (next.tone === 1 || next.tone === 2 || next.tone === 3) {
        results.push({
          ruleId: "rule-yi-123",
          ruleName: "'一' 1/2/3성 앞 변조",
          originalPinyin: `yī ${next.pinyin}`,
          modifiedPinyin: `yì ${next.pinyin}`,
          description: `'一' 뒤에 ${next.tone}성(${next.hanzi})이 오면 '一'는 4성(yì)으로 변조됩니다.`,
        });
      }
    }
  }

  return results;
}


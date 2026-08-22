import { describe, expect, it } from "vitest";
import { convertNumericToPinyin } from "./pinyin";

describe("convertNumericToPinyin", () => {
  it("숫자 표기 병음을 성조 기호 표기로 올바르게 변환해야 한다", () => {
    expect(convertNumericToPinyin("ma1")).toBe("mā");
    expect(convertNumericToPinyin("ma2")).toBe("má");
    expect(convertNumericToPinyin("ma3")).toBe("mǎ");
    expect(convertNumericToPinyin("ma4")).toBe("mà");
    expect(convertNumericToPinyin("ni3")).toBe("nǐ");
    expect(convertNumericToPinyin("hao3")).toBe("hǎo");
  });

  it("유효하지 않은 성조 숫자나 일반 텍스트는 원본 그대로 반환해야 한다", () => {
    expect(convertNumericToPinyin("ma6")).toBe("ma6");
    expect(convertNumericToPinyin("invalid")).toBe("invalid");
  });

  it("병음을 보포모포(주음부호)로 정확하게 변환해야 한다", () => {
    import("./pinyin").then(({ pinyinToZhuyin }) => {
      expect(pinyinToZhuyin("ni3")).toBe("ㄋㄧˇ");
      expect(pinyinToZhuyin("hao3")).toBe("ㄏㄠˇ");
      expect(pinyinToZhuyin("ma1")).toBe("ㄇㄚ");
      expect(pinyinToZhuyin("bu4")).toBe("ㄅㄨˋ");
      expect(pinyinToZhuyin("shi4")).toBe("ㄕˋ");
    });
  });

  it("3성+3성, 不, 一 성조 변조 규칙을 정확하게 탐지해야 한다", () => {
    import("./pinyin").then(({ detectToneSandhi }) => {
      const words = [
        { id: "w-1", pinyin: "nǐ", pinyinNumeric: "ni3", hanzi: "你", meaning: "너", tone: 3 as const, level: 1 },
        { id: "w-2", pinyin: "hǎo", pinyinNumeric: "hao3", hanzi: "好", meaning: "좋다", tone: 3 as const, level: 1 },
      ];
      const sandhi = detectToneSandhi(words);
      expect(sandhi.length).toBe(1);
      expect(sandhi[0]?.ruleId).toBe("rule-sandhi-33");
    });
  });
});

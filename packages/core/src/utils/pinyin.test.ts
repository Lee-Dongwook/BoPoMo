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
});

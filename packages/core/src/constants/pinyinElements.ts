import { PinyinElement } from "../types";

export const INITIALS: readonly PinyinElement[] = [
  {
    id: "init-1",
    type: "INITIAL",
    symbol: "b",
    description: "두 입술을 다물었다가 떼며 둔탁하게 내는 소리 (ㅂ)",
  },
  {
    id: "init-2",
    type: "INITIAL",
    symbol: "p",
    description: "두 입술을 다물었다가 강하게 거센 숨을 뱉으며 내는 소리 (ㅍ)",
  },
  {
    id: "init-3",
    type: "INITIAL",
    symbol: "m",
    description: "두 입술을 붙이고 코로 공기를 보내며 내는 소리 (ㅁ)",
  },
  {
    id: "init-4",
    type: "INITIAL",
    symbol: "f",
    description: "윗이빨로 아랫입술을 살짝 누르고 틈 사이로 내는 소리 (ㅍ)",
  },
  {
    id: "init-5",
    type: "INITIAL",
    symbol: "d",
    description: "혀끝을 윗잇몸에 대었다 떼며 내는 소리 (ㄷ)",
  },
  {
    id: "init-6",
    type: "INITIAL",
    symbol: "t",
    description: "혀끝을 윗잇몸에 대었다 떼며 거센 숨을 뱉는 소리 (ㅌ)",
  },
  {
    id: "init-7",
    type: "INITIAL",
    symbol: "n",
    description: "혀끝을 윗잇몸에 붙이고 코로 내는 소리 (ㄴ)",
  },
  {
    id: "init-8",
    type: "INITIAL",
    symbol: "l",
    description:
      "혀끝을 윗잇몸에 붙였다 떼며 양옆으로 공기를 흘려보내는 소리 (ㄹ)",
  },
] as const;

export const FINALS: readonly PinyinElement[] = [
  {
    id: "final-1",
    type: "FINAL",
    symbol: "a",
    description: "입을 크게 벌리고 목구멍을 열어 내는 소리 (아)",
  },
  {
    id: "final-2",
    type: "FINAL",
    symbol: "o",
    description: "입술을 동그랗게 모으고 혀를 뒤로 당기며 내는 소리 (오)",
  },
  {
    id: "final-3",
    type: "FINAL",
    symbol: "e",
    description: "입을 멍하게 벌린 상태에서 목 안쪽에서 내는 소리 (으어)",
  },
  {
    id: "final-4",
    type: "FINAL",
    symbol: "i",
    description: "입술을 양옆으로 넓게 벌리고 편평하게 내는 소리 (이)",
  },
  {
    id: "final-5",
    type: "FINAL",
    symbol: "u",
    description: "입술을 뾰족하게 앞으로 내밀며 내는 소리 (우)",
  },
  {
    id: "final-6",
    type: "FINAL",
    symbol: "v",
    description: "입술을 동그랗게 오므린 채 모양을 바꾸지 않고 내는 소리 (위)",
  },
] as const;

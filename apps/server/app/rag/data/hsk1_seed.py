from typing import Dict, List, Any

# 1. HSK 1급 성조 변조(Sandhi) 및 발음 핵심 규칙
TONE_RULES_SEED = [
    {
        "id": "rule-33",
        "name": "3성 + 3성 변조",
        "description": "3성 음절이 연속해서 올 경우, 앞의 3성은 2성으로 올려서 발음합니다. (예: 你(nǐ) + 好(hǎo) -> ní hǎo)"
    },
    {
        "id": "rule-sandhi-33",
        "name": "3성 + 3성 변조",
        "description": "3성 음절 두 개가 연속으로 올 때 앞의 3성 음절은 2성으로 변조됩니다. (예: 你(nǐ) + 好(hǎo) -> ní hǎo)"
    },
    {
        "id": "rule-sandhi-333",
        "name": "3성 3개 연속 변조",
        "description": "3성 음절 3개가 연속으로 올 때 의미 구조에 따라 [2성+2성+3성] 또는 [3성+2성+3성]으로 변조됩니다. (예: 我很好 wǒ hěn hǎo -> wǒ hén hǎo / wó hén hǎo)"
    },
    {
        "id": "rule-bu",
        "name": "'不(bù)' 성조 변조",
        "description": "'不' 뒤에 4성 음절이 오면 '不'는 2성(bú)으로 변하여 발음합니다. (예: 不(bù) + 是(shì) -> bú shì)"
    },
    {
        "id": "rule-bu-4th",
        "name": "'不(bù)' 4성 앞 성조 변조",
        "description": "'不(bù)' 뒤에 4성 음절이 오면 '不'는 2성(bú)으로 변조됩니다. (예: 不(bù) + 是(shì) -> bú shì)"
    },
    {
        "id": "rule-bu-neutral",
        "name": "'不' 의문문/보어 경성 변조",
        "description": "동사/형용사 사이에서 구문상 끼어드는 '不'는 성조를 잃고 경성(bu)으로 약하게 읽습니다. (예: 是不是 shì bu shì, 好不好 hǎo bu hǎo)"
    },
    {
        "id": "rule-yi",
        "name": "'一(yī)' 성조 변조",
        "description": "'一' 뒤에 4성이 오면 2성(yí)으로, 1/2/3성이 오면 4성(yì)으로 발음합니다. (예: 一个 yí gè, 一起 yì qǐ)"
    },
    {
        "id": "rule-yi-4th",
        "name": "'一(yī)' 4성 앞 성조 변조",
        "description": "'一(yī)' 뒤에 4성 음절이 오면 '一'는 2성(yí)으로 변조됩니다. (예: 一个 yí gè)"
    },
    {
        "id": "rule-yi-123",
        "name": "'一(yī)' 1/2/3성 앞 성조 변조",
        "description": "'一(yī)' 뒤에 1성, 2성, 3성 음절이 오면 '一'는 4성(yì)으로 변조됩니다. (예: 一天 yì tiān, 一年 yì nián, 一起 yì qǐ)"
    },
    {
        "id": "rule-poly-zhe",
        "name": "다음자 '着' 발음 구분 규칙",
        "description": "동작의 지속을 나타낼 때는 경성 'zhe'로, 목적 달성/목표 도달의 결과보어로 쓰일 때는 2성 'zháo'로 읽습니다."
    },
    {
        "id": "rule-poly-hai-huan",
        "name": "다음자 '还' 발음 구분 규칙",
        "description": "'또, 아직'의 의미를 가지는 부사일 때는 'hái', '돌려주다'의 의미를 가지는 동사일 때는 'huán'으로 읽습니다."
    },
    {
        "id": "rule-neutral",
        "name": "경성(Neutral Tone) 규칙",
        "description": "중복어 및 어미/조사는 원 성조를 잃고 짧고 가볍게 발음합니다. (예: 爸爸 bàba, 谢谢 xièxie)"
    },
    {
        "id": "rule-neutral-reduplication",
        "name": "친족 호칭 첩어 경성 규칙",
        "description": "친족 호칭을 나타내는 중복 단어(첩어)의 두 번째 음절은 성조를 약하고 짧게 읽는 경성(轻声)으로 처리합니다. (예: 爸爸 bàba, 妈妈 māma)"
    },
    {
        "id": "rule-exception-ordinal",
        "name": "서수 및 단독 숫자 '一' 본음 유지 규칙",
        "description": "서수(첫째 등)를 나타내는 '第' 뒤에 오거나 숫자 자체를 단독/순서대로 읽을 때는 '一'의 성조 변조 규칙이 적용되지 않고 본래 성조(1성 yī)를 유지합니다. (예: 第一 dì-yī, 十一 shíyī)"
    }
]

# 2. HSK 1급 대표 필수 단어
WORDS_SEED = [
    # 인칭 및 인사
    {"id": "w-ni", "hanzi": "你", "pinyin": "nǐ", "tone": 3, "meaning": "너, 당신", "rules": ["rule-33", "rule-sandhi-33"]},
    {"id": "w-hao", "hanzi": "好", "pinyin": "hǎo", "tone": 3, "meaning": "좋다, 안녕하다", "rules": ["rule-33", "rule-sandhi-33", "rule-bu-neutral"]},
    {"id": "w-wo", "hanzi": "我", "pinyin": "wǒ", "tone": 3, "meaning": "나", "rules": ["rule-sandhi-333"]},
    {"id": "w-hen", "hanzi": "很", "pinyin": "hěn", "tone": 3, "meaning": "매우, 아주", "rules": ["rule-sandhi-333"]},
    {"id": "w-ta-m", "hanzi": "他", "pinyin": "tā", "tone": 1, "meaning": "그", "rules": []},
    {"id": "w-ta-f", "hanzi": "她", "pinyin": "tā", "tone": 1, "meaning": "그녀", "rules": []},
    
    # 부정 / 동사
    {"id": "w-bu", "hanzi": "不", "pinyin": "bù", "tone": 4, "meaning": "아니다, ~않다", "rules": ["rule-bu", "rule-bu-4th", "rule-bu-neutral"]},
    {"id": "w-shi", "hanzi": "是", "pinyin": "shì", "tone": 4, "meaning": "~이다", "rules": ["rule-bu", "rule-bu-4th", "rule-bu-neutral"]},
    {"id": "w-you", "hanzi": "有", "pinyin": "yǒu", "tone": 3, "meaning": "있다, 소유하다", "rules": []},
    {"id": "w-kan", "hanzi": "看", "pinyin": "kàn", "tone": 4, "meaning": "보다", "rules": []},
    {"id": "w-chi", "hanzi": "吃", "pinyin": "chī", "tone": 1, "meaning": "먹다", "rules": []},
    {"id": "w-he", "hanzi": "喝", "pinyin": "hē", "tone": 1, "meaning": "마시다", "rules": []},
    {"id": "w-qu", "hanzi": "去", "pinyin": "qù", "tone": 4, "meaning": "가다", "rules": []},
    {"id": "w-lai", "hanzi": "来", "pinyin": "lái", "tone": 2, "meaning": "오다", "rules": []},
    
    # 숫자 및 수량
    {"id": "w-yi", "hanzi": "一", "pinyin": "yī", "tone": 1, "meaning": "하나, 1", "rules": ["rule-yi", "rule-yi-4th", "rule-yi-123"]},
    {"id": "w-ge", "hanzi": "个", "pinyin": "gè", "tone": 4, "meaning": "개, 명(양사)", "rules": ["rule-yi", "rule-yi-4th"]},
    {"id": "w-er", "hanzi": "二", "pinyin": "èr", "tone": 4, "meaning": "둘, 2", "rules": []},
    {"id": "w-san", "hanzi": "三", "pinyin": "sān", "tone": 1, "meaning": "셋, 3", "rules": []},
    {"id": "w-tian", "hanzi": "天", "pinyin": "tiān", "tone": 1, "meaning": "날, 하늘", "rules": ["rule-yi-123"]},
    {"id": "w-nian", "hanzi": "年", "pinyin": "nián", "tone": 2, "meaning": "해, 년", "rules": ["rule-yi-123"]},
    {"id": "w-qi", "hanzi": "起", "pinyin": "qǐ", "tone": 3, "meaning": "일어나다, 함께", "rules": ["rule-yi-123"]},

    # 다음자 및 서수
    {"id": "w-kanzhe", "hanzi": "看着", "pinyin": "kànzhe", "tone": 4, "meaning": "보고 있다", "rules": ["rule-poly-zhe"]},
    {"id": "w-shuizhao", "hanzi": "睡着", "pinyin": "shuìzháo", "tone": 4, "meaning": "잠들다", "rules": ["rule-poly-zhe"]},
    {"id": "w-hai", "hanzi": "还有", "pinyin": "hái yǒu", "tone": 2, "meaning": "또, 아직 있다", "rules": ["rule-poly-hai-huan"]},
    {"id": "w-huan", "hanzi": "还钱", "pinyin": "huán qián", "tone": 2, "meaning": "돈을 갚다", "rules": ["rule-poly-hai-huan"]},
    {"id": "w-diyi", "hanzi": "第一", "pinyin": "dì yī", "tone": 4, "meaning": "첫 번째", "rules": ["rule-exception-ordinal"]},
    {"id": "w-shiyi", "hanzi": "十一", "pinyin": "shí yī", "tone": 2, "meaning": "십일, 11", "rules": ["rule-exception-ordinal"]},
    
    # 감탄 / 가족
    {"id": "w-xie", "hanzi": "谢谢", "pinyin": "xièxie", "tone": 4, "meaning": "감사하다", "rules": ["rule-neutral", "rule-neutral-reduplication"]},
    {"id": "w-ba", "hanzi": "爸爸", "pinyin": "bàba", "tone": 4, "meaning": "아버지", "rules": ["rule-neutral", "rule-neutral-reduplication"]},
    {"id": "w-baba", "hanzi": "爸爸", "pinyin": "bàba", "tone": 4, "meaning": "아버지", "rules": ["rule-neutral", "rule-neutral-reduplication"]},
    {"id": "w-ma", "hanzi": "妈妈", "pinyin": "māma", "tone": 1, "meaning": "어머니", "rules": ["rule-neutral", "rule-neutral-reduplication"]},
    {"id": "w-mama", "hanzi": "妈妈", "pinyin": "māma", "tone": 1, "meaning": "어머니", "rules": ["rule-neutral", "rule-neutral-reduplication"]},
]

# 3. Vector Store용 HSK 1급 표준 참고 예문
SENTENCES_SEED = [
    {"id": "s-1", "hanzi": "你好", "pinyin": "nǐ hǎo", "translation": "안녕하세요.", "level": 1},
    {"id": "s-2", "hanzi": "我是学生", "pinyin": "wǒ shì xuésheng", "translation": "저는 학생입니다.", "level": 1},
    {"id": "s-3", "hanzi": "不好", "pinyin": "bù hǎo", "translation": "좋지 않습니다.", "level": 1},
    {"id": "s-4", "hanzi": "不是", "pinyin": "bú shì", "translation": "아닙니다.", "level": 1},
    {"id": "s-5", "hanzi": "我有一个问题", "pinyin": "wǒ yǒu yí gè wèntí", "translation": "질문이 하나 있습니다.", "level": 1},
    {"id": "s-6", "hanzi": "谢谢你", "pinyin": "xièxie nǐ", "translation": "고맙습니다.", "level": 1},
    {"id": "s-7", "hanzi": "不客气", "pinyin": "bú kèqi", "translation": "천만에요.", "level": 1},
    {"id": "s-8", "hanzi": "你去哪里", "pinyin": "nǐ qù nǎli", "translation": "당신은 어디에 가나요?", "level": 1},
    {"id": "s-9", "hanzi": "我喝茶", "pinyin": "wǒ hē chá", "translation": "저는 차를 마십니다.", "level": 1},
    {"id": "s-10", "hanzi": "他看书", "pinyin": "tā kàn shū", "translation": "그는 책을 봅니다.", "level": 1},
]

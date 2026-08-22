from typing import Dict, List, Any

# 1. HSK 1급 성조 변조(Sandhi) 및 발음 핵심 규칙
TONE_RULES_SEED = [
    {
        "id": "rule-33",
        "name": "3성 + 3성 변조",
        "description": "3성 음절이 연속해서 올 경우, 앞의 3성은 2성으로 올려서 발음합니다. (예: 你(nǐ) + 好(hǎo) -> ní hǎo)"
    },
    {
        "id": "rule-bu",
        "name": "'不(bù)' 성조 변조",
        "description": "'不' 뒤에 4성 음절이 오면 '不'는 2성(bú)으로 변하여 발음합니다. (예: 不(bù) + 是(shì) -> bú shì)"
    },
    {
        "id": "rule-yi",
        "name": "'一(yī)' 성조 변조",
        "description": "'一' 뒤에 4성이 오면 2성(yí)으로, 1/2/3성이 오면 4성(yì)으로 발음합니다. (예: 一个 yí gè, 一起 yì qǐ)"
    },
    {
        "id": "rule-neutral",
        "name": "경성(Neutral Tone) 규칙",
        "description": "중복어 및 어미/조사는 원 성조를 잃고 짧고 가볍게 발음합니다. (예: 爸爸 bàba, 谢谢 xièxie)"
    }
]

# 2. HSK 1급 대표 필수 단어
WORDS_SEED = [
    # 인칭 및 인사
    {"id": "w-ni", "hanzi": "你", "pinyin": "nǐ", "tone": 3, "meaning": "너, 당신", "rules": ["rule-33"]},
    {"id": "w-hao", "hanzi": "好", "pinyin": "hǎo", "tone": 3, "meaning": "좋다, 안녕하다", "rules": ["rule-33"]},
    {"id": "w-wo", "hanzi": "我", "pinyin": "wǒ", "tone": 3, "meaning": "나", "rules": []},
    {"id": "w-ta-m", "hanzi": "他", "pinyin": "tā", "tone": 1, "meaning": "그", "rules": []},
    {"id": "w-ta-f", "hanzi": "她", "pinyin": "tā", "tone": 1, "meaning": "그녀", "rules": []},
    
    # 부정 / 동사
    {"id": "w-bu", "hanzi": "不", "pinyin": "bù", "tone": 4, "meaning": "아니다, ~않다", "rules": ["rule-bu"]},
    {"id": "w-shi", "hanzi": "是", "pinyin": "shì", "tone": 4, "meaning": "~이다", "rules": ["rule-bu"]},
    {"id": "w-you", "hanzi": "有", "pinyin": "yǒu", "tone": 3, "meaning": "있다, 소유하다", "rules": []},
    {"id": "w-kan", "hanzi": "看", "pinyin": "kàn", "tone": 4, "meaning": "보다", "rules": []},
    {"id": "w-chi", "hanzi": "吃", "pinyin": "chī", "tone": 1, "meaning": "먹다", "rules": []},
    {"id": "w-he", "hanzi": "喝", "pinyin": "hē", "tone": 1, "meaning": "마시다", "rules": []},
    {"id": "w-qu", "hanzi": "去", "pinyin": "qù", "tone": 4, "meaning": "가다", "rules": []},
    {"id": "w-lai", "hanzi": "来", "pinyin": "lái", "tone": 2, "meaning": "오다", "rules": []},
    
    # 숫자 및 수량
    {"id": "w-yi", "hanzi": "一", "pinyin": "yī", "tone": 1, "meaning": "하나, 1", "rules": ["rule-yi"]},
    {"id": "w-ge", "hanzi": "个", "pinyin": "gè", "tone": 4, "meaning": "개, 명(양사)", "rules": ["rule-yi"]},
    {"id": "w-er", "hanzi": "二", "pinyin": "èr", "tone": 4, "meaning": "둘, 2", "rules": []},
    {"id": "w-san", "hanzi": "三", "pinyin": "sān", "tone": 1, "meaning": "셋, 3", "rules": []},
    
    # 감탄 / 가족
    {"id": "w-xie", "hanzi": "谢谢", "pinyin": "xièxie", "tone": 4, "meaning": "감사하다", "rules": ["rule-neutral"]},
    {"id": "w-ba", "hanzi": "爸爸", "pinyin": "bàba", "tone": 4, "meaning": "아버지", "rules": ["rule-neutral"]},
    {"id": "w-ma", "hanzi": "妈妈", "pinyin": "māma", "tone": 1, "meaning": "어머니", "rules": ["rule-neutral"]},
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

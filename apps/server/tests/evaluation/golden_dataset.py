from typing import Dict, List, Any

GOLDEN_EVAL_DATASET: List[Dict[str, Any]] = [
    {
        "id": "gold-sandhi-01",
        "category": "tone_sandhi_33",
        "query": "你好(nǐ hǎo)에서 你의 성조는 왜 2성으로 소리 지나요?",
        "context_keywords": ["3성 변조", "3성+3성", "2성+3성"],
        "expected_word_ids": ["w-ni", "w-hao"],
        "expected_rule_ids": ["rule-sandhi-33"],
        "ground_truth": {
            "target_pinyin": "ní hǎo",
            "modified_syllable": "你 (nǐ -> ní)",
            "rule_description": "3성 음절 두 개가 연속으로 올 때 앞의 3성 음절은 2성으로 변조됩니다."
        }
    }, 
    {
        "id": "gold-sandhi-02",
        "category": "tone_sandhi_333",
        "query": "我很好(wǒ hěn hǎo)처럼 3성이 3개 연속으로 나올 때는 성조를 어떻게 읽어야 하나요?",
        "context_keywords": ["3성 연속", "구조 분할", "2성+2성+3성", "3성+2성+3성"],
        "expected_word_ids": ["w-wo", "w-hen", "w-hao"],
        "expected_rule_ids": ["rule-sandhi-333"],
        "ground_truth": {
            "target_pinyin": "wǒ hén hǎo / wó hén hǎo",
            "modified_syllable": "我/很",
            "rule_description": "의미 단위 구분에 따라 [wǒ + hén hǎo](2성+3성) 또는 [wó hén hǎo](2성+2성+3성) 둘 다 가능합니다."
        }
    },
    {
        "id": "gold-bu-01",
        "category": "tone_sandhi_bu_4th",
        "query": "不是(bú shì)에서 원래 4성인 不가 왜 2성으로 읽히나요?",
        "context_keywords": ["不 변조", "4성 앞 2성"],
        "expected_word_ids": ["w-bu", "w-shi"],
        "expected_rule_ids": ["rule-bu-4th"],
        "ground_truth": {
            "target_pinyin": "bú shì",
            "modified_syllable": "不 (bù -> bú)",
            "rule_description": "'不(bù)' 뒤에 4성 음절이 오면 '不'는 2성(bú)으로 변조됩니다."
        }
    },
    {
        "id": "gold-bu-02",
        "category": "tone_sandhi_bu_neutral",
        "query": "是不是, 好不好 같은 가능보수/선택의문문에서 가운데 不의 성조는 어떻게 읽나요?",
        "context_keywords": ["중간 不", "경성 처리"],
        "expected_word_ids": ["w-shi", "w-bu", "w-hao"],
        "expected_rule_ids": ["rule-bu-neutral"],
        "ground_truth": {
            "target_pinyin": "shì bu shì / hǎo bu hǎo",
            "modified_syllable": "不 (bù -> bu)",
            "rule_description": "동사/형용사 사이에서 구문상 끼어드는 '不'는 성조를 잃고 경성(bu)으로 약하게 읽습니다."
        }
    },
    {
        "id": "gold-yi-01",
        "category": "tone_sandhi_yi_4th",
        "query": "一个(yí gè)에서 一의 원래 성조는 1성(yī)인데 왜 2성으로 읽나요?",
        "context_keywords": ["一 변조", "4성 앞 2성"],
        "expected_word_ids": ["w-yi", "w-ge"],
        "expected_rule_ids": ["rule-yi-4th"],
        "ground_truth": {
            "target_pinyin": "yí gè",
            "modified_syllable": "一 (yī -> yí)",
            "rule_description": "'一(yī)' 뒤에 4성 음절이 오면 '一'는 2성(yí)으로 변조됩니다."
        }
    },
    {
        "id": "gold-yi-02",
        "category": "tone_sandhi_yi_123",
        "query": "一天(yì tiān), 一年(yì nián), 一起(yì qǐ)에서 一는 왜 4성으로 소리 나나요?",
        "context_keywords": ["一 변조", "1/2/3성 앞 4성"],
        "expected_word_ids": ["w-yi", "w-tian", "w-nian", "w-qi"],
        "expected_rule_ids": ["rule-yi-123"],
        "ground_truth": {
            "target_pinyin": "yì tiān / yì nián / yì qǐ",
            "modified_syllable": "一 (yī -> yì)",
            "rule_description": "'一(yī)' 뒤에 1성, 2성, 3성 음절이 오면 '一'는 4성(yì)으로 변조됩니다."
        }
    },
    {
        "id": "gold-poly-01",
        "category": "polyphonic_zhe_zhao",
        "query": "看着(kànzhe)의 着와 睡着了(shuìzháole)의 着는 발음과 성조가 어떻게 다른가요?",
        "context_keywords": ["다음자", "着 발음 구분", "지속보어 zhe", "결과보어 zháo"],
        "expected_word_ids": ["w-kanzhe", "w-shuizhao"],
        "expected_rule_ids": ["rule-poly-zhe"],
        "ground_truth": {
            "target_pinyin": "kàn zhe / shuì zháo le",
            "modified_syllable": "着 (zhe vs zháo)",
            "rule_description": "동작의 지속을 나타낼 때는 경성 'zhe'로, 목적 달성/목표 도달의 결과보어로 쓰일 때는 2성 'zháo'로 읽습니다."
        }
    },
    {
        "id": "gold-poly-02",
        "category": "polyphonic_huan_hai",
        "query": "还有(hái yǒu)의 还와 还钱(huán qián)의 还의 발음 차이를 알려주세요.",
        "context_keywords": ["다음자", "부사 hái", "동사 huán"],
        "expected_word_ids": ["w-hai", "w-huan"],
        "expected_rule_ids": ["rule-poly-hai-huan"],
        "ground_truth": {
            "target_pinyin": "hái yǒu / huán qián",
            "modified_syllable": "还 (hái vs huán)",
            "rule_description": "'또, 아직'의 의미를 가지는 부사일 때는 'hái', '돌려주다'의 의미를 가지는 동사일 때는 'huán'으로 읽습니다."
        }
    },
    {
        "id": "gold-neutral-01",
        "category": "neutral_tone_family",
        "query": "爸爸(bàba), 妈妈(māma)에서 뒤 쪽 한자는 왜 성조 표시가 없나요?",
        "context_keywords": ["경성", "친족 호칭 첩어"],
        "expected_word_ids": ["w-baba", "w-mama"],
        "expected_rule_ids": ["rule-neutral-reduplication"],
        "ground_truth": {
            "target_pinyin": "bà ba / mā ma",
            "modified_syllable": "두 번째 음절 (경성)",
            "rule_description": "친족 호칭을 나타내는 중복 단어(첩어)의 두 번째 음절은 성조를 약하고 짧게 읽는 경성(轻声)으로 처리합니다."
        }
    },
    {
        "id": "gold-exception-01",
        "category": "exception_ordinal_numbers",
        "query": "第一(dì-yī)이나 十一(shíyī)에서 一는 왜 변조되지 않고 1성(yī) 그대로 읽히나요?",
        "context_keywords": ["서수 第一", "기수 기수변조 예외"],
        "expected_word_ids": ["w-diyi", "w-shiyi"],
        "expected_rule_ids": ["rule-exception-ordinal"],
        "ground_truth": {
            "target_pinyin": "dì yī / shí yī",
            "modified_syllable": "一 (yī 유지)",
            "rule_description": "서수(첫째 등)를 나타내는 '第' 뒤에 오거나 숫자 자체를 단독/순서대로 읽을 때는 '一'의 성조 변조 규칙이 적용되지 않고 본래 성조(1성 yī)를 유지합니다."
        }
    }
]

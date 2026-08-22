import json
import pytest
from tests.evaluation.golden_dataset import GOLDEN_EVAL_DATASET
from app.rag.dependencies import get_rag_engine
from app.core.llm import get_llm, build_chinese_few_shot_prompt, generate_structured_json

@pytest.mark.asyncio
async def test_golden_dataset_rag_and_llm_precision():
    rag_engine = get_rag_engine()
    llm = get_llm(model_name="qwen2.5")

    total_cases = len(GOLDEN_EVAL_DATASET)
    passed_retrieval = 0
    passed_pinyin_accuracy = 0
    passed_rule_match = 0

    print("\n================ [ Golden Dataset Benchmark Started ] ================")

    for item in GOLDEN_EVAL_DATASET:
        # 1. RAG Retrieval 검증
        retrieved = rag_engine.retrieve(query=item["query"], top_k=3)
        retrieved_rule_ids = [r["id"] for r in retrieved.get("rules", [])]
        
        # Expected Rule ID 포함 여부 확인
        rule_hit = any(expected_id in retrieved_rule_ids for expected_id in item["expected_rule_ids"])
        if rule_hit:
            passed_retrieval += 1

        # 2. LLM 응답 생성 및 구조화 검증
        prompt = build_chinese_few_shot_prompt(
            query=item["query"],
            context=retrieved.get("rules", [])
        )

        response_json = await generate_structured_json(llm, prompt)

        # 3. Pinyin 표기 및 정답 Ground Truth와 비교 검증
        gt = item["ground_truth"]
        
        # Pinyin 정확도 측정 (핵심 키워드 포함 검증)
        target_pinyin_cleaned = response_json.get("target_pinyin", "").replace(" ", "").lower()
        gt_pinyin_cleaned = gt["target_pinyin"].replace(" ", "").lower()

        if any(p in target_pinyin_cleaned for p in gt_pinyin_cleaned.split('/')):
            passed_pinyin_accuracy += 1

        # 규칙 설명의 타당성 검증 (핵심 메타 키워드 확인)
        rule_desc = response_json.get("rule_description", "")
        if any(kw in rule_desc for kw in item["context_keywords"]):
            passed_rule_match += 1

    # 지표 산출
    retrieval_rate = (passed_retrieval / total_cases) * 100
    pinyin_accuracy_rate = (passed_pinyin_accuracy / total_cases) * 100
    rule_match_rate = (passed_rule_match / total_cases) * 100

    print("\n[ Golden Benchmark Summary ]")
    print(f" - Rule Retrieval Hit Rate: {retrieval_rate:.1f}%")
    print(f" - Pinyin Accuracy Rate: {pinyin_accuracy_rate:.1f}%")
    print(f" - Rule Explanation Precision: {rule_match_rate:.1f}%")

    # 통과 임계치 설정 (중국어 학습 도메인 최소 기준 90%)
    assert retrieval_rate >= 90.0, f"Retrieval 성능 미달: {retrieval_rate}%"
    assert pinyin_accuracy_rate >= 90.0, f"성조/핀인 정확도 미달: {pinyin_accuracy_rate}%"
    assert rule_match_rate >= 80.0, f"규칙 설명 정확도 미달: {rule_match_rate}%"

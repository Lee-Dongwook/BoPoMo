import pytest
from tests.evaluation.eval_dataset import EVAL_DATASET
from tests.evaluation.eval_runner import RAGAndLLMEvaluator


@pytest.mark.asyncio
async def test_rag_and_llm_json_parsing_benchmark():
    evaluator = RAGAndLLMEvaluator()

    total_items = len(EVAL_DATASET)
    successful_json_parses = 0
    total_word_recall = 0.0
    total_rule_recall = 0.0

    for item in EVAL_DATASET:
        # 1. RAG Retrieval 검증
        retrieval_res = evaluator.evaluate_retrieval(item)
        total_word_recall += retrieval_res["word_recall"]
        total_rule_recall += retrieval_res["rule_recall"]

        # 2. 로컬 LLM JSON 출력 파싱 검증
        json_valid = await evaluator.evaluate_json_parsing(
            query=item["query"],
            context=retrieval_res["context"],
            expected_keys=item["expected_json_keys"]
        )
        if json_valid:
            successful_json_parses += 1

    avg_word_recall = total_word_recall / total_items
    avg_rule_recall = total_rule_recall / total_items
    json_success_rate = (successful_json_parses / total_items) * 100

    print(f"\n[Benchmark Summary]")
    print(f" - Word Retrieval Recall: {avg_word_recall * 100:.1f}%")
    print(f" - Rule Retrieval Recall: {avg_rule_recall * 100:.1f}%")
    print(f" - LLM JSON Parsing Success Rate: {json_success_rate:.1f}%")

    # 통과 기준 설정
    assert avg_word_recall >= 0.80, "Word Retrieval Recall이 기준치(80%) 미달입니다."
    assert avg_rule_recall >= 1.00, "Rule Retrieval Recall이 기준치(100%) 미달입니다."
    assert json_success_rate >= 80.0, "JSON 파싱 성공률이 기준치(80%) 미달입니다."

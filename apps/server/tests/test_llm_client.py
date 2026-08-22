import pytest
from unittest.mock import AsyncMock, MagicMock
from app.core.llm import generate_structured_json


@pytest.mark.asyncio
async def test_generate_structured_json_with_mock_llm():
    mock_llm = MagicMock()
    # LLM이 마크다운 문자열 형태로 반환하는 상황 모사
    mock_llm.ainvoke = AsyncMock(return_value=MagicMock(
        content='```json\n{"feedback": "Pass", "phonetics": "nǐ hǎo", "rules": ["rule-33"]}\n```'
    ))

    result = await generate_structured_json(mock_llm, "test prompt")

    assert result["feedback"] == "Pass"
    assert result["rules"] == ["rule-33"]

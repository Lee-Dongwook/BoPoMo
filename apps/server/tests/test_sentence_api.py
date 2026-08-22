import pytest
from unittest.mock import AsyncMock, patch
from app.schemas.sentence import GeneratedSentenceResponse

@pytest.mark.asyncio
@patch("app.api.v1.endpoints.sentence.app_graph.ainvoke")
async def test_generate_sentence_endpoint(mock_ainvoke, async_client):
    mock_ainvoke.return_value = {
        "generated_sentence": GeneratedSentenceResponse(
            hanzi="妈妈好",
            pinyin="mā ma hǎo",
            translation="엄마 안녕하세요",
            explanation="1성(mā)과 3성(hǎo) 발음 연습 문장입니다."
        )
    }

    payload = {
        "user_id": "test-user-123",
        "target_words": [
            {"pinyin": "mā", "meaning": "엄마", "tone": 1}
        ]
    }

    response = await async_client.post("/api/v1/sentence/generate", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["hanzi"] == "妈妈好"
    assert data["pinyin"] == "mā ma hǎo"
    assert data["translation"] == "엄마 안녕하세요"

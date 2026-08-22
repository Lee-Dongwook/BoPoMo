import pytest
from unittest.mock import MagicMock, patch


@pytest.mark.asyncio
@patch("app.api.v1.endpoints.words.get_supabase_client")
async def test_get_due_words_endpoint(mock_get_supabase, async_client):
    mock_supabase = MagicMock()
    mock_get_supabase.return_value = mock_supabase

    # Supabase Join 쿼리 응답 Mocking
    mock_supabase.table().select().eq().lte().order().limit().execute.return_value = MagicMock(
        data=[
            {
                "word_id": "w-ni",
                "interval_days": 1,
                "words": {
                    "hanzi": "你",
                    "pinyin": "nǐ",
                    "meaning": "너",
                    "tone": 3
                }
            },
            {
                "word_id": "w-hao",
                "interval_days": 6,
                "words": {
                    "hanzi": "好",
                    "pinyin": "hǎo",
                    "meaning": "좋다",
                    "tone": 3
                }
            }
        ]
    )

    response = await async_client.get("/api/v1/words/due/test-user-123?limit=2")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["word_id"] == "w-ni"
    assert data[0]["hanzi"] == "你"
    assert data[0]["tone"] == 3
    assert data[1]["word_id"] == "w-hao"

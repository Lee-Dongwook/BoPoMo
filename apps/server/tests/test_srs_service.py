import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime
from app.services.srs_service import SRSService


@pytest.mark.asyncio
@patch("app.services.srs_service.get_supabase_client")
async def test_record_quiz_result_correct_response(mock_get_supabase):
    # Mock Supabase Client 설정
    mock_supabase = MagicMock()
    mock_get_supabase.return_value = mock_supabase

    # 1. quiz_logs insert mock
    mock_supabase.table().insert().execute.return_value = MagicMock(data=[{}])

    # 2. user_srs_states select mock (기존 데이터 존재)
    mock_supabase.table().select().eq().eq().maybe_single().execute.return_value = MagicMock(
        data={
            "interval_days": 1,
            "ease_factor": 2.50,
            "review_count": 0
        }
    )

    # 3. user_srs_states upsert mock
    mock_supabase.table().upsert().execute.return_value = MagicMock(
        data=[{
            "user_id": "test-user-id",
            "word_id": "w-1",
            "interval_days": 1,
            "ease_factor": 2.60,
            "review_count": 1
        }]
    )

    result = await SRSService.record_quiz_result(
        user_id="test-user-id",
        word_id="w-1",
        quiz_type="TONE_MATCH",
        is_correct=True,
        response_time_ms=1500  # < 2000ms (응답 보상 대상)
    )

    assert result[0]["ease_factor"] == 2.60
    assert result[0]["review_count"] == 1
    mock_supabase.table().insert.assert_called()
    mock_supabase.table().upsert.assert_called()


@pytest.mark.asyncio
@patch("app.services.srs_service.get_supabase_client")
async def test_record_quiz_result_wrong_response(mock_get_supabase):
    mock_supabase = MagicMock()
    mock_get_supabase.return_value = mock_supabase

    mock_supabase.table().insert().execute.return_value = MagicMock(data=[{}])
    mock_supabase.table().select().eq().eq().maybe_single().execute.return_value = MagicMock(
        data={
            "interval_days": 6,
            "ease_factor": 2.50,
            "review_count": 2
        }
    )
    mock_supabase.table().upsert().execute.return_value = MagicMock(
        data=[{
            "user_id": "test-user-id",
            "word_id": "w-1",
            "interval_days": 1,
            "ease_factor": 2.30,
            "review_count": 0
        }]
    )

    result = await SRSService.record_quiz_result(
        user_id="test-user-id",
        word_id="w-1",
        quiz_type="TONE_MATCH",
        is_correct=False,
        response_time_ms=3000
    )

    # 오답 시 interval_days = 1, review_count = 0, ease_factor 0.20 차감 확인
    assert result[0]["interval_days"] == 1
    assert result[0]["review_count"] == 0
    assert result[0]["ease_factor"] == 2.30

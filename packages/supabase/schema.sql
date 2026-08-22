-- 1. Enum 타입 정의
CREATE TYPE quiz_type AS ENUM ('TONE_MATCH', 'MEANING_MATCH', 'AUDIO_PITCH');

-- 2. 단어 테이블 (Words)
CREATE TABLE IF NOT EXISTS words (
    id VARCHAR(50) PRIMARY KEY,
    hanzi VARCHAR(20) NOT NULL,
    pinyin VARCHAR(50) NOT NULL,
    pinyin_numeric VARCHAR(50) NOT NULL,
    meaning TEXT NOT NULL,
    tone SMALLINT NOT NULL CHECK (tone BETWEEN 1 AND 5),
    level SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 사용자 SRS 학습 상태 테이블 (User SRS States)
-- SuperMemo-2 / Leitner 기반 복습 간격 및 이지 팩터 추적
CREATE TABLE IF NOT EXISTS user_srs_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    word_id VARCHAR(50) NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    interval_days INT NOT NULL DEFAULT 1,
    ease_factor NUMERIC(3, 2) NOT NULL DEFAULT 2.50,
    review_count INT NOT NULL DEFAULT 0,
    next_review_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_reviewed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, word_id)
);

-- 4. 퀴즈 로그 및 학습 이력 (Quiz Logs)
CREATE TABLE IF NOT EXISTS quiz_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    word_id VARCHAR(50) NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    quiz_type quiz_type NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time_ms INT,
    audio_score NUMERIC(5, 2), -- 음성 평가 시 피치 일치 점수 (0~100)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 설정 (조회 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_srs_user_next_review ON user_srs_states(user_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_quiz_logs_user_word ON quiz_logs(user_id, word_id);

# BoPoMo

중국어 병음과 보포모포(注音符號)를 처음 배우는 학습자를 위한 모바일 학습 앱 프로젝트입니다.

## 문서 목차

- [프로젝트 개요](#프로젝트-개요)
- [현재 구축된 내용](#현재-구축된-내용)
- [프로젝트 구조](#프로젝트-구조)
- [실행 방법](#실행-방법)
- [다음 작업](#다음-작업)

## 프로젝트 개요

| 항목        | 내용                                             |
| ----------- | ------------------------------------------------ |
| 대상 사용자 | 중국어 발음을 처음 배우는 학습자                 |
| 핵심 경험   | 보포모포 기호를 카드로 학습하고 진행 상황을 기록 |
| 클라이언트  | React Native 모바일 앱                           |
| 공용 로직   | TypeScript (`@bopomo/core`)                      |
| 서버        | FastAPI + LangGraph                              |
| 현재 단계   | 모바일 학습 MVP 및 AI 서버 골격                  |

## 현재 구축된 내용

- **모바일 앱**: React Native 기반의 보포모포 입문 학습 화면
  - 자음 기호, 발음, 예시 단어 카드 제공
  - 이전/다음 이동 및 학습 완료 처리
  - 학습 완료 현황을 기기에 저장(MMKV)
- **공용 학습 로직**: TypeScript 패키지로 구성
  - 병음 유틸리티, SRS(반복 학습), 퀴즈 엔진, 학습 단어 상수
  - Vitest 단위 테스트 포함
- **AI 서버 골격**: FastAPI + LangGraph 기반
  - 상태 확인 API: `GET /health`
  - 목표 단어를 바탕으로 예문을 생성하는 LangGraph 에이전트 구조
  - 예문 생성 API 및 테스트 코드 작성 단계

## 프로젝트 구조

```text
apps/
  mobile/       React Native 학습 앱
  server/       FastAPI / LangGraph AI 서버
packages/
  core/         병음·퀴즈·반복 학습 공용 로직
```

### 주요 디렉터리

- `apps/mobile/src/App.tsx`: 현재 모바일 MVP 화면과 학습 진행 상태
- `apps/server/app/main.py`: FastAPI 앱 및 헬스 체크
- `apps/server/app/agents/`: 문장 생성·피드백 LangGraph 에이전트
- `apps/server/app/api/`: 버전별 API 엔드포인트
- `packages/core/src/quiz/`: 퀴즈 타입과 출제 엔진
- `packages/core/src/srs/`: 반복 학습(Spaced Repetition) 로직

## 실행 방법

### 모바일 앱

```bash
pnpm install
pnpm --filter @bopomo/mobile start
pnpm --filter @bopomo/mobile android
```

### AI 서버

```bash
cd apps/server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

서버 실행 후 `http://localhost:8000/health`에서 상태를 확인할 수 있습니다.

## 다음 작업

- 보포모포 전체 기호와 학습 콘텐츠 확장
- 모바일 앱과 AI 예문 생성 API 연결
- 생성 문장 피드백 및 퀴즈 화면 구현

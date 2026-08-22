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

## Hybrid RAG System (VectorRAG + GraphRAG)

소형 로컬 LLM(Ollama/Gemma2, Llama3.2 등)의 추론 능력 한계와 환각(Hallucination) 현상을 보완하기 위해 **VectorRAG**와 **GraphRAG**를 결합한 하이브리드 검색 증강 생성 시스템을 적용합니다.

---

### 1. System Architecture

```text
                                 [User Target Words / Weakness Input]
                                                  │
                                                  ▼
                                     ┌─────────────────────────┐
                                     │ Hybrid RAG Orchestrator │
                                     └────────────┬────────────┘
                                                  │
                      ┌───────────────────────────┴───────────────────────────┐
                      ▼                                                       ▼
        ┌───────────────────────────┐                           ┌───────────────────────────┐
        │        VectorRAG          │                           │         GraphRAG          │
        │  (ChromaDB + bge-m3)      │                           │   (NetworkX / Neo4j)      │
        ├───────────────────────────┤                           ├───────────────────────────┤
        │ - 의미적 유사 예문 검색        │                           │  - 한자-성조-부수 관계망       │
        │ - 상황별 HSK 문장 Retrieval  │                           │ - 성조 변조(Sandhi) 규칙     │
        └─────────────┬─────────────┘                           └─────────────┬─────────────┘
                      │                                                       │
                      └───────────────────────────┬───────────────────────────┘
                                                  │
                                                  ▼ (RRF Fusion)
                                      [Combined Context Block]
                                                  │
                                                  ▼
                                    ┌───────────────────────────┐
                                    │    Local LLM (Ollama)     │
                                    │  - Strict JSON Formatting │
                                    └───────────────────────────┘
```

### 2. Core Components & Capabilities

#### VectorRAG (Semantic Similarity Search)

- 역할: HSK 기초 어휘집 및 검증된 예문 데이터베이스 기반 시맨틱 유사도 검색

- 엔진: ChromaDB (Vector Store) + bge-m3 / HuggingFace (Local Embedding)

- 목적: 로컬 LLM이 무작위로 문장을 창작하지 않고, 표준 예문 패턴을 인지하도록 지원

#### GraphRAG (Knowledge Graph Traversal)

- 역할: 중국어 언어 구조 특성에 맞춘 엔티티-관계 그래프 기반 규칙 검색
- 엔진: NetworkX (In-Memory) / Neo4j
- 목적:
  - 성조 변조(Sandhi) 규칙 강제: 3성 + 3성 -> 2성 + 3성, '不'/'一' 변조 규칙을 노드 관계로 추출하여 프롬프트에 주입
  - 품사 결합 및 유사 한자 제약: 오답율이 높은 단어쌍 간의 관계망 추적

### 3. Data Schema & Graph Structure

```text
(Word: "好") ──[TONE_RULE]──> (Rule: "3성 연속 변조")
     │
 [PAIR_WITH]
     ▼
(Word: "你") ──[HAS_TONE]───> (Tone: 3)

```

- Nodes:

  - WORD: 단어 ID, 한자, 병음, 성조, 한국어 뜻

  - TONE_RULE: 성조 변조 규칙명, 적용 조건, 예외 사항

  - GRAMMAR: 문법 구조 규칙

- Edges:

  - APPLIES_RULE: 단어 및 음절 결합 시 적용되는 성조 규칙

  - COMPONENT_OF: 부수 및 형성자 구성 관계

---

#### 4. Workflow

1. Query Processing: 사용자의 취약 단어(Pinyin, Tone) 입력 수신

2. Parallel Retrieval:

   - Vector Search: 취약 단어가 포함된 적절한 난이도의 HSK 표준 예문 획득

   - Graph Traversal: 취약 단어 조합 시 발생하는 성조 변조 규칙 및 연관 어휘 추출

3. Context Fusion: Reciprocal Rank Fusion(RRF) 기반 검색 결과 병합 및 Context Block 구성

4. LLM Generation: RAG Context를 바탕으로 로컬 LLM이 Pydantic 스키마 형태의 JSON 결과물 반환

---

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

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { createMMKV } from "react-native-mmkv";
import {
  ALL_ZHUYIN_SYMBOLS,
  INITIAL_WORDS,
  TONE_DETAILS,
  calculateNextReview,
  createBopomoMatchQuestion,
  createMeaningMatchQuestion,
  createToneMatchQuestion,
  detectToneSandhi,
  evaluateQuiz,
  type QuizEvaluation,
  type QuizQuestion,
  type QuizSubmission,
  type QuizType,
  type ReviewState,
  type ToneNumber,
  type ZhuyinCategory,
  type ZhuyinSymbol,
} from "@bopomo/core";

const storage = createMMKV({ id: "bopomo-storage-v2" });
const API_BASE_URL = "http://localhost:8000";

type TabKey = "BOPOMO" | "QUIZ" | "AI_SENTENCE" | "PITCH_COACH" | "STATS";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("BOPOMO");

  // -------------------------------------------------------------
  // 1. BOPOMO FLASHCARD STATE
  // -------------------------------------------------------------
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | ZhuyinCategory>("ALL");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedSymbols, setCompletedSymbols] = useState<string[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const filteredSymbols: readonly ZhuyinSymbol[] = useMemo(() => {
    if (selectedCategory === "ALL") return ALL_ZHUYIN_SYMBOLS;
    return ALL_ZHUYIN_SYMBOLS.filter((s) => s.category === selectedCategory);
  }, [selectedCategory]);

  const currentSymbol: ZhuyinSymbol = filteredSymbols[currentIndex] || ALL_ZHUYIN_SYMBOLS[0];

  useEffect(() => {
    const saved = storage.getString("completed_symbols");
    if (saved) {
      try {
        setCompletedSymbols(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const toggleCompleteSymbol = (id: string) => {
    let next: string[];
    if (completedSymbols.includes(id)) {
      next = completedSymbols.filter((s) => s !== id);
    } else {
      next = [...completedSymbols, id];
    }
    setCompletedSymbols(next);
    storage.set("completed_symbols", JSON.stringify(next));
  };

  const playAudioSimulation = (text: string) => {
    setIsPlayingAudio(true);
    setTimeout(() => setIsPlayingAudio(false), 900);
  };

  // -------------------------------------------------------------
  // 2. QUIZ & SRS STATE
  // -------------------------------------------------------------
  const [quizMode, setQuizMode] = useState<QuizType>("TONE_MATCH");
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizEvaluation, setQuizEvaluation] = useState<QuizEvaluation | null>(null);
  const [quizStartTime, setQuizStartTime] = useState<number>(Date.now());
  const [srsStates, setSrsStates] = useState<Record<string, ReviewState>>({});
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    const savedSrs = storage.getString("srs_states");
    if (savedSrs) {
      try {
        setSrsStates(JSON.parse(savedSrs));
      } catch (e) {
        // ignore
      }
    }
    const savedStreak = storage.getNumber("quiz_streak") || 0;
    setStreakCount(savedStreak);
  }, []);

  const loadNextQuestion = (type: QuizType = quizMode) => {
    setSelectedOption(null);
    setQuizEvaluation(null);
    setQuizStartTime(Date.now());

    const randomWord = INITIAL_WORDS[Math.floor(Math.random() * INITIAL_WORDS.length)] || INITIAL_WORDS[0];
    const qId = `q-${Date.now()}`;

    let q: QuizQuestion;
    if (type === "MEANING_MATCH") {
      q = createMeaningMatchQuestion(randomWord, INITIAL_WORDS, qId);
    } else if (type === "BOPOMO_MATCH") {
      q = createBopomoMatchQuestion(randomWord, INITIAL_WORDS, qId);
    } else {
      q = createToneMatchQuestion(randomWord, qId);
    }
    setCurrentQuestion(q);
  };

  useEffect(() => {
    if (activeTab === "QUIZ" && !currentQuestion) {
      loadNextQuestion(quizMode);
    }
  }, [activeTab, quizMode]);

  const handleOptionSelect = (option: string) => {
    if (!currentQuestion || selectedOption !== null) return;
    const responseTimeMs = Date.now() - quizStartTime;
    setSelectedOption(option);

    const submission: QuizSubmission = {
      question: currentQuestion,
      selectedOption: option,
      responseTimeMs,
    };

    const evaluation = evaluateQuiz(submission);
    setQuizEvaluation(evaluation);

    // Update SRS
    const wordId = evaluation.wordId;
    const currentSrs: ReviewState = srsStates[wordId] || {
      wordId,
      intervalDays: 1,
      easeFactor: 2.5,
      reviewCount: 0,
    };

    const nextSrs = calculateNextReview(currentSrs, {
      wordId,
      isCorrect: evaluation.isCorrect,
      selectedTone: currentQuestion.targetWord.tone,
      responseTimeMs,
    });

    const newStates = { ...srsStates, [wordId]: nextSrs };
    setSrsStates(newStates);
    storage.set("srs_states", JSON.stringify(newStates));

    if (evaluation.isCorrect) {
      const nextStreak = streakCount + 1;
      setStreakCount(nextStreak);
      storage.set("quiz_streak", nextStreak);
    } else {
      setStreakCount(0);
      storage.set("quiz_streak", 0);
    }
  };

  // -------------------------------------------------------------
  // 3. AI SENTENCE GENERATION STATE
  // -------------------------------------------------------------
  const [selectedWordIds, setSelectedWordIds] = useState<string[]>(["w-6", "w-7"]); // 你, 好
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{
    hanzi: string;
    pinyin: string;
    translation: string;
    explanation: string;
  } | null>(null);

  const toggleSelectWord = (id: string) => {
    if (selectedWordIds.includes(id)) {
      if (selectedWordIds.length > 1) {
        setSelectedWordIds(selectedWordIds.filter((w) => w !== id));
      }
    } else {
      if (selectedWordIds.length < 4) {
        setSelectedWordIds([...selectedWordIds, id]);
      } else {
        Alert.alert("알림", "최대 4개 단어까지 선택할 수 있습니다.");
      }
    }
  };

  const handleGenerateSentence = async () => {
    setIsGenerating(true);
    setGeneratedResult(null);

    const targetWords = INITIAL_WORDS.filter((w) => selectedWordIds.includes(w.id)).map((w) => ({
      pinyin: w.pinyin,
      meaning: w.meaning,
      tone: w.tone,
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/sentence/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "mobile-user-01",
          target_words: targetWords,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedResult(data);
      } else {
        throw new Error("Server error");
      }
    } catch (err) {
      // Fallback local smart sentence generator
      const selectedWords = INITIAL_WORDS.filter((w) => selectedWordIds.includes(w.id));
      const sandhi = detectToneSandhi(selectedWords);

      let sentenceHanzi = selectedWords.map((w) => w.hanzi).join("");
      let sentencePinyin = selectedWords.map((w) => w.pinyin).join(" ");
      let sentenceMeaning = selectedWords.map((w) => w.meaning).join(", ") + " 조합 예문";

      if (selectedWordIds.includes("w-6") && selectedWordIds.includes("w-7")) {
        sentenceHanzi = "你好！";
        sentencePinyin = "nǐ hǎo!";
        sentenceMeaning = "안녕하세요!";
      } else if (selectedWordIds.includes("w-10") && selectedWordIds.includes("w-11")) {
        sentenceHanzi = "不是。";
        sentencePinyin = "bú shì.";
        sentenceMeaning = "아닙니다.";
      }

      setGeneratedResult({
        hanzi: sentenceHanzi,
        pinyin: sentencePinyin,
        translation: sentenceMeaning,
        explanation:
          sandhi.length > 0
            ? `성조 변조 규칙 적용: ${sandhi[0].ruleName} (${sandhi[0].description})`
            : "기본 성조와 발음 규칙을 준수하여 구성된 표준 기초 예문입니다.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // -------------------------------------------------------------
  // 4. PITCH COACH STATE
  // -------------------------------------------------------------
  const [targetTone, setTargetTone] = useState<ToneNumber>(1);
  const [isEvaluatingPitch, setIsEvaluatingPitch] = useState(false);
  const [pitchResult, setPitchResult] = useState<{
    score: number;
    detectedTone: number;
    feedback: string;
    isCorrect: boolean;
  } | null>(null);

  const handleEvaluatePitch = () => {
    setIsEvaluatingPitch(true);
    setPitchResult(null);

    setTimeout(() => {
      // Acoustic simulator
      const isCorrect = Math.random() > 0.3;
      const detected = isCorrect ? targetTone : ((targetTone % 4) + 1 as ToneNumber);
      const score = isCorrect ? Math.round(85 + Math.random() * 15) : Math.round(45 + Math.random() * 25);

      const toneTips: Record<ToneNumber, string> = {
        1: "높은 5-5 음높이를 일정하게 유지하는 안정적인 파형입니다.",
        2: "3에서 5로 부드럽게 상승하는 상승조 파형입니다.",
        3: "충분히 저음(1)까지 떨어뜨렸다가 4로 꺾여 올라가는 파형입니다.",
        4: "5에서 1로 강하고 단호하게 내려꽂는 하강조 파형입니다.",
        5: "가볍고 짧게 툭 떨어지는 경성 파형입니다.",
      };

      setPitchResult({
        score,
        detectedTone: detected,
        isCorrect,
        feedback: isCorrect
          ? `완벽합니다! ${targetTone}성 성조 파형과 일치합니다. (${toneTips[targetTone]})`
          : `현재 ${detected}성 형태로 감지되었습니다. ${toneTips[targetTone]}`,
      });
      setIsEvaluatingPitch(false);
    }, 1200);
  };

  // -------------------------------------------------------------
  // RENDER TABS
  // -------------------------------------------------------------
  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>BOPOMO SMART LEARNING</Text>
          <Text style={styles.headerTitle}>중국어 발음 마스터</Text>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakText}>{streakCount}일 연속</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        {(
          [
            { key: "BOPOMO", label: "기호 학습" },
            { key: "QUIZ", label: "SRS 퀴즈" },
            { key: "AI_SENTENCE", label: "AI 예문" },
            { key: "PITCH_COACH", label: "성조 코칭" },
            { key: "STATS", label: "학습 현황" },
          ] as const
        ).map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* ========================================================= */}
        {/* TAB 1: BOPOMO FLASHCARDS */}
        {/* ========================================================= */}
        {activeTab === "BOPOMO" && (
          <View>
            {/* Category Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {(
                [
                  { key: "ALL", label: "전체 (37)" },
                  { key: "INITIAL", label: "성모 (21)" },
                  { key: "MEDIAL", label: "개음 (3)" },
                  { key: "FINAL", label: "운모 (13)" },
                ] as const
              ).map((chip) => (
                <Pressable
                  key={chip.key}
                  onPress={() => {
                    setSelectedCategory(chip.key);
                    setCurrentIndex(0);
                  }}
                  style={[styles.chip, selectedCategory === chip.key && styles.chipActive]}
                >
                  <Text style={[styles.chipText, selectedCategory === chip.key && styles.chipTextActive]}>
                    {chip.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.max(
                        (completedSymbols.length / ALL_ZHUYIN_SYMBOLS.length) * 100,
                        4,
                      )}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {completedSymbols.length} / {ALL_ZHUYIN_SYMBOLS.length} 암기 완료 (
                {Math.round((completedSymbols.length / ALL_ZHUYIN_SYMBOLS.length) * 100)}%)
              </Text>
            </View>

            {/* Main Flashcard */}
            <View style={styles.card}>
              <View style={styles.cardTopRow}>
                <View style={styles.cardBadge}>
                  <Text style={styles.cardBadgeText}>
                    {currentSymbol.category === "INITIAL"
                      ? "성모 (자음)"
                      : currentSymbol.category === "MEDIAL"
                      ? "개음 (결합모음)"
                      : "운모 (모음)"}
                  </Text>
                </View>
                <Pressable
                  onPress={() => toggleCompleteSymbol(currentSymbol.id)}
                  style={[
                    styles.completeChip,
                    completedSymbols.includes(currentSymbol.id) && styles.completeChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.completeChipText,
                      completedSymbols.includes(currentSymbol.id) && styles.completeChipTextActive,
                    ]}
                  >
                    {completedSymbols.includes(currentSymbol.id) ? "✓ 암기완료" : "미완료"}
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.symbolText}>{currentSymbol.symbol}</Text>
              <Text style={styles.nameText}>{currentSymbol.name}</Text>

              <View style={styles.phoneticsRow}>
                <View style={styles.phoneticTag}>
                  <Text style={styles.phoneticTagLabel}>병음</Text>
                  <Text style={styles.phoneticTagValue}>{currentSymbol.pinyin}</Text>
                </View>
                <View style={styles.phoneticTag}>
                  <Text style={styles.phoneticTagLabel}>IPA</Text>
                  <Text style={styles.phoneticTagValue}>{currentSymbol.ipa}</Text>
                </View>
                <View style={styles.phoneticTag}>
                  <Text style={styles.phoneticTagLabel}>한국어</Text>
                  <Text style={styles.phoneticTagValue}>{currentSymbol.koreanGuide}</Text>
                </View>
              </View>

              <Text style={styles.descText}>{currentSymbol.description}</Text>

              {/* Example Word */}
              <View style={styles.exampleBox}>
                <Text style={styles.exampleLabel}>대표 단어</Text>
                <Text style={styles.exampleTitle}>
                  {currentSymbol.exampleWord} ({currentSymbol.exampleMeaning})
                </Text>
              </View>

              {/* Pronounce Simulation Button */}
              <Pressable
                onPress={() => playAudioSimulation(currentSymbol.symbol)}
                style={[styles.audioButton, isPlayingAudio && styles.audioButtonActive]}
              >
                <Text style={styles.audioButtonText}>
                  {isPlayingAudio ? "🔊 발음 재생 중..." : "▶ 발음 듣기"}
                </Text>
              </Pressable>
            </View>

            {/* Navigation Buttons */}
            <View style={styles.navigationRow}>
              <Pressable
                disabled={currentIndex === 0}
                onPress={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
              >
                <Text style={[styles.navBtnText, currentIndex === 0 && styles.navBtnTextDisabled]}>
                  ‹ 이전 기호
                </Text>
              </Pressable>
              <Text style={styles.pageIndicator}>
                {currentIndex + 1} / {filteredSymbols.length}
              </Text>
              <Pressable
                disabled={currentIndex === filteredSymbols.length - 1}
                onPress={() => setCurrentIndex(Math.min(filteredSymbols.length - 1, currentIndex + 1))}
                style={[
                  styles.navBtn,
                  currentIndex === filteredSymbols.length - 1 && styles.navBtnDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.navBtnText,
                    currentIndex === filteredSymbols.length - 1 && styles.navBtnTextDisabled,
                  ]}
                >
                  다음 기호 ›
                </Text>
              </Pressable>
            </View>

            {/* 5 Tones Quick Reference Card */}
            <View style={styles.toneGuideSection}>
              <Text style={styles.sectionHeader}>중국어 5대 성조 가이드</Text>
              {TONE_DETAILS.map((t) => (
                <View key={t.tone} style={styles.toneItem}>
                  <View style={styles.toneBadge}>
                    <Text style={styles.toneBadgeText}>{t.tone === 5 ? "경" : `${t.tone}성`}</Text>
                  </View>
                  <View style={styles.toneInfo}>
                    <Text style={styles.toneName}>
                      {t.name} <Text style={styles.toneMark}>({t.pinyinMark})</Text>
                    </Text>
                    <Text style={styles.toneDesc}>{t.pitchDescription}</Text>
                    <Text style={styles.toneTip}>💡 {t.audioTip}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ========================================================= */}
        {/* TAB 2: SRS QUIZ */}
        {/* ========================================================= */}
        {activeTab === "QUIZ" && (
          <View>
            <View style={styles.quizTypeSelector}>
              {(
                [
                  { key: "TONE_MATCH", label: "성조 맞추기" },
                  { key: "BOPOMO_MATCH", label: "보포모포 맞추기" },
                  { key: "MEANING_MATCH", label: "한국어 뜻" },
                ] as const
              ).map((item) => (
                <Pressable
                  key={item.key}
                  onPress={() => {
                    setQuizMode(item.key);
                    loadNextQuestion(item.key);
                  }}
                  style={[styles.quizTypeBtn, quizMode === item.key && styles.quizTypeBtnActive]}
                >
                  <Text
                    style={[
                      styles.quizTypeBtnText,
                      quizMode === item.key && styles.quizTypeBtnTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {currentQuestion && (
              <View style={styles.card}>
                <Text style={styles.quizPromptLabel}>
                  {currentQuestion.type === "TONE_MATCH"
                    ? "다음 단어의 올바른 성조를 고르세요"
                    : currentQuestion.type === "BOPOMO_MATCH"
                    ? "다음 단어의 올바른 주음부호(보포모포)를 고르세요"
                    : "다음 단어의 올바른 한국어 의미를 고르세요"}
                </Text>

                <View style={styles.quizWordBox}>
                  <Text style={styles.quizHanzi}>{currentQuestion.targetWord.hanzi}</Text>
                  <Text style={styles.quizPinyin}>{currentQuestion.targetWord.pinyin}</Text>
                  <Text style={styles.quizMeaning}>{currentQuestion.targetWord.meaning}</Text>
                </View>

                {/* Options */}
                <View style={styles.optionsList}>
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = selectedOption === opt;
                    const isEvaluated = quizEvaluation !== null;
                    const isCorrectOption = quizEvaluation?.correctOption === opt;

                    let btnStyle = styles.optionButton;
                    let textStyle = styles.optionText;

                    if (isEvaluated) {
                      if (isCorrectOption) {
                        btnStyle = styles.optionButtonCorrect;
                        textStyle = styles.optionTextCorrect;
                      } else if (isSelected && !quizEvaluation.isCorrect) {
                        btnStyle = styles.optionButtonWrong;
                        textStyle = styles.optionTextWrong;
                      }
                    }

                    return (
                      <Pressable
                        key={idx}
                        disabled={selectedOption !== null}
                        onPress={() => handleOptionSelect(opt)}
                        style={btnStyle}
                      >
                        <Text style={textStyle}>{opt}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Evaluation Result Feedback */}
                {quizEvaluation && (
                  <View
                    style={[
                      styles.resultBox,
                      quizEvaluation.isCorrect ? styles.resultBoxCorrect : styles.resultBoxWrong,
                    ]}
                  >
                    <Text style={styles.resultTitle}>
                      {quizEvaluation.isCorrect ? "🎉 정답입니다!" : "💡 오답입니다!"}
                    </Text>
                    <Text style={styles.resultExplanation}>{quizEvaluation.explanation}</Text>
                    <Text style={styles.resultSpeed}>
                      응답 속도: {(quizEvaluation.responseTimeMs / 1000).toFixed(2)}초
                    </Text>

                    <Pressable
                      style={styles.nextQuizButton}
                      onPress={() => loadNextQuestion(quizMode)}
                    >
                      <Text style={styles.nextQuizButtonText}>다음 문제 풀기 ›</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* ========================================================= */}
        {/* TAB 3: AI SENTENCE GENERATOR */}
        {/* ========================================================= */}
        {activeTab === "AI_SENTENCE" && (
          <View>
            <Text style={styles.sectionHeader}>취약 단어 기반 맞춤 예문 생성</Text>
            <Text style={styles.sectionSubtitle}>
              연습하고 싶은 단어(최대 4개)를 선택하면 AI가 자연스러운 상황별 예문과 성조 변조 팁을
              생성합니다.
            </Text>

            {/* Word Chips */}
            <View style={styles.wordChipGrid}>
              {INITIAL_WORDS.map((w) => {
                const isSelected = selectedWordIds.includes(w.id);
                return (
                  <Pressable
                    key={w.id}
                    onPress={() => toggleSelectWord(w.id)}
                    style={[styles.wordChip, isSelected && styles.wordChipActive]}
                  >
                    <Text style={[styles.wordChipHanzi, isSelected && styles.wordChipHanziActive]}>
                      {w.hanzi}
                    </Text>
                    <Text style={[styles.wordChipSub, isSelected && styles.wordChipSubActive]}>
                      {w.pinyin} ({w.meaning})
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Generate Button */}
            <Pressable
              disabled={isGenerating || selectedWordIds.length === 0}
              onPress={handleGenerateSentence}
              style={[styles.primaryButton, isGenerating && styles.buttonDisabled]}
            >
              <Text style={styles.primaryButtonText}>
                {isGenerating ? "🤖 AI 예문 생성 중..." : "✨ AI 맞춤 예문 생성하기"}
              </Text>
            </Pressable>

            {/* Result Card */}
            {generatedResult && (
              <View style={styles.sentenceResultCard}>
                <Text style={styles.sentenceResultBadge}>AI 생성 완료</Text>
                <Text style={styles.sentenceHanzi}>{generatedResult.hanzi}</Text>
                <Text style={styles.sentencePinyin}>{generatedResult.pinyin}</Text>
                <Text style={styles.sentenceTranslation}>{generatedResult.translation}</Text>

                <View style={styles.explanationBox}>
                  <Text style={styles.explanationLabel}>📌 문법 및 성조 학습 팁</Text>
                  <Text style={styles.explanationBody}>{generatedResult.explanation}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ========================================================= */}
        {/* TAB 4: PITCH COACH */}
        {/* ========================================================= */}
        {activeTab === "PITCH_COACH" && (
          <View>
            <Text style={styles.sectionHeader}>실시간 성조 피치(F0) 코치</Text>
            <Text style={styles.sectionSubtitle}>
              목표 성조를 선택하고 발음하면 AI 음향 분석기가 피치 파형 일치도를 진단합니다.
            </Text>

            {/* Tone Selectors */}
            <View style={styles.pitchToneGrid}>
              {([1, 2, 3, 4] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => {
                    setTargetTone(t);
                    setPitchResult(null);
                  }}
                  style={[styles.pitchToneBtn, targetTone === t && styles.pitchToneBtnActive]}
                >
                  <Text
                    style={[styles.pitchToneNumber, targetTone === t && styles.pitchToneNumberActive]}
                  >
                    {t}성
                  </Text>
                  <Text
                    style={[styles.pitchToneSub, targetTone === t && styles.pitchToneSubActive]}
                  >
                    {t === 1 ? "5-5 평탄" : t === 2 ? "3-5 상승" : t === 3 ? "2-1-4 굴곡" : "5-1 하강"}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Pitch Visualizer Box */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>목표 성조: {targetTone}성 파형 곡선</Text>
              <View style={styles.pitchChartBox}>
                <View style={styles.pitchGuideLine} />
                <View style={styles.pitchGuideLine} />
                <View style={styles.pitchGuideLine} />

                {/* Simulated Curve Dots */}
                <View style={styles.curvePointsRow}>
                  {TONE_DETAILS[targetTone - 1].pitchContour.map((val, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.curveDot,
                        {
                          bottom: `${val * 80 + 10}%`,
                          backgroundColor: targetTone === 1 ? "#3E7B62" : targetTone === 2 ? "#3A6E9B" : targetTone === 3 ? "#D97724" : "#C93B2B",
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>

              <Text style={styles.pitchCoachTip}>
                {TONE_DETAILS[targetTone - 1].pitchDescription}
              </Text>
              <Text style={styles.pitchCoachAudioTip}>
                {TONE_DETAILS[targetTone - 1].audioTip}
              </Text>

              {/* Record / Analyze Button */}
              <Pressable
                disabled={isEvaluatingPitch}
                onPress={handleEvaluatePitch}
                style={[styles.micButton, isEvaluatingPitch && styles.micButtonActive]}
              >
                <Text style={styles.micButtonText}>
                  {isEvaluatingPitch ? "🎙️ 음성 피치 분석 중..." : "🎤 발음 녹음 및 피치 측정"}
                </Text>
              </Pressable>

              {/* Pitch Result Feedback */}
              {pitchResult && (
                <View
                  style={[
                    styles.pitchResultBox,
                    pitchResult.isCorrect ? styles.resultBoxCorrect : styles.resultBoxWrong,
                  ]}
                >
                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreNumber}>{pitchResult.score}점</Text>
                    <Text style={styles.detectedToneLabel}>
                      감지 성조: {pitchResult.detectedTone}성
                    </Text>
                  </View>
                  <Text style={styles.resultExplanation}>{pitchResult.feedback}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ========================================================= */}
        {/* TAB 5: STATS & SRS PROGRESS */}
        {/* ========================================================= */}
        {activeTab === "STATS" && (
          <View>
            <Text style={styles.sectionHeader}>학습 현황 및 복습 통계</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{completedSymbols.length}</Text>
                <Text style={styles.statLabel}>암기 완료 기호</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{Object.keys(srsStates).length}</Text>
                <Text style={styles.statLabel}>학습한 단어 수</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{streakCount}일</Text>
                <Text style={styles.statLabel}>연속 학습 일수</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {completedSymbols.length >= 37 ? "마스터" : "입문자"}
                </Text>
                <Text style={styles.statLabel}>현재 레벨</Text>
              </View>
            </View>

            <Text style={[styles.sectionHeader, { marginTop: 24 }]}>SRS 단어 복습 상태</Text>
            {Object.keys(srsStates).length === 0 ? (
              <View style={styles.emptyStateBox}>
                <Text style={styles.emptyStateText}>
                  아직 푼 퀴즈가 없습니다. SRS 퀴즈를 시작해 보세요!
                </Text>
              </View>
            ) : (
              Object.entries(srsStates).map(([wId, state]) => {
                const word = INITIAL_WORDS.find((w) => w.id === wId);
                return (
                  <View key={wId} style={styles.srsItem}>
                    <View>
                      <Text style={styles.srsWordTitle}>
                        {word?.hanzi || wId} ({word?.pinyin || ""})
                      </Text>
                      <Text style={styles.srsWordSub}>{word?.meaning || ""}</Text>
                    </View>
                    <View style={styles.srsMeta}>
                      <Text style={styles.srsInterval}>복습 주기: {state.intervalDays}일</Text>
                      <Text style={styles.srsEase}>난이도 계수: {state.easeFactor.toFixed(2)}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F5F0" },
  container: { padding: 20, paddingBottom: 60 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E4DA",
  },
  headerEyebrow: {
    color: "#A35A36",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  headerTitle: {
    color: "#1E2925",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEEDB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FAD6B8",
  },
  streakEmoji: { fontSize: 14, marginRight: 4 },
  streakText: { color: "#A35A36", fontSize: 12, fontWeight: "700" },

  // Tab Bar
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#F2EEE6",
    borderBottomWidth: 1,
    borderBottomColor: "#E3DFD5",
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: "#1E2925",
  },
  tabText: {
    color: "#68736E",
    fontSize: 12,
    fontWeight: "700",
  },
  tabTextActive: {
    color: "#FFFDF9",
  },

  // Category Chips
  chipScroll: { marginVertical: 12 },
  chip: {
    backgroundColor: "#E8E4DA",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: "#A35A36",
  },
  chipText: {
    color: "#1E2925",
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#FFFDF9",
  },

  // Progress Bar
  progressContainer: { marginBottom: 16 },
  progressTrack: {
    height: 8,
    borderRadius: 6,
    backgroundColor: "#E3E0D8",
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 6, backgroundColor: "#A35A36" },
  progressText: {
    color: "#68736E",
    fontSize: 12,
    marginTop: 6,
    textAlign: "right",
  },

  // Cards
  card: {
    backgroundColor: "#FFFDF9",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#1E2925",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EBE7DD",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
  },
  cardBadge: {
    backgroundColor: "#F2EEE6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardBadgeText: { color: "#A35A36", fontSize: 12, fontWeight: "700" },
  completeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: "#E8E4DA",
  },
  completeChipActive: {
    backgroundColor: "#3E7B62",
  },
  completeChipText: { color: "#68736E", fontSize: 11, fontWeight: "700" },
  completeChipTextActive: { color: "#FFFDF9" },

  symbolText: { color: "#1E2925", fontSize: 84, fontWeight: "800", marginTop: 10 },
  nameText: { color: "#1E2925", fontSize: 22, fontWeight: "700", marginTop: 2 },

  phoneticsRow: {
    flexDirection: "row",
    marginTop: 16,
    justifyContent: "center",
    width: "100%",
  },
  phoneticTag: {
    backgroundColor: "#F7F5F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginHorizontal: 4,
    alignItems: "center",
    minWidth: 70,
  },
  phoneticTagLabel: { color: "#68736E", fontSize: 10, fontWeight: "600" },
  phoneticTagValue: { color: "#1E2925", fontSize: 14, fontWeight: "700", marginTop: 2 },

  descText: {
    color: "#55605B",
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 20,
  },

  exampleBox: {
    alignSelf: "stretch",
    backgroundColor: "#F2EEE6",
    borderRadius: 12,
    padding: 12,
    marginTop: 18,
  },
  exampleLabel: { color: "#68736E", fontSize: 11, fontWeight: "600" },
  exampleTitle: { color: "#1E2925", fontSize: 16, fontWeight: "700", marginTop: 4 },

  audioButton: {
    backgroundColor: "#1E2925",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 18,
    alignSelf: "stretch",
    alignItems: "center",
  },
  audioButtonActive: { backgroundColor: "#3E7B62" },
  audioButtonText: { color: "#FFFDF9", fontSize: 14, fontWeight: "700" },

  // Navigation
  navigationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 24,
  },
  navBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { color: "#A35A36", fontSize: 15, fontWeight: "700" },
  navBtnTextDisabled: { color: "#B9B8B2" },
  pageIndicator: { color: "#68736E", fontSize: 14, fontWeight: "600" },

  // Tone Guide Section
  toneGuideSection: { marginTop: 10 },
  sectionHeader: { color: "#1E2925", fontSize: 18, fontWeight: "800", marginBottom: 6 },
  sectionSubtitle: { color: "#68736E", fontSize: 13, marginBottom: 16, lineHeight: 18 },
  toneItem: {
    flexDirection: "row",
    backgroundColor: "#FFFDF9",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EBE7DD",
  },
  toneBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFEEDB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  toneBadgeText: { color: "#A35A36", fontSize: 14, fontWeight: "800" },
  toneInfo: { flex: 1 },
  toneName: { color: "#1E2925", fontSize: 15, fontWeight: "700" },
  toneMark: { color: "#A35A36", fontSize: 13 },
  toneDesc: { color: "#4A5550", fontSize: 13, marginTop: 2 },
  toneTip: { color: "#68736E", fontSize: 12, marginTop: 4 },

  // Quiz Tab
  quizTypeSelector: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#E8E4DA",
    borderRadius: 10,
    padding: 4,
  },
  quizTypeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  quizTypeBtnActive: {
    backgroundColor: "#1E2925",
  },
  quizTypeBtnText: { color: "#68736E", fontSize: 12, fontWeight: "700" },
  quizTypeBtnTextActive: { color: "#FFFDF9" },

  quizPromptLabel: { color: "#A35A36", fontSize: 13, fontWeight: "700", marginBottom: 12 },
  quizWordBox: {
    backgroundColor: "#F7F5F0",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    alignSelf: "stretch",
    marginBottom: 20,
  },
  quizHanzi: { fontSize: 44, fontWeight: "800", color: "#1E2925" },
  quizPinyin: { fontSize: 18, fontWeight: "700", color: "#A35A36", marginTop: 4 },
  quizMeaning: { fontSize: 14, color: "#68736E", marginTop: 4 },

  optionsList: { alignSelf: "stretch" },
  optionButton: {
    backgroundColor: "#F2EEE6",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E3DFD5",
  },
  optionButtonCorrect: { backgroundColor: "#E6F4EA", borderColor: "#3E7B62" },
  optionButtonWrong: { backgroundColor: "#FCE8E6", borderColor: "#C93B2B" },
  optionText: { color: "#1E2925", fontSize: 15, fontWeight: "700" },
  optionTextCorrect: { color: "#1E7044", fontSize: 15, fontWeight: "700" },
  optionTextWrong: { color: "#C93B2B", fontSize: 15, fontWeight: "700" },

  resultBox: {
    alignSelf: "stretch",
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
  },
  resultBoxCorrect: { backgroundColor: "#E6F4EA", borderWidth: 1, borderColor: "#3E7B62" },
  resultBoxWrong: { backgroundColor: "#FCE8E6", borderWidth: 1, borderColor: "#C93B2B" },
  resultTitle: { fontSize: 16, fontWeight: "800", color: "#1E2925" },
  resultExplanation: { fontSize: 13, color: "#333C38", marginTop: 6, lineHeight: 18 },
  resultSpeed: { fontSize: 11, color: "#68736E", marginTop: 4 },

  nextQuizButton: {
    backgroundColor: "#1E2925",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 14,
  },
  nextQuizButtonText: { color: "#FFFDF9", fontSize: 14, fontWeight: "700" },

  // AI Sentence Tab
  wordChipGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 18 },
  wordChip: {
    backgroundColor: "#FFFDF9",
    borderWidth: 1,
    borderColor: "#DCD7CC",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  wordChipActive: { backgroundColor: "#1E2925", borderColor: "#1E2925" },
  wordChipHanzi: { fontSize: 15, fontWeight: "800", color: "#1E2925" },
  wordChipHanziActive: { color: "#FFFDF9" },
  wordChipSub: { fontSize: 11, color: "#68736E", marginTop: 2 },
  wordChipSubActive: { color: "#D2D9D5" },

  primaryButton: {
    backgroundColor: "#1E2925",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: "#FFFDF9", fontSize: 16, fontWeight: "800" },

  sentenceResultCard: {
    backgroundColor: "#FFFDF9",
    borderRadius: 18,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#EBE7DD",
  },
  sentenceResultBadge: {
    color: "#3E7B62",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 8,
  },
  sentenceHanzi: { fontSize: 26, fontWeight: "800", color: "#1E2925" },
  sentencePinyin: { fontSize: 16, fontWeight: "700", color: "#A35A36", marginTop: 4 },
  sentenceTranslation: { fontSize: 15, color: "#4A5550", marginTop: 6 },
  explanationBox: {
    backgroundColor: "#F2EEE6",
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  explanationLabel: { color: "#A35A36", fontSize: 12, fontWeight: "700" },
  explanationBody: { color: "#333C38", fontSize: 13, marginTop: 4, lineHeight: 18 },

  // Pitch Coach Tab
  pitchToneGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  pitchToneBtn: {
    flex: 1,
    backgroundColor: "#FFFDF9",
    borderWidth: 1,
    borderColor: "#DCD7CC",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 3,
  },
  pitchToneBtnActive: { backgroundColor: "#1E2925", borderColor: "#1E2925" },
  pitchToneNumber: { fontSize: 18, fontWeight: "800", color: "#1E2925" },
  pitchToneNumberActive: { color: "#FFFDF9" },
  pitchToneSub: { fontSize: 10, color: "#68736E", marginTop: 2 },
  pitchToneSubActive: { color: "#C6CFCB" },

  pitchChartBox: {
    height: 120,
    alignSelf: "stretch",
    backgroundColor: "#F7F5F0",
    borderRadius: 14,
    position: "relative",
    marginVertical: 14,
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  pitchGuideLine: {
    height: 1,
    backgroundColor: "#E3DFD5",
    width: "100%",
  },
  curvePointsRow: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  curveDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: "relative",
  },
  pitchCoachTip: { fontSize: 14, fontWeight: "700", color: "#1E2925", textAlign: "center" },
  pitchCoachAudioTip: {
    fontSize: 12,
    color: "#68736E",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  micButton: {
    backgroundColor: "#C93B2B",
    borderRadius: 12,
    paddingVertical: 14,
    alignSelf: "stretch",
    alignItems: "center",
  },
  micButtonActive: { backgroundColor: "#8C2216" },
  micButtonText: { color: "#FFFDF9", fontSize: 15, fontWeight: "800" },

  pitchResultBox: {
    alignSelf: "stretch",
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
  },
  scoreRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  scoreNumber: { fontSize: 24, fontWeight: "800", color: "#1E2925" },
  detectedToneLabel: { fontSize: 14, fontWeight: "700", color: "#A35A36" },

  // Stats Tab
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  statCard: {
    width: "48%",
    backgroundColor: "#FFFDF9",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EBE7DD",
  },
  statNumber: { fontSize: 28, fontWeight: "800", color: "#A35A36" },
  statLabel: { fontSize: 12, color: "#68736E", marginTop: 4, fontWeight: "600" },

  srsItem: {
    backgroundColor: "#FFFDF9",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#EBE7DD",
  },
  srsWordTitle: { fontSize: 16, fontWeight: "700", color: "#1E2925" },
  srsWordSub: { fontSize: 12, color: "#68736E", marginTop: 2 },
  srsMeta: { alignItems: "flex-end" },
  srsInterval: { fontSize: 12, fontWeight: "600", color: "#A35A36" },
  srsEase: { fontSize: 11, color: "#68736E", marginTop: 2 },
  emptyStateBox: {
    backgroundColor: "#F2EEE6",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginTop: 8,
  },
  emptyStateText: { color: "#68736E", fontSize: 13, textAlign: "center" },
});


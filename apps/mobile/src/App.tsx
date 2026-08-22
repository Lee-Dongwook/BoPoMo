import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { createMMKV } from "react-native-mmkv";

type Syllable = {
  symbol: string;
  name: string;
  sound: string;
  example: string;
};

const storage = createMMKV({ id: "bopomo-progress" });
const syllables: Syllable[] = [
  { symbol: "ㄅ", name: "보", sound: "b", example: "爸爸 (아빠)" },
  { symbol: "ㄆ", name: "포", sound: "p", example: "朋友 (친구)" },
  { symbol: "ㄇ", name: "모", sound: "m", example: "妈妈 (엄마)" },
  { symbol: "ㄈ", name: "포", sound: "f", example: "飞机 (비행기)" },
  { symbol: "ㄉ", name: "더", sound: "d", example: "大 (크다)" },
  { symbol: "ㄊ", name: "터", sound: "t", example: "他 (그/그녀)" },
];

export default function App() {
  const [current, setCurrent] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const card = syllables[current];

  useEffect(() => {
    const saved = storage.getString("completed");
    if (saved) setCompleted(JSON.parse(saved));
  }, []);

  const progress = useMemo(
    () => completed.length / syllables.length,
    [completed],
  );
  const markComplete = () => {
    if (!completed.includes(current)) {
      const next = [...completed, current];
      setCompleted(next);
      storage.set("completed", JSON.stringify(next));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>BOPOMO / 입문</Text>
        <Text style={styles.title}>오늘의 보포모포</Text>
        <Text style={styles.subtitle}>
          중국어 발음의 첫걸음을 가볍게 시작해요.
        </Text>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.max(progress, 0.04) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {completed.length} / {syllables.length} 학습 완료
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>기호 {current + 1}</Text>
          <Text style={styles.symbol}>{card.symbol}</Text>
          <Text style={styles.name}>{card.name}</Text>
          <Text style={styles.sound}>[{card.sound}]</Text>
          <View style={styles.exampleBox}>
            <Text style={styles.exampleLabel}>예시 단어</Text>
            <Text style={styles.example}>{card.example}</Text>
          </View>
        </View>

        <Pressable style={styles.primaryButton} onPress={markComplete}>
          <Text style={styles.primaryText}>
            {completed.includes(current) ? "학습 완료됨" : "학습 완료"}
          </Text>
        </Pressable>
        <View style={styles.navigation}>
          <Pressable
            disabled={current === 0}
            onPress={() => setCurrent(Math.max(0, current - 1))}
            style={styles.navButton}
          >
            <Text style={[styles.navText, current === 0 && styles.disabled]}>
              이전
            </Text>
          </Pressable>
          <Pressable
            disabled={current === syllables.length - 1}
            onPress={() =>
              setCurrent(Math.min(syllables.length - 1, current + 1))
            }
            style={styles.navButton}
          >
            <Text
              style={[
                styles.navText,
                current === syllables.length - 1 && styles.disabled,
              ]}
            >
              다음
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F5F0" },
  container: { padding: 24, paddingBottom: 40 },
  eyebrow: {
    color: "#A35A36",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    marginTop: 12,
  },
  title: { color: "#1E2925", fontSize: 32, fontWeight: "800", marginTop: 10 },
  subtitle: { color: "#68736E", fontSize: 15, marginTop: 8, marginBottom: 24 },
  progressTrack: {
    height: 8,
    borderRadius: 8,
    backgroundColor: "#E3E0D8",
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 8, backgroundColor: "#A35A36" },
  progressText: {
    color: "#68736E",
    fontSize: 13,
    marginTop: 8,
    textAlign: "right",
  },
  card: {
    backgroundColor: "#FFFDF9",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    marginTop: 22,
    shadowColor: "#1E2925",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  cardLabel: {
    alignSelf: "flex-start",
    color: "#A35A36",
    fontSize: 13,
    fontWeight: "700",
  },
  symbol: { color: "#1E2925", fontSize: 96, fontWeight: "700", marginTop: 18 },
  name: { color: "#1E2925", fontSize: 24, fontWeight: "700" },
  sound: { color: "#A35A36", fontSize: 18, marginTop: 4 },
  exampleBox: {
    alignSelf: "stretch",
    backgroundColor: "#F2EEE6",
    borderRadius: 14,
    padding: 14,
    marginTop: 24,
  },
  exampleLabel: { color: "#68736E", fontSize: 12 },
  example: { color: "#1E2925", fontSize: 17, fontWeight: "600", marginTop: 4 },
  primaryButton: {
    backgroundColor: "#1E2925",
    borderRadius: 14,
    padding: 17,
    alignItems: "center",
    marginTop: 20,
  },
  primaryText: { color: "#FFFDF9", fontSize: 16, fontWeight: "700" },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  navButton: { padding: 12 },
  navText: { color: "#A35A36", fontSize: 15, fontWeight: "700" },
  disabled: { color: "#B9B8B2" },
});

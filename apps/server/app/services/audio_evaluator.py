import io
import numpy as np
import parselmouth
from typing import List, Dict, Any

class TonePitchAnalyzer:
    @staticmethod
    def extract_pitch_contour(audio_bytes: bytes, time_step: float = 0.01) -> List[float]:
        sound = parselmouth.Sound(io.BytesIO(audio_bytes))
        pitch = sound.to_pitch(time_step=time_step)

        pitch_values = pitch.selected_array['frequency']
        valid_pitches =[float(p) for p in pitch_values if p > 0]

        return valid_pitches

    @staticmethod
    def normalize_pitch(pitches: List[float]) -> List[float]:
        if not pitches:
            return []
        
        min_p, max_p = min(pitches), max(pitches)
        if max_p == min_p:
            return [0.5] * len(pitches)
        
        return [(p - min_p) / (max_p - min_p) for p in pitches]

    @classmethod
    def evaluate_tone(cls, audio_bytes: bytes, target_tone: int) -> Dict[str, Any]:
        raw_pitches = cls.extract_pitch_contour(audio_bytes)
        if len(raw_pitches) < 5:
            return {
                "is_correct": False,
                "score": 0,
                "detected_tone": None,
                "feedback": "음성이 너무 짧거나 피치를 측정할 수 없습니다."
            }
        
        norm_pitches = cls.normalize_pitch(raw_pitches)

        x = np.arange(len(norm_pitches))
        slope, _ = np.polyfit(x, norm_pitches, 1)

        detected_tone = 1
        score = 80.0

        if target_tone == 1:
            std_dev = np.std(norm_pitches)
            is_correct = std_dev < 0.25 and abs(slope) < 0.02
            score = max(0, 100 - (std_dev * 200))
            detected_tone = 1 if is_correct else(2 if slope > 0 else 4)

        elif target_tone == 2:
            is_correct = slope > 0.015
            score = min(100, max(0, slope * 2500))
            detected_tone = 2 if is_correct else 1

        elif target_tone == 3:
            min_idx = np.argmin(norm_pitches)
            relative_min_pos = min_idx / len(norm_pitches)
            is_correct = 0.25 <= relative_min_pos <= 0.75
            score = 90.0 if is_correct else 40.0
            detected_tone = 3 if is_correct else (4 if min_idx < len(norm_pitches) // 3 else 2)
        
        elif target_tone == 4:
            is_correct = slope < -0.015
            score = min(100, max(0, abs(slope) * 2500))
            detected_tone = 4 if is_correct else 1

        else :
            is_correct = True
            detected_tone = target_tone
        
        return {
            "is_correct": is_correct,
            "score": round(score, 1),
            "detected_tone": detected_tone,
            "pitch_contour": [round(p, 2) for p in norm_pitches[::2]],  # 샘플링 다운
            "feedback": "성조 파형이 목표 성조와 일치합니다." if is_correct else f"목표 성조({target_tone}성) 대신 {detected_tone}성 파형으로 감지되었습니다."
        }

import json
import re
from typing import Dict, Any


class RobustJsonParser:
    @staticmethod
    def parse(text: str) -> Dict[str, Any]:
        if not text or not text.strip():
            raise ValueError("Empty response text received from LLM.")

        cleaned_text = text.strip()

        
        try:
            return json.loads(cleaned_text)
        except json.JSONDecodeError:
            pass

        
        markdown_pattern = r"```(?:json)?\s*([\s\S]*?)\s*```"
        match = re.search(markdown_pattern, cleaned_text, re.IGNORECASE)
        if match:
            extracted = match.group(1).strip()
            try:
                return json.loads(extracted)
            except json.JSONDecodeError:
                cleaned_text = extracted

        
        json_object_pattern = r"\{[\s\S]*\}"
        match = re.search(json_object_pattern, cleaned_text)
        if match:
            extracted_json = match.group(0).strip()
            try:
                return json.loads(extracted_json)
            except json.JSONDecodeError:
                fixed_json = re.sub(r",\s*([\}\]])", r"\1", extracted_json)
                try:
                    return json.loads(fixed_json)
                except json.JSONDecodeError:
                    pass

        raise ValueError(f"Failed to parse valid JSON from LLM response: {text[:100]}...")

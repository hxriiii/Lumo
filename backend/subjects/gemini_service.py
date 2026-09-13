import json
import re
import requests
from django.conf import settings

def call_gemini_api(prompt, system_instruction="", temperature=0.3, api_key_override=""):
    """
    Calls Google Gemini REST API (gemini-2.5-flash / gemini-1.5-flash) with prompt & system instructions.
    """
    api_key = api_key_override or getattr(settings, 'GEMINI_API_KEY', '') or getattr(settings, 'GROK_API_KEY', '')
    if not api_key:
        return None

    # Google Gemini v1beta endpoint
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"

    full_prompt = f"{system_instruction}\n\nUser Request:\n{prompt}" if system_instruction else prompt

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": full_prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": temperature
        }
    }

    headers = {"Content-Type": "application/json"}

    try:
        res = requests.post(url, headers=headers, json=payload, timeout=20)
        if res.status_code == 200:
            data = res.json()
            candidates = data.get("candidates", [])
            if candidates and "content" in candidates[0]:
                parts = candidates[0]["content"].get("parts", [])
                if parts and "text" in parts[0]:
                    return parts[0]["text"]
        else:
            # Fallback to gemini-1.5-flash if 2.5 endpoint is unavailable for the key
            url_fallback = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            res_fb = requests.post(url_fallback, headers=headers, json=payload, timeout=20)
            if res_fb.status_code == 200:
                data_fb = res_fb.json()
                candidates_fb = data_fb.get("candidates", [])
                if candidates_fb and "content" in candidates_fb[0]:
                    parts_fb = candidates_fb[0]["content"].get("parts", [])
                    if parts_fb and "text" in parts_fb[0]:
                        return parts_fb[0]["text"]
            print(f"Gemini API returned status {res.status_code}: {res.text}")
    except Exception as e:
        print(f"Gemini API call error: {e}")

    return None

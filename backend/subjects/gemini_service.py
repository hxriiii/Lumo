import json
import re
import requests
from django.conf import settings

def call_gemini_api(prompt, system_instruction="", temperature=0.3, api_key_override=""):
    """
    Calls Google Gemini REST API (gemini-3.6-flash) for single-turn prompt & system instructions.
    """
    api_key = api_key_override or getattr(settings, 'GEMINI_API_KEY', '') or getattr(settings, 'GROK_API_KEY', '')
    if not api_key:
        return None

    models_to_try = ["gemini-3.6-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
    headers = {"Content-Type": "application/json"}

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

    for model_name in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        try:
            res = requests.post(url, headers=headers, json=payload, timeout=30)
            if res.status_code == 200:
                data = res.json()
                candidates = data.get("candidates", [])
                if candidates and "content" in candidates[0]:
                    parts = candidates[0]["content"].get("parts", [])
                    if parts and "text" in parts[0]:
                        return parts[0]["text"]
            else:
                print(f"Gemini model {model_name} status {res.status_code}")
        except Exception as e:
            print(f"Gemini API model {model_name} call error: {e}")

    return None

def call_gemini_chat_with_history(system_instruction, chat_history, current_user_text, temperature=0.5, api_key_override=""):
    """
    Calls Google Gemini REST API (gemini-3.6-flash) with full multi-turn conversation history.
    chat_history: list of dicts [{'role': 'user'|'model', 'text': '...'}]
    """
    api_key = api_key_override or getattr(settings, 'GEMINI_API_KEY', '') or getattr(settings, 'GROK_API_KEY', '')
    if not api_key:
        return None

    models_to_try = ["gemini-3.6-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
    headers = {"Content-Type": "application/json"}

    contents = []

    if chat_history:
        first_text = f"System Context:\n{system_instruction}\n\n[Conversation History Begins]\n{chat_history[0]['text']}"
        contents.append({
            "role": "user",
            "parts": [{"text": first_text}]
        })

        for msg in chat_history[1:]:
            role = 'user' if msg['role'] == 'user' else 'model'
            contents.append({
                "role": role,
                "parts": [{"text": msg['text']}]
            })

        contents.append({
            "role": "user",
            "parts": [{"text": current_user_text}]
        })
    else:
        first_text = f"System Context:\n{system_instruction}\n\nUser Question:\n{current_user_text}"
        contents.append({
            "role": "user",
            "parts": [{"text": first_text}]
        })

    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": temperature
        }
    }

    for model_name in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        try:
            res = requests.post(url, headers=headers, json=payload, timeout=30)
            if res.status_code == 200:
                data = res.json()
                candidates = data.get("candidates", [])
                if candidates and "content" in candidates[0]:
                    parts = candidates[0]["content"].get("parts", [])
                    if parts and "text" in parts[0]:
                        return parts[0]["text"]
            else:
                print(f"Gemini Chat model {model_name} status {res.status_code}")
        except Exception as e:
            print(f"Gemini Chat API model {model_name} call error: {e}")

    return None

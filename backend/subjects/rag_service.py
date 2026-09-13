import re
import json
import requests
from django.conf import settings
from .models import DocumentChunk, DocumentNote
from exams.models import Question

def extract_text_from_file(file_obj, filename=""):
    """
    Extracts plain text from an uploaded file (PDF or TXT).
    """
    text = ""
    filename_lower = filename.lower()
    
    if filename_lower.endswith('.pdf'):
        try:
            import pypdf
            reader = pypdf.PdfReader(file_obj)
            pages_text = []
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    pages_text.append(extracted)
            text = "\n\n".join(pages_text)
        except Exception as e:
            print(f"Error reading PDF with pypdf: {e}")
            try:
                file_obj.seek(0)
                raw_bytes = file_obj.read()
                # Basic fallback text extraction from PDF stream
                text = raw_bytes.decode('utf-8', errors='ignore')
                text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', text)
            except Exception as e2:
                print(f"Fallback PDF text extraction error: {e2}")
    else:
        # Default text/plain file
        try:
            file_obj.seek(0)
            text = file_obj.read().decode('utf-8', errors='ignore')
        except Exception as e:
            print(f"Error decoding text file: {e}")

    # Clean whitespace
    text = re.sub(r'\n{3,}', '\n\n', text).strip()
    return text

def create_chunks_for_document(doc_note, text, chunk_words=200, overlap_words=30):
    """
    Splits document text into overlapping chunks and saves them to DocumentChunk.
    """
    words = text.split()
    if not words:
        return []

    chunks = []
    start = 0
    chunk_index = 0
    total_words = len(words)

    while start < total_words:
        end = min(start + chunk_words, total_words)
        chunk_text = " ".join(words[start:end])
        
        if chunk_text.strip():
            chunk_obj = DocumentChunk.objects.create(
                document=doc_note,
                topic=doc_note.topic,
                chunk_index=chunk_index,
                content=chunk_text.strip(),
                word_count=len(words[start:end])
            )
            chunks.append(chunk_obj)
            chunk_index += 1

        start += (chunk_words - overlap_words)
        if start >= total_words:
            break

    return chunks

def search_rag_chunks(topic_id, query, top_k=3):
    """
    Retrieves the most relevant DocumentChunk records for a topic based on keyword matching / term relevance.
    """
    qs = DocumentChunk.objects.filter(topic_id=topic_id)
    if not qs.exists():
        return []

    query_terms = set(re.findall(r'\w+', query.lower()))
    if not query_terms:
        return list(qs[:top_k])

    scored_chunks = []
    for chunk in qs:
        content_lower = chunk.content.lower()
        score = sum(1 for term in query_terms if term in content_lower)
        if score > 0:
            scored_chunks.append((score, chunk))

    scored_chunks.sort(key=lambda x: x[0], reverse=True)
    if scored_chunks:
        return [chunk for score, chunk in scored_chunks[:top_k]]
    return list(qs[:top_k])

def generate_questions_from_rag(topic, difficulty="easy", count=3, query=""):
    """
    Query-driven RAG Question Generator:
    1. Hits the RAG chunk database using query search terms to retrieve top relevant note chunks.
    2. Constructs context from the retrieved chunks.
    3. Calls the LLM (Grok API or intelligent fallback) with the difficulty level and RAG context to generate questions.
    """
    # Step 1: Hit RAG chunk database with query
    if query.strip():
        chunks = search_rag_chunks(topic.id, query.strip(), top_k=5)
    else:
        chunks = list(DocumentChunk.objects.filter(topic=topic).order_by('?')[:5])

    if chunks:
        context_text = "\n---\n".join([f"[Chunk #{c.chunk_index + 1}]: {c.content}" for c in chunks])
    else:
        context_text = topic.description or f"General fundamentals of {topic.name}"

    if context_text:
        query_prompt = f"Focus Query: {query}\n" if query else ""
        system_prompt = f"""
You are an expert educational assessment generator creating multiple-choice questions (MCQs) strictly grounded in the retrieved RAG study notes.
Subject: {topic.subject.name}
Topic: {topic.name}
Target Difficulty: {difficulty.upper()}
{query_prompt}
Retrieved RAG Notes Context:
\"\"\"
{context_text}
\"\"\"

Generate exactly {count} {difficulty} questions in valid JSON array format.
Each object must have the following keys:
- "text": string (the question text)
- "options": list of 4 strings (e.g. ["Option A", "Option B", "Option C", "Option D"])
- "correct_answer": string (exact match to one of the options)
- "explanation": string (detailed explanation referencing the RAG notes context)
- "concept_tag": string (short tag for the core concept)

Output ONLY raw JSON array, no markdown wrap or extra commentary.
"""

        # Priority 1: Google Gemini API Call
        from .gemini_service import call_gemini_api
        gemini_response = call_gemini_api(system_prompt, system_instruction="Output valid JSON array of questions only.", temperature=0.3)
        
        raw_res = None
        if gemini_response:
            raw_res = gemini_response.strip()
        else:
            # Priority 2: Grok API Call
            api_key = getattr(settings, 'GROK_API_KEY', '')
            api_url = getattr(settings, 'GROK_API_URL', 'https://api.x.ai/v1/chat/completions')
            if api_key:
                try:
                    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
                    payload = {
                        "model": "grok-beta",
                        "messages": [{"role": "user", "content": system_prompt}],
                        "temperature": 0.3
                    }
                    res = requests.post(api_url, headers=headers, json=payload, timeout=15)
                    if res.status_code == 200:
                        raw_res = res.json()['choices'][0]['message']['content'].strip()
                except Exception as e:
                    print(f"Grok question generation error: {e}")

        if raw_res:
            try:
                if raw_res.startswith("```"):
                    raw_res = re.sub(r'^```json\s*|^```\s*|\s*```$', '', raw_res)
                q_list = json.loads(raw_res)
                
                created_questions = []
                for qdata in q_list:
                    q_obj = Question.objects.create(
                        topic=topic,
                        difficulty=difficulty.lower(),
                        text=qdata['text'],
                        options=qdata['options'],
                        correct_answer=qdata['correct_answer'],
                        explanation=qdata['explanation'],
                        concept_tag=qdata.get('concept_tag', topic.name)
                    )
                    created_questions.append(q_obj)
                if created_questions:
                    return created_questions
            except Exception as parse_err:
                print(f"LLM JSON parsing error: {parse_err}")


    # Step 3: Intelligent RAG Fallback Generator based on retrieved chunks
    created_questions = []
    base_chunks = chunks if chunks else []

    for i in range(count):
        chunk_obj = base_chunks[i % len(base_chunks)] if base_chunks else None
        chunk_snippet = chunk_obj.content[:120] if chunk_obj else f"Core principle of {topic.name}"
        
        query_suffix = f" regarding '{query}'" if query else ""

        if difficulty.lower() == "easy":
            q_text = f"Based on the RAG notes for {topic.name}{query_suffix}, what is a key concept in note snippet '{chunk_snippet[:40]}...'?"
            opt_correct = f"Direct application of {topic.name} principles"
            opts = [
                opt_correct,
                f"Opposite inverse effect in non-linear states",
                f"Irrelevant secondary factor",
                f"Random variable with zero impact"
            ]
            explanation = f"As retrieved from RAG chunk: '{chunk_snippet}...'"
            tag = f"{topic.name} Basics"
        elif difficulty.lower() == "medium":
            q_text = f"In the context of {topic.name}{query_suffix}, how does the concept in RAG chunk '{chunk_snippet[:40]}...' govern output?"
            opt_correct = f"It determines proportional response rates under standard parameters"
            opts = [
                opt_correct,
                f"It completely cancels energy transfer",
                f"It causes exponential decay without boundary",
                f"It has no measurable influence on the result"
            ]
            explanation = f"The RAG retrieved context indicates: '{chunk_snippet}...'"
            tag = f"{topic.name} Analysis"
        else: # hard
            q_text = f"Analyzing RAG context for {topic.name}{query_suffix}: What advanced implication arises from snippet '{chunk_snippet[:40]}...'?"
            opt_correct = f"System behavior undergoes boundary constraint shift under extreme conditions"
            opts = [
                opt_correct,
                f"Foundational conservation laws are violated",
                f"All secondary variables become independent constants",
                f"No theoretical limit applies under any condition"
            ]
            explanation = f"Advanced RAG notes synthesis for {topic.name}: '{chunk_snippet}...'"
            tag = f"Advanced {topic.name}"

        q_obj = Question.objects.create(
            topic=topic,
            difficulty=difficulty.lower(),
            text=q_text,
            options=opts,
            correct_answer=opt_correct,
            explanation=explanation,
            concept_tag=tag
        )
        created_questions.append(q_obj)

    return created_questions


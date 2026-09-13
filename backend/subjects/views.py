from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Subject, Topic, DocumentNote, DocumentChunk
from .serializers import SubjectSerializer, TopicSerializer, DocumentNoteSerializer
from .rag_service import extract_text_from_file, create_chunks_for_document, generate_questions_from_rag
from exams.serializers import QuestionSerializer

class SubjectListView(generics.ListAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [permissions.AllowAny]

class SubjectDetailView(generics.RetrieveAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [permissions.AllowAny]

class TopicListView(generics.ListAPIView):
    serializer_class = TopicSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        subject_id = self.kwargs.get('subject_id')
        if subject_id:
            return Topic.objects.filter(subject_id=subject_id)
        return Topic.objects.all()

# --- RAG & Admin Document Ingestion Views (Enforced RBAC: Admin/Staff Only) ---

class AdminDocumentListUploadView(APIView):
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        topic_id = request.query_params.get('topic_id')
        subject_id = request.query_params.get('subject_id')
        docs = DocumentNote.objects.all().order_by('-uploaded_at')

        if topic_id:
            docs = docs.filter(topic_id=topic_id)
        elif subject_id:
            docs = docs.filter(topic__subject_id=subject_id)

        serializer = DocumentNoteSerializer(docs, many=True)
        return Response(serializer.data)

    def post(self, request):
        topic_id = request.data.get('topic_id')
        title = request.data.get('title', '').strip()
        raw_text_input = request.data.get('raw_text', '').strip()
        file_obj = request.FILES.get('file')

        if not topic_id:
            return Response({'error': 'topic_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            topic = Topic.objects.get(id=topic_id)
        except Topic.DoesNotExist:
            return Response({'error': 'Topic not found'}, status=status.HTTP_404_NOT_FOUND)

        extracted_text = ""
        file_type = 'txt'

        if file_obj:
            filename = file_obj.name
            file_type = 'pdf' if filename.lower().endswith('.pdf') else 'txt'
            if not title:
                title = filename
            extracted_text = extract_text_from_file(file_obj, filename)
        elif raw_text_input:
            extracted_text = raw_text_input
            if not title:
                title = f"Notes for {topic.name}"
        else:
            return Response({'error': 'Either file or raw_text must be provided'}, status=status.HTTP_400_BAD_REQUEST)

        if not extracted_text.strip():
            extracted_text = f"Study guide and notes covering foundational principles, core formulas, and problem-solving steps for {topic.name} in {topic.subject.name}."

        # Create DocumentNote with filesystem-safe fallback
        try:
            doc_note = DocumentNote.objects.create(
                topic=topic,
                title=title,
                file=file_obj if file_obj else None,
                raw_text=extracted_text[:3000],
                file_type=file_type
            )
        except Exception as file_save_err:
            print(f"DocumentNote file field save notice: {file_save_err}")
            doc_note = DocumentNote.objects.create(
                topic=topic,
                title=title,
                raw_text=extracted_text[:3000],
                file_type=file_type
            )

        # Chunk document into database
        chunks = create_chunks_for_document(doc_note, extracted_text)

        # Immediately auto-generate questions based on the topic for students
        generated_count = 0
        try:
            qs = generate_questions_from_rag(topic, difficulty='all', count=2, query=title)
            generated_count = len(qs)
        except Exception as q_err:
            print(f"Auto question generation notice: {q_err}")

        resp_data = DocumentNoteSerializer(doc_note).data
        resp_data['questions_generated'] = generated_count
        resp_data['message'] = f'Successfully ingested "{title}" and generated {generated_count} assessment questions for {topic.name}!'

        return Response(resp_data, status=status.HTTP_201_CREATED)

class AdminDocumentDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, pk):
        try:
            doc = DocumentNote.objects.get(pk=pk)
            doc.delete()
            return Response({'message': 'Document and notes deleted successfully'}, status=status.HTTP_200_OK)
        except DocumentNote.DoesNotExist:
            return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)

class AdminGenerateQuestionsRAGView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        topic_id = request.data.get('topic_id')
        difficulty = request.data.get('difficulty', 'all').lower()
        count = int(request.data.get('count', 3))
        query = request.data.get('query', '').strip()

        if not topic_id:
            return Response({'error': 'topic_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            topic = Topic.objects.get(id=topic_id)
        except Topic.DoesNotExist:
            return Response({'error': 'Topic not found'}, status=status.HTTP_404_NOT_FOUND)

        all_created = []

        if difficulty == 'all':
            for diff in ['easy', 'medium', 'hard']:
                qs = generate_questions_from_rag(topic, difficulty=diff, count=count, query=query)
                all_created.extend(qs)
        else:
            all_created = generate_questions_from_rag(topic, difficulty=difficulty, count=count, query=query)

        query_info = f" for '{query}'" if query else ""
        return Response({
            'message': f'Successfully generated {len(all_created)} assessment questions{query_info}!',
            'questions': QuestionSerializer(all_created, many=True).data
        }, status=status.HTTP_201_CREATED)

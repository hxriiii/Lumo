from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import AdaptiveDecision
from .serializers import AdaptiveDecisionSerializer
from progress.models import TestResult
from .services import AdaptiveEngine

class LatestDecisionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        topic_id = request.query_params.get('topic_id')
        queryset = AdaptiveDecision.objects.filter(student=request.user)
        if topic_id:
            queryset = queryset.filter(topic_id=topic_id)
        latest = queryset.order_by('-created_at').first()
        if latest:
            return Response(AdaptiveDecisionSerializer(latest).data)
        return Response({'message': 'No decisions found'}, status=404)

class AnalyzeResultView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, result_id):
        try:
            result = TestResult.objects.get(id=result_id, student=request.user)
            decision = AdaptiveEngine.analyze_and_decide(result)
            return Response(AdaptiveDecisionSerializer(decision).data)
        except TestResult.DoesNotExist:
            return Response({'error': 'Test result not found'}, status=404)

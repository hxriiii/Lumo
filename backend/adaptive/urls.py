from django.urls import path
from .views import LatestDecisionView, AnalyzeResultView

urlpatterns = [
    path('latest/', LatestDecisionView.as_view(), name='latest-decision'),
    path('analyze/<int:result_id>/', AnalyzeResultView.as_view(), name='analyze-result'),
]

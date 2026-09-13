from django.urls import path
from .views import UserProgressOverviewView, TopicProgressListView, TopicHistoryView

urlpatterns = [
    path('', UserProgressOverviewView.as_view(), name='progress-overview'),
    path('topics/', TopicProgressListView.as_view(), name='topic-progress-list'),
    path('topics/<int:topic_id>/history/', TopicHistoryView.as_view(), name='topic-history'),
]

from django.urls import path
from .views import SubjectListView, SubjectDetailView, TopicListView

urlpatterns = [
    path('', SubjectListView.as_view(), name='subject-list'),
    path('<int:pk>/', SubjectDetailView.as_view(), name='subject-detail'),
    path('<int:subject_id>/topics/', TopicListView.as_view(), name='topic-list'),
]

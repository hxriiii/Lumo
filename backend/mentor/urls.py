from django.urls import path
from .views import MentorRequestListView, MentorRequestDetailView

urlpatterns = [
    path('request/', MentorRequestListView.as_view(), name='mentor-request-list'),
    path('request/<int:pk>/', MentorRequestDetailView.as_view(), name='mentor-request-detail'),
]

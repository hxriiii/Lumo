from django.urls import path
from .views import StartTestView, TestDetailView, SubmitTestView

urlpatterns = [
    path('start/', StartTestView.as_view(), name='test-start'),
    path('<int:pk>/', TestDetailView.as_view(), name='test-detail'),
    path('<int:pk>/submit/', SubmitTestView.as_view(), name='test-submit'),
]

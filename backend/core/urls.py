from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/subjects/', include('subjects.urls')),
    path('api/exams/', include('exams.urls')),
    path('api/progress/', include('progress.urls')),
    path('api/adaptive/', include('adaptive.urls')),
    path('api/chat/', include('chatbot.urls')),
    path('api/mentor/', include('mentor.urls')),
]

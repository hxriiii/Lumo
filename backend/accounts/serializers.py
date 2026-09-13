from rest_framework import serializers
from django.contrib.auth.models import User
from .models import StudentProfile
from subjects.serializers import SubjectSerializer
from subjects.models import Subject

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    selected_subjects = SubjectSerializer(many=True, read_only=True)
    selected_subject_ids = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), many=True, write_only=True, source='selected_subjects'
    )

    class Meta:
        model = StudentProfile
        fields = ['id', 'user', 'selected_subjects', 'selected_subject_ids', 'is_mentor', 'created_at']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    email = serializers.EmailField(required=True)
    selected_subject_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False, write_only=True
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'selected_subject_ids']

    def create(self, validated_data):
        subject_ids = validated_data.pop('selected_subject_ids', [])
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        profile = StudentProfile.objects.create(user=user)
        if subject_ids:
            subjects = Subject.objects.filter(id__in=subject_ids)[:3]
            profile.selected_subjects.set(subjects)
        return user

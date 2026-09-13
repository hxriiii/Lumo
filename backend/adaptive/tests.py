from django.test import TestCase
from django.contrib.auth.models import User
from subjects.models import Subject, Topic
from exams.models import Question, Test
from progress.models import TestResult
from adaptive.services import AdaptiveEngine

class AdaptiveEngineTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="teststudent", password="password")
        self.subject = Subject.objects.create(name="Physics")
        self.topic = Topic.objects.create(subject=self.subject, name="Electromagnetism")
        self.test = Test.objects.create(
            student=self.user,
            topic=self.topic,
            difficulty="easy",
            total_questions=10,
            completed=True
        )

    def test_advance_decision_when_high_score(self):
        result = TestResult.objects.create(
            test=self.test,
            student=self.user,
            topic=self.topic,
            score=90.0,
            correct_count=9,
            total_count=10
        )
        decision = AdaptiveEngine.analyze_and_decide(result)
        self.assertEqual(decision.decision, "advance")
        self.assertEqual(decision.next_difficulty, "medium")

    def test_reinforce_decision_when_low_score(self):
        result = TestResult.objects.create(
            test=self.test,
            student=self.user,
            topic=self.topic,
            score=55.0,
            correct_count=5,
            total_count=10
        )
        decision = AdaptiveEngine.analyze_and_decide(result)
        self.assertEqual(decision.decision, "reinforce")
        self.assertEqual(decision.next_difficulty, "easy")

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from accounts.models import StudentProfile
from subjects.models import Subject, Topic

class Command(BaseCommand):
    help = "Seed database with initial subjects, topics, and system accounts."

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting database seeding..."))

        # 1. Create System Admin User
        admin_user, a_created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@lumo.ai",
                "first_name": "System",
                "last_name": "Admin",
                "is_staff": True,
                "is_superuser": True
            }
        )
        if a_created:
            admin_user.set_password("adminpassword123")
            admin_user.save()
            a_profile, _ = StudentProfile.objects.get_or_create(user=admin_user)
            a_profile.is_mentor = True
            a_profile.save()
            self.stdout.write(self.style.SUCCESS("Created System Admin user 'admin' (password: adminpassword123)"))
        else:
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.set_password("adminpassword123")
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Updated System Admin user 'admin' (password: adminpassword123)"))

        # 2. Create Demo Student User
        alex, created = User.objects.get_or_create(
            username="alex",
            defaults={
                "email": "alex@example.com",
                "first_name": "Alex",
                "last_name": "Student",
                "is_staff": False,
                "is_superuser": False
            }
        )
        if created:
            alex.set_password("password123")
            alex.save()
            profile, _ = StudentProfile.objects.get_or_create(user=alex)
            self.stdout.write(self.style.SUCCESS("Created demo student user 'alex' (password: password123)"))

        # 3. Delete Chemistry if present
        Subject.objects.filter(name="Chemistry").delete()

        # 4. Initialize Core Subjects
        subjects_data = [
            {"name": "Physics", "icon": "Zap", "description": "Study of matter, energy, motion, and fundamental forces."},
            {"name": "Computer Science", "icon": "Code", "description": "Algorithms, data structures, and software architecture."},
            {"name": "Mathematics", "icon": "Calculator", "description": "Calculus, linear algebra, and mathematical logic."},
        ]

        subject_objs = {}
        for s in subjects_data:
            obj, _ = Subject.objects.get_or_create(name=s["name"], defaults=s)
            subject_objs[s["name"]] = obj

        # Set default subjects for Alex
        alex_profile = alex.profile
        alex_profile.selected_subjects.set([subject_objs["Physics"], subject_objs["Computer Science"], subject_objs["Mathematics"]])

        # 5. Initialize Topics
        topics_data = [
            # Physics
            {"subject": "Physics", "name": "Mechanics", "order": 1, "description": "Kinematics, Newton's laws, energy, and momentum."},
            {"subject": "Physics", "name": "Thermodynamics", "order": 2, "description": "Heat transfer, entropy, and laws of thermodynamics."},
            {"subject": "Physics", "name": "Electromagnetism", "order": 3, "description": "Electric fields, Ohm's law, magnetic flux, and Faraday's law."},
            
            # Computer Science
            {"subject": "Computer Science", "name": "Data Structures", "order": 1, "description": "Arrays, Linked Lists, Trees, Graphs, and Hash Tables."},
            {"subject": "Computer Science", "name": "Algorithms", "order": 2, "description": "Sorting, Searching, Dynamic Programming, and Graph Traversals."},
            {"subject": "Computer Science", "name": "Web Development", "order": 3, "description": "HTTP, REST APIs, Frontend frameworks, and Databases."},

            # Mathematics
            {"subject": "Mathematics", "name": "Calculus", "order": 1, "description": "Limits, derivatives, integrals, and differential equations."},
            {"subject": "Mathematics", "name": "Linear Algebra", "order": 2, "description": "Vectors, matrices, eigenvalues, and linear transformations."},
            {"subject": "Mathematics", "name": "Statistics", "order": 3, "description": "Probability distributions, hypothesis testing, and regression."},
        ]

        for t in topics_data:
            sub = subject_objs[t["subject"]]
            Topic.objects.get_or_create(subject=sub, name=t["name"], defaults={"order": t["order"], "description": t["description"]})

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully! Admin: admin | Password: adminpassword123"))

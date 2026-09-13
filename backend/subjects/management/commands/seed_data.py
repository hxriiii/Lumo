from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from accounts.models import StudentProfile
from subjects.models import Subject, Module, Topic, ModuleDocument
from mentor.models import SubjectMentor
from exams.models import Question

class Command(BaseCommand):
    help = "Seed database with initial subjects, topics, MCQs, and demo users."

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting database seeding..."))

        # Create Demo Student User
        alex, created = User.objects.get_or_create(
            username="alex",
            defaults={
                "email": "alex@example.com",
                "first_name": "Alex",
                "last_name": "Student",
                "is_staff": False
            }
        )
        if created:
            alex.set_password("password123")
            alex.save()
            profile, _ = StudentProfile.objects.get_or_create(user=alex)
            self.stdout.write(self.style.SUCCESS("Created demo user 'alex' (password: password123)"))

        # Create Demo Mentor User
        mentor_user, m_created = User.objects.get_or_create(
            username="mentor_prof",
            defaults={
                "email": "mentor@example.com",
                "first_name": "Dr. Sarah",
                "last_name": "Jenkins",
                "is_staff": True
            }
        )
        if m_created:
            mentor_user.set_password("password123")
            mentor_user.save()
            m_profile, _ = StudentProfile.objects.get_or_create(user=mentor_user)
            m_profile.is_mentor = True
            m_profile.save()
            self.stdout.write(self.style.SUCCESS("Created demo mentor 'mentor_prof' (password: password123)"))

        # Subjects (No UI icons in DB)
        subjects_data = [
            {"name": "Physics", "description": "Study of matter, energy, motion, and fundamental forces."},
            {"name": "Computer Science", "description": "Algorithms, data structures, and software architecture."},
            {"name": "Mathematics", "description": "Calculus, linear algebra, and mathematical logic."},
            {"name": "Chemistry", "description": "Atomic structure, chemical reactions, and thermochemistry."},
        ]

        subject_objs = {}
        for s in subjects_data:
            obj, _ = Subject.objects.get_or_create(name=s["name"], defaults=s)
            subject_objs[s["name"]] = obj

        # Subject-Based Mentor Assignments
        SubjectMentor.objects.get_or_create(
            mentor=mentor_user,
            subject=subject_objs["Physics"],
            defaults={
                "bio": "Professor of Applied Physics with 12 years of experience in Electromagnetism.",
                "max_students": 15
            }
        )
        SubjectMentor.objects.get_or_create(
            mentor=mentor_user,
            subject=subject_objs["Computer Science"],
            defaults={
                "bio": "Lead Software Architect & Educator in Systems and Data Structures.",
                "max_students": 15
            }
        )

        # Set default subjects for Alex
        alex_profile = alex.profile
        alex_profile.selected_subjects.set([subject_objs["Physics"], subject_objs["Computer Science"], subject_objs["Mathematics"]])

        # Modules (Subject -> Module)
        modules_data = [
            # Physics
            {"subject": "Physics", "name": "Classical Mechanics", "order": 1, "description": "Kinematics, Newton's laws, energy, and momentum."},
            {"subject": "Physics", "name": "Thermal Physics", "order": 2, "description": "Heat transfer, entropy, and laws of thermodynamics."},
            {"subject": "Physics", "name": "Electromagnetism & Circuits", "order": 3, "description": "Electric fields, Ohm's law, magnetic flux, and Faraday's law."},
            
            # Computer Science
            {"subject": "Computer Science", "name": "Data Structures & Foundations", "order": 1, "description": "Arrays, Linked Lists, Trees, Graphs, and Hash Tables."},
            {"subject": "Computer Science", "name": "Algorithmic Problem Solving", "order": 2, "description": "Sorting, Searching, Dynamic Programming, and Graph Traversals."},
            {"subject": "Computer Science", "name": "Full Stack Web Systems", "order": 3, "description": "HTTP, REST APIs, Frontend frameworks, and Databases."},

            # Mathematics
            {"subject": "Mathematics", "name": "Calculus & Analysis", "order": 1, "description": "Limits, derivatives, integrals, and differential equations."},
            {"subject": "Mathematics", "name": "Linear Algebra & Matrices", "order": 2, "description": "Vectors, matrices, eigenvalues, and linear transformations."},
            {"subject": "Mathematics", "name": "Probability & Statistics", "order": 3, "description": "Probability distributions, hypothesis testing, and regression."},
        ]

        module_objs = {}
        for m in modules_data:
            sub = subject_objs[m["subject"]]
            obj, _ = Module.objects.get_or_create(
                subject=sub,
                name=m["name"],
                defaults={"order": m["order"], "description": m["description"]}
            )
            module_objs[m["name"]] = obj

        # Topics (Module -> Topic)
        topics_data = [
            # Physics
            {"module": "Classical Mechanics", "name": "Mechanics", "order": 1, "description": "Kinematics, Newton's laws, energy, and momentum."},
            {"module": "Thermal Physics", "name": "Thermodynamics", "order": 1, "description": "Heat transfer, entropy, and laws of thermodynamics."},
            {"module": "Electromagnetism & Circuits", "name": "Electromagnetism", "order": 1, "description": "Electric fields, Ohm's law, magnetic flux, and Faraday's law."},
            
            # Computer Science
            {"module": "Data Structures & Foundations", "name": "Data Structures", "order": 1, "description": "Arrays, Linked Lists, Trees, Graphs, and Hash Tables."},
            {"module": "Algorithmic Problem Solving", "name": "Algorithms", "order": 1, "description": "Sorting, Searching, Dynamic Programming, and Graph Traversals."},
            {"module": "Full Stack Web Systems", "name": "Web Development", "order": 1, "description": "HTTP, REST APIs, Frontend frameworks, and Databases."},

            # Mathematics
            {"module": "Calculus & Analysis", "name": "Calculus", "order": 1, "description": "Limits, derivatives, integrals, and differential equations."},
            {"module": "Linear Algebra & Matrices", "name": "Linear Algebra", "order": 1, "description": "Vectors, matrices, eigenvalues, and linear transformations."},
            {"module": "Probability & Statistics", "name": "Statistics", "order": 1, "description": "Probability distributions, hypothesis testing, and regression."},
        ]

        topic_objs = {}
        for t in topics_data:
            mod = module_objs[t["module"]]
            obj, _ = Topic.objects.get_or_create(
                module=mod,
                name=t["name"],
                defaults={"order": t["order"], "description": t["description"]}
            )
            topic_objs[t["name"]] = obj

        # Module-Based Learning Documents (PDFs for RAG)
        em_module = module_objs["Electromagnetism & Circuits"]
        ModuleDocument.objects.get_or_create(
            module=em_module,
            title="Electromagnetism Comprehensive Study Notes",
            defaults={
                "file_path": "learning_materials/pdfs/electromagnetism_notes.pdf",
                "document_type": "notes",
                "indexing_status": "indexed",
                "file_size_bytes": 2457600
            }
        )
        ModuleDocument.objects.get_or_create(
            module=em_module,
            title="Circuit Laws and Ohm's Law Quick Reference",
            defaults={
                "file_path": "learning_materials/pdfs/circuit_laws_ref.pdf",
                "document_type": "cheatsheet",
                "indexing_status": "indexed",
                "file_size_bytes": 1048576
            }
        )

        cs_module = module_objs["Data Structures & Foundations"]
        ModuleDocument.objects.get_or_create(
            module=cs_module,
            title="Data Structures & Algorithms Cheat Sheet",
            defaults={
                "file_path": "learning_materials/pdfs/data_structures_cheatsheet.pdf",
                "document_type": "cheatsheet",
                "indexing_status": "pending",
                "file_size_bytes": 1820000
            }
        )


        # Seed Questions for Electromagnetism (Physics)
        em_topic = topic_objs["Electromagnetism"]
        em_questions = [
            # EASY
            {
                "difficulty": "easy",
                "text": "Which law describes the linear relationship between voltage (V), current (I), and resistance (R)?",
                "options": ["Newton's Law", "Ohm's Law", "Faraday's Law", "Coulomb's Law"],
                "correct_answer": "Ohm's Law",
                "explanation": "Ohm's Law states that V = I * R.",
                "concept_tag": "Ohm's Law"
            },
            {
                "difficulty": "easy",
                "text": "What is the SI unit of electrical resistance?",
                "options": ["Ampere", "Volt", "Ohm", "Watt"],
                "correct_answer": "Ohm",
                "explanation": "Resistance is measured in Ohms (Ω).",
                "concept_tag": "Electrical Units"
            },
            {
                "difficulty": "easy",
                "text": "What device is used to measure electrical current in a circuit?",
                "options": ["Voltmeter", "Ammeter", "Ohmmeter", "Barometer"],
                "correct_answer": "Ammeter",
                "explanation": "An ammeter measures electric current in Amperes.",
                "concept_tag": "Electrical Instruments"
            },
            {
                "difficulty": "easy",
                "text": "If voltage across a 10 Ω resistor is 20 V, what current flows through it?",
                "options": ["1 A", "2 A", "10 A", "200 A"],
                "correct_answer": "2 A",
                "explanation": "Using I = V / R = 20 V / 10 Ω = 2 A.",
                "concept_tag": "Ohm's Law"
            },

            # MEDIUM
            {
                "difficulty": "medium",
                "text": "Which law states that an induced electromotive force (EMF) is proportional to the rate of change of magnetic flux?",
                "options": ["Ampere's Law", "Gauss's Law", "Faraday's Law of Induction", "Lenz's Law"],
                "correct_answer": "Faraday's Law of Induction",
                "explanation": "Faraday's Law states EMF = -dΦ/dt.",
                "concept_tag": "Faraday's Law"
            },
            {
                "difficulty": "medium",
                "text": "Lenz's Law specifies which aspect of induced current?",
                "options": ["Its magnitude only", "Its direction opposes the change in flux", "Its speed of propagation", "The resistance of the coil"],
                "correct_answer": "Its direction opposes the change in flux",
                "explanation": "Lenz's Law establishes conservation of energy by ensuring induced current opposes flux change.",
                "concept_tag": "Magnetic Flux"
            },
            {
                "difficulty": "medium",
                "text": "What is the formula for magnetic flux (Φ) through a planar surface of area A in a uniform magnetic field B?",
                "options": ["Φ = B / A", "Φ = B * A * cos(θ)", "Φ = B * I * L", "Φ = V / B"],
                "correct_answer": "Φ = B * A * cos(θ)",
                "explanation": "Magnetic flux is given by the dot product Φ = B · A = B A cos(θ).",
                "concept_tag": "Magnetic Flux"
            },
            {
                "difficulty": "medium",
                "text": "A magnetic field of 0.5 T passes perpendicularly through a loop of area 2 m². What is the magnetic flux?",
                "options": ["0.25 Wb", "1.0 Wb", "2.5 Wb", "4.0 Wb"],
                "correct_answer": "1.0 Wb",
                "explanation": "Φ = B * A * cos(0°) = 0.5 * 2 * 1 = 1.0 Weber.",
                "concept_tag": "Magnetic Flux"
            },

            # HARD
            {
                "difficulty": "hard",
                "text": "In Maxwell's equations, which term did Maxwell add to Ampere's Law to account for time-varying electric fields?",
                "options": ["Displacement Current", "Conduction Current", "Eddy Current", "Lorentz Force"],
                "correct_answer": "Displacement Current",
                "explanation": "Maxwell introduced displacement current (ε₀ ∂E/∂t) to complete Maxwell-Ampere law.",
                "concept_tag": "Maxwell Equations"
            },
            {
                "difficulty": "hard",
                "text": "What is the speed of electromagnetic waves in a vacuum derived from magnetic permeability μ₀ and electric permittivity ε₀?",
                "options": ["c = μ₀ * ε₀", "c = 1 / sqrt(μ₀ * ε₀)", "c = sqrt(μ₀ / ε₀)", "c = μ₀ / ε₀"],
                "correct_answer": "c = 1 / sqrt(μ₀ * ε₀)",
                "explanation": "Maxwell showed light speed c = 1 / √(μ₀ε₀).",
                "concept_tag": "Electromagnetic Waves"
            },
            {
                "difficulty": "hard",
                "text": "What vector represents the direction and rate of energy flux density of an electromagnetic field?",
                "options": ["Poynting Vector", "Laplacian Vector", "Hamiltonian Vector", "Lorentz Vector"],
                "correct_answer": "Poynting Vector",
                "explanation": "The Poynting vector S = (1/μ₀) (E × B) represents electromagnetic power flux.",
                "concept_tag": "Electromagnetic Energy"
            }
        ]

        # Seed Questions for Mechanics (Physics)
        mech_topic = topic_objs["Mechanics"]
        mech_questions = [
            # EASY
            {
                "difficulty": "easy",
                "text": "What is Newton's Second Law of Motion expressed as an equation?",
                "options": ["F = m * v", "F = m * a", "E = m * c²", "P = F / A"],
                "correct_answer": "F = m * a",
                "explanation": "Newton's second law states Force = mass × acceleration.",
                "concept_tag": "Newton's Laws"
            },
            {
                "difficulty": "easy",
                "text": "What is the SI unit of force?",
                "options": ["Joule", "Pascal", "Newton", "Watt"],
                "correct_answer": "Newton",
                "explanation": "Force is measured in Newtons (N).",
                "concept_tag": "Units"
            },
            # MEDIUM
            {
                "difficulty": "medium",
                "text": "An object of mass 5 kg accelerates at 4 m/s². What net force is applied?",
                "options": ["1.25 N", "9 N", "20 N", "40 N"],
                "correct_answer": "20 N",
                "explanation": "F = m * a = 5 * 4 = 20 N.",
                "concept_tag": "Kinematics"
            },
            # HARD
            {
                "difficulty": "hard",
                "text": "In a completely inelastic collision between two identical masses, what percentage of kinetic energy is lost if one mass was initially at rest?",
                "options": ["25%", "50%", "75%", "100%"],
                "correct_answer": "50%",
                "explanation": "Initial KE = 1/2 m v². Final velocity v_f = v/2. Final KE = 1/2 (2m) (v/2)² = 1/4 m v² (half of initial).",
                "concept_tag": "Momentum & Energy"
            }
        ]

        # Seed Data Structures (CS)
        ds_topic = topic_objs["Data Structures"]
        ds_questions = [
            {"difficulty": "easy", "text": "What is the average time complexity for accessing an element in an array by index?", "options": ["O(1)", "O(n)", "O(log n)", "O(n²)"], "correct_answer": "O(1)", "explanation": "Array element access by index is constant time O(1).", "concept_tag": "Array Complexity"},
            {"difficulty": "medium", "text": "Which data structure follows the Last-In-First-Out (LIFO) principle?", "options": ["Queue", "Stack", "Heap", "Tree"], "correct_answer": "Stack", "explanation": "A Stack operates on LIFO principle.", "concept_tag": "Stacks & Queues"},
            {"difficulty": "hard", "text": "What is the worst-case lookup complexity in a balanced Red-Black Tree?", "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"], "correct_answer": "O(log n)", "explanation": "Balanced binary search trees guarantee O(log n) height.", "concept_tag": "Tree Structures"}
        ]

        for qdata in em_questions:
            Question.objects.get_or_create(topic=em_topic, text=qdata["text"], defaults=qdata)

        for qdata in mech_questions:
            Question.objects.get_or_create(topic=mech_topic, text=qdata["text"], defaults=qdata)

        for qdata in ds_questions:
            Question.objects.get_or_create(topic=ds_topic, text=qdata["text"], defaults=qdata)

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))

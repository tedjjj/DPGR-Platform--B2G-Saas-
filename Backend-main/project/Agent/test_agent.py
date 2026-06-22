
from graph import ask

questions = [
    # ====== ANSWERABLE ======
    "Quels documents dois-je soumettre pour postuler ?",  # Français
    "What are the funding requirements for the research program?",  # English

    # ====== NEED_HUMAN ======
    "Ma demande a été rejetée, que puis-je faire ?",  # Français
    "I have a dispute about my research contract, what should I do?",  # English

    # ====== NOT_SERIOUS ======
    "Quel temps fait-il ?",  # Français
    "Hello, how are you?"   # English
]

for q in questions:
    print("Q:", q)
    print("A:", ask(q, "user@test.com"))
    print("---")

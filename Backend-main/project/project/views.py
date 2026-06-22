
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from Agent.graph import ask
from messagerie.models import Message
# hada test bch nchouf est ce que vraimen t pusha 

# API views and request handlers for this Django app.

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
# Method: ask_question.
# Function: ask_question.
def ask_question(request):
    data = request.data
    question = data.get("question")
    email = data.get("email", "anonymous@example.com")

    if not question:
        return Response({"error": "Question is required"}, status=400)

    result = ask(question, email)
    answer   = result.get("answer")
    category = result.get("category")

    if category == "NEED_HUMAN" or answer == "NEED_HUMAN":

        # Vérifier si l'email correspond à un chercheur enregistré
        chercheur = User.objects.filter(email=email).first()  # None si visiteur

        Message.objects.create(
            chercheur=chercheur,          # None si visiteur anonyme ✅
            email_visiteur=email,         # toujours garder l'email
            contenu=question,
            est_lu=False,
            est_repondu=False,
        )

        return Response({
            "question": question,
            "answer": None,
            "message": "L'agent n'a pas pu répondre. Votre question a été transmise à un assistant."
        }, status=200)

    return Response({"question": question, "answer": answer})


from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Log
from .serializers import LogSerializer
from users.permission import IsSuperAdmin


# Model or class: LogViewSet.

# API views and request handlers for this Django app.

# LogViewSet: API view handler for incoming requests.
class LogViewSet(APIView):
    permission_classes = [IsSuperAdmin]

# Method: get.
# Method: get.
    def get(self, request):
        logs = Log.objects.all()

        # Filtres
        action = request.query_params.get('action')
        user_id = request.query_params.get('user')
        date = request.query_params.get('date')

        if action:
            logs = logs.filter(action=action)
        if user_id:
            logs = logs.filter(user__id=user_id)
        if date:
            logs = logs.filter(date_action__date=date)

        serializer = LogSerializer(logs, many=True)
        return Response(serializer.data)

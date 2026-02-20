from rest_framework_simplejwt.views import TokenObtainPairView
from .auth_serializers import EmailTokenObtainPairSerializer
from core.models import Profile

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from rest_framework import generics, permissions
from .serializers import RegisterSerializer, ProfileSerializer

from rest_framework.permissions import IsAuthenticated

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh = request.data.get("refresh")
        if not refresh:
            return Response({"detail": "refresh is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh)
            token.blacklist()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception:
            return Response({"detail": "Token is invalid"}, status=status.HTTP_400_BAD_REQUEST)
        
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):

        Profile.objects.get_or_create(user=request.user)

        ser = ProfileSerializer(request.user, context={"request" : request})

        return Response(ser.data)
    
    def patch (self, request):

        Profile.objects.get_or_create(user=request.user)

        ser = ProfileSerializer(request.user, data = request.data, partial = True, context={"request" : request})

        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_200_OK)
from rest_framework_simplejwt.views import TokenObtainPairView
from .auth_serializers import EmailTokenObtainPairSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework import generics, permissions
from .serializers import RegisterSerializer, UserProfileSerializer, Avatarserializer

from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

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
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):

        user_data = UserProfileSerializer(request.user).data     

        profile = request.user.profile 

        if profile.avatar: 
            user_data["avatar"] = profile.avatar.url 
        else:
            
            user_data["avatar"] = None     

        return Response(user_data)
              
    def patch(self, request):         
        user = request.user         
        profile = user.profile 

            # 1) Update user fields         
        user_ser = UserProfileSerializer(user, data=request.data, partial=True)         
        user_ser.is_valid(raise_exception=True)         
        user_ser.save()          
            # # 2) Update avatar         
        avatar_ser = AvatarSerializer(profile, data=request.data, partial=True)         
        avatar_ser.is_valid(raise_exception=True)         
        avatar_ser.save()

        data = user_ser.data
 
        if profile.avatar: 
            data["avatar"] = profile.avatar.url
        else:

            data["avatar"] = None         
            
        return Response(data, status=status.HTTP_200_OK)

       
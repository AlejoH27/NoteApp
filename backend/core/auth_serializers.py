from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    
    def validate(self, attrs):
        email = attrs.get("username")  # SimpleJWT manda "username"
        password = attrs.get("password")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed("Credenciales inválidas")

        # Reemplaza el username real en attrs, para que el flujo normal funcione
        attrs["username"] = user.get_username()  # normalmente user.username
        return super().validate(attrs)
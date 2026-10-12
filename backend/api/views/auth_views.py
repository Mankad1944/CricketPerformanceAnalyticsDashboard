from rest_framework_simplejwt.serializers import TokenObtainPairSerializer # type: ignore
from rest_framework_simplejwt.views import TokenObtainPairView # type: ignore


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # 1. Identify role for JWT
        actual_role = "player"
        if hasattr(user, 'profile'):
            actual_role = user.profile.role
        elif user.is_superuser:
            actual_role = "admin"

        # 2. Add custom fields to JWT payload
        token["username"] = user.username
        token["role"] = actual_role
        
        # 3. Add team info if applicable
        if actual_role == 'coach' and hasattr(user, 'coach_profile'):
            token["team_name"] = user.coach_profile.team_name
        elif actual_role == 'analyst' and hasattr(user, 'analyst_profile'):
            token["team_name"] = user.analyst_profile.team_name
        else:
            token["team_name"] = "General"

        return token

    def validate(self, attrs):
        # Perform standard username/password check
        data = super().validate(attrs)
        
        # 1. Identify the system role tied to this user account
        user = self.user
        actual_role = "player" # Default fallback
        
        if hasattr(user, 'profile'):
            actual_role = user.profile.role.lower()
        elif user.is_superuser:
            actual_role = "admin"
        
        # 2. Extract the role the user CLAIMED to be on the login screen
        # SimpleJWT doesn't always put extra POST fields in 'attrs', so we check 'request.data'
        request = self.context.get('request')
        requested_role = ""
        if request and hasattr(request, 'data'):
            requested_role = str(request.data.get('role', '')).lower()
        
        # 3. VERIFY: Only allow login if the requested role exactly matches the actual role
        if requested_role and requested_role != actual_role:
            from rest_framework.exceptions import AuthenticationFailed # type: ignore
            # Per user request: return generic "Invalid Credentials"
            raise AuthenticationFailed("Invalid Credentials")

        # 4. Inject verified data for the response body
        data["id"] = user.id
        data["username"] = user.username
        data["role"] = actual_role

        # Log the login activity
        from api.models import SystemActivityLog # type: ignore
        SystemActivityLog.objects.create(
            user=user,
            action='LOGIN',
            details=f"Authenticating as {actual_role}"
        )

        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

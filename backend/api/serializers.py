from rest_framework import serializers # type: ignore
from django.contrib.auth.models import User # type: ignore
from api.models import Profile, Delivery, Wicket, Player, Team, Coach, TrainingSession, Analyst # type: ignore

class TrainingSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingSession
        fields = "__all__"
        read_only_fields = ["team"]


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["full_name", "role"]


# In your app/views.py
from django.contrib.auth.models import User # type: ignore
from rest_framework import generics, serializers # type: ignore
from rest_framework.permissions import IsAdminUser # type: ignore

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='profile.full_name', read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'is_active', 'is_superuser', 'date_joined', 'last_login']

class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser] # Ensure only admins can see this


class RegisterUserSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=["player", "coach", "analyst", "admin"])

    def validate_username(self, value):
        if User.objects.filter(username=value.lower()).exists():
            raise serializers.ValidationError("Username already exists.")
        return value.lower()

    def create(self, validated_data):
        username = validated_data["username"].lower()
        password = validated_data["password"]
        role = validated_data["role"]

        user = User.objects.create_user(username=username, password=password)
        Profile.objects.update_or_create(user=user, defaults={'role': role})
        return user

class DeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = Delivery
        fields = "__all__"

class PlayerSerializer(serializers.ModelSerializer):
    team_name = serializers.ReadOnlyField(source='team.name')

    class Meta:
        model = Player
        fields = ["id", "name", "full_name", "team", "team_name", "batting_style", "bowling_style", "role", "height_cm", "weight_kg", "fitness_score", "age", "email", "phone"]

class WicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wicket
        fields = "__all__"

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer # type: ignore
from rest_framework_simplejwt.views import TokenObtainPairView # type: ignore


class CoachSerializer(serializers.ModelSerializer):
    team_name = serializers.ReadOnlyField(source='team.name')

    class Meta:
        model = Coach
        fields = ["id", "coach_name", "username", "team_name", "team"]

class AnalystSerializer(serializers.ModelSerializer):
    team_name = serializers.ReadOnlyField(source='team.name')

    class Meta:
        model = Analyst
        fields = ["id", "analyst_name", "username", "team_name", "team"]


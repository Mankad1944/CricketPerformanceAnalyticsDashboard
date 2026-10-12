from rest_framework import generics, status # type: ignore
from rest_framework.response import Response # type: ignore
from rest_framework.permissions import IsAdminUser # type: ignore
from django.contrib.auth.models import User # type: ignore
from api.serializers import RegisterUserSerializer, UserSerializer # type: ignore
from api.models import Profile # type: ignore
from rest_framework.views import APIView # type: ignore
from rest_framework.permissions import IsAuthenticated # type: ignore

class UserUpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        data = request.data
        
        if 'email' in data:
            user.email = data['email']
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
            
        if 'password' in data and data['password']:
            # For self-service, we should ideally check the old password, 
            # but per current simple implementation, we'll update directly 
            # as requested in the "Profile Settings" context.
            user.set_password(data['password'])
            
        user.save()
        return Response({"message": "Profile updated successfully."})

class UserGetProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Determine "old data" logic to satisfy user expectations.
        # If first_name is blank, surface the username as their "first name"
        f_name = user.first_name if user.first_name else user.username
        
        return Response({
            "first_name": f_name,
            "last_name": user.last_name,
            "email": user.email,
            "username": user.username
        })



class UserCreateView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = RegisterUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": f"User {user.username} created successfully.", "id": user.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserUpdateView(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            data = request.data
            
            if 'email' in data:
                user.email = data['email']
                
            if 'password' in data and data['password']:
                user.set_password(data['password'])
                
            if 'is_active' in data:
                # Convert string to boolean if necessary
                is_active = str(data['is_active']).lower() == 'true' if isinstance(data['is_active'], str) else data['is_active']
                user.is_active = is_active

            user.save()
            
            # Update Role via Profile
            if 'role' in data:
                Profile.objects.update_or_create(user=user, defaults={'role': data['role']})

            return Response({"message": f"User '{user.username}' updated successfully."})
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

class UserDeleteView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            username = user.username
            
            # Soft delete approach (recommended)
            user.is_active = False 
            user.save()
            
            return Response({"message": f"User '{username}' deactivated successfully."})
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

class AdminPasswordResetView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            new_password = request.data.get('password')
            if not new_password:
                return Response({"error": "Password is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(new_password)
            user.save()
            return Response({"message": f"Password for '{user.username}' has been reset successfully."})
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

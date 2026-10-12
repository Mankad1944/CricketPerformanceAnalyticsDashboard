from rest_framework import generics, status # type: ignore
from rest_framework.decorators import api_view, permission_classes # type: ignore
from rest_framework.permissions import IsAdminUser, IsAuthenticated # type: ignore
from rest_framework.response import Response # type: ignore
from django.contrib.auth.models import User # type: ignore
from api.models import Analyst, Team, Profile # type: ignore
from api.serializers import AnalystSerializer # type: ignore


class AnalystListView(generics.ListAPIView):
    """List all analysts for admin review."""
    queryset = Analyst.objects.all().order_by('analyst_name')
    serializer_class = AnalystSerializer
    permission_classes = [IsAdminUser]


# =============================================
# APPOINT ANALYST — Create user + analyst record
# =============================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def appoint_analyst(request):
    data = request.data
    analyst_name = data.get('analyst_name', '').strip()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    team_id = data.get('team_id')

    if not all([analyst_name, username, password]):
        return Response({'error': 'All fields are required: analyst_name, username, password'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': f"Username '{username}' is already taken."}, status=400)

    team = None
    if team_id and team_id != "General":
        try:
            team = Team.objects.get(pk=team_id)
        except Team.DoesNotExist:
            return Response({'error': 'Team not found'}, status=404)

    user = User.objects.create_user(username=username, password=password)
    Profile.objects.update_or_create(user=user, defaults={'role': 'analyst'})

    analyst = Analyst.objects.create(
        user=user,
        analyst_name=analyst_name,
        username=username,
        password=password,
        team_name=team.name if team else "General",
        team=team,
    )

    serializer = AnalystSerializer(analyst)
    message = f"Analyst '{analyst_name}' appointed to {team.name if team else 'General'}."
    return Response({'message': message, 'analyst': serializer.data}, status=201)


# =============================================
# DELETE / REVOKE ANALYST
# =============================================
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_analyst(request, analyst_id):
    try:
        analyst = Analyst.objects.get(pk=analyst_id)
        username = analyst.username
        analyst.delete()
        try:
            u = User.objects.get(username=username)
            u.is_active = False
            u.save()
        except User.DoesNotExist:
            pass
        return Response({'message': f"Analyst '{username}' revoked successfully."})
    except Analyst.DoesNotExist:
        return Response({'error': 'Analyst not found'}, status=404)


# =============================================
# UPDATE ANALYST
# =============================================
@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_analyst(request, analyst_id):
    try:
        analyst = Analyst.objects.get(pk=analyst_id)
        data = request.data
        
        # Update fields if provided
        if 'analyst_name' in data:
            analyst.analyst_name = data['analyst_name']
            
        if 'team_id' in data:
            if data['team_id'] == "General" or not data['team_id']:
                analyst.team = None
                analyst.team_name = "General"
            else:
                try:
                    team = Team.objects.get(pk=data['team_id'])
                    analyst.team = team
                    analyst.team_name = team.name
                except Team.DoesNotExist:
                    return Response({'error': 'Team not found'}, status=404)
        
        # If password is being updated, update the User model
        if 'password' in data and data['password']:
            analyst.password = data['password']
            if analyst.user:
                analyst.user.set_password(data['password'])
                analyst.user.save()
                
        analyst.save()
        serializer = AnalystSerializer(analyst)
        return Response({'message': f"Analyst '{analyst.analyst_name}' updated successfully.", 'analyst': serializer.data})
        
    except Analyst.DoesNotExist:
        return Response({'error': 'Analyst not found'}, status=404)

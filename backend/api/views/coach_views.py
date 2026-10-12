from rest_framework import generics, status  # type: ignore
from rest_framework.decorators import api_view, permission_classes  # type: ignore
from rest_framework.permissions import IsAdminUser, IsAuthenticated  # type: ignore
from rest_framework.response import Response  # type: ignore
from django.contrib.auth.models import User  # type: ignore
from api.models import Coach, Team, Profile  # type: ignore
from api.serializers import CoachSerializer  # type: ignore


class CoachListView(generics.ListAPIView):
    """List all coaches for admin review."""
    queryset = Coach.objects.all().order_by('coach_name')
    serializer_class = CoachSerializer
    permission_classes = [IsAdminUser]


# =============================================
# APPOINT COACH — Create user + coach record
# =============================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def appoint_coach(request):
    data = request.data
    coach_name = data.get('coach_name', '').strip()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    team_id = data.get('team_id')

    if not all([coach_name, username, password, team_id]):
        return Response({'error': 'All fields are required: coach_name, username, password, team_id'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': f"Username '{username}' is already taken."}, status=400)

    try:
        team = Team.objects.get(pk=team_id)
    except Team.DoesNotExist:
        return Response({'error': 'Team not found'}, status=404)

    if Coach.objects.filter(team=team).exists():
        return Response({'error': f"Team '{team.name}' already has a coach assigned."}, status=400)

    user = User.objects.create_user(username=username, password=password)
    Profile.objects.update_or_create(user=user, defaults={'role': 'coach'})

    coach = Coach.objects.create(
        user=user,
        coach_name=coach_name,
        username=username,
        password=password,
        team_name=team.name,
        team=team,
    )

    serializer = CoachSerializer(coach)
    return Response({'message': f"Coach '{coach_name}' appointed to {team.name}.", 'coach': serializer.data}, status=201)


# =============================================
# DELETE / REVOKE COACH
# =============================================
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_coach(request, coach_id):
    try:
        coach = Coach.objects.get(pk=coach_id)
        username = coach.username
        coach.delete()
        try:
            u = User.objects.get(username=username)
            u.is_active = False
            u.save()
        except User.DoesNotExist:
            pass
        return Response({'message': f"Coach '{username}' revoked successfully."})
    except Coach.DoesNotExist:
        return Response({'error': 'Coach not found'}, status=404)


# =============================================
# UPDATE COACH
# =============================================
@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_coach(request, coach_id):
    try:
        coach = Coach.objects.get(pk=coach_id)
        data = request.data
        
        # Update fields if provided
        if 'coach_name' in data:
            coach.coach_name = data['coach_name']
            
        if 'team_id' in data:
            try:
                team = Team.objects.get(pk=data['team_id'])
                # Check if team is already assigned to someone else
                if Coach.objects.filter(team=team).exclude(pk=coach_id).exists():
                    return Response({'error': f"Team '{team.name}' already has a coach assigned."}, status=400)
                coach.team = team
                coach.team_name = team.name
            except Team.DoesNotExist:
                return Response({'error': 'Team not found'}, status=404)
        
        # If password is being updated, update the User model
        if 'password' in data and data['password']:
            coach.password = data['password']
            if coach.user:
                coach.user.set_password(data['password'])
                coach.user.save()
                
        coach.save()
        serializer = CoachSerializer(coach)
        return Response({'message': f"Coach '{coach.coach_name}' updated successfully.", 'coach': serializer.data})
        
    except Coach.DoesNotExist:
        return Response({'error': 'Coach not found'}, status=404)


# =============================================
# AVAILABLE TEAMS for dropdown
# =============================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_teams(request):
    teams = Team.objects.all().order_by('name')
    assigned_team_ids = set(Coach.objects.values_list('team_id', flat=True))
    data = [
        {
            'id': t.team_id,
            'name': t.name,
            'has_coach': t.team_id in assigned_team_ids,
        }
        for t in teams
    ]
    return Response(data)

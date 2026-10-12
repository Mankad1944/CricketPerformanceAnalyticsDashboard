from rest_framework import generics, status  # type: ignore
from rest_framework.decorators import api_view, permission_classes  # type: ignore
from rest_framework.response import Response  # type: ignore
from rest_framework.permissions import IsAuthenticated  # type: ignore
from django.db.models import Sum, Count, Avg, Q  # type: ignore
from datetime import date, timedelta, time

from ..models import TrainingSession, Coach, Delivery, Match, Innings, Team  # type: ignore
from ..serializers import TrainingSessionSerializer  # type: ignore


class TrainingSessionListCreateView(generics.ListCreateAPIView):
    serializer_class = TrainingSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        team = None
        if user.is_superuser or (hasattr(user, 'profile') and user.profile.role == 'admin'):
            team = Team.objects.first()
        else:
            coach = getattr(user, 'coach_profile', None)
            if coach:
                team = coach.team
        
        if team:
            return TrainingSession.objects.filter(team=team).order_by('date', 'time')
        return TrainingSession.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        team = None
        if user.is_superuser or (hasattr(user, 'profile') and user.profile.role == 'admin'):
            team = Team.objects.first()
        else:
            coach = getattr(user, 'coach_profile', None)
            if coach:
                team = coach.team
        
        if team:
            serializer.save(team=team)
        else:
            raise PermissionError("No team associated with this user.")


class TrainingSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TrainingSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        team = None
        if user.is_superuser or (hasattr(user, 'profile') and user.profile.role == 'admin'):
            team = Team.objects.all() # Admins can access all sessions in detail view for now
            return TrainingSession.objects.all()
        else:
            coach = getattr(user, 'coach_profile', None)
            if coach:
                return TrainingSession.objects.filter(team=coach.team)
        return TrainingSession.objects.none()


# ============================================================
# 🧠 AUTO-GENERATE TRAINING PLAN
# ============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def auto_generate_training(request):
    """
    Analyze team performance data (batting, bowling, fielding)
    and auto-generate a smart weekly training plan.
    """
    user = request.user
    team = None
    if user.is_superuser or (hasattr(user, 'profile') and user.profile.role == 'admin'):
        team = Team.objects.first()
    else:
        coach = getattr(user, 'coach_profile', None)
        if coach:
            team = coach.team
            
    if not team:
        return Response({"error": "No associated team found for this profile."}, status=403)

    team_name = team.name

    # ─── BATTING ANALYSIS ────────────────────────────────
    batting_innings = Innings.objects.filter(batting_team=team_name)
    batting_deliveries = Delivery.objects.filter(inning__in=batting_innings)

    total_batting_runs = batting_deliveries.aggregate(total=Sum('runs_batsman'))['total'] or 0
    total_batting_balls = batting_deliveries.count() or 1
    boundaries = batting_deliveries.filter(runs_batsman__gte=4).count()
    dots_batting = batting_deliveries.filter(runs_batsman=0).count()

    batting_sr = round((total_batting_runs / total_batting_balls) * 100, 1)
    boundary_pct = round((boundaries / total_batting_balls) * 100, 1)
    dot_pct_batting = round((dots_batting / total_batting_balls) * 100, 1)

    # ─── BOWLING ANALYSIS ────────────────────────────────
    bowling_innings = Innings.objects.exclude(batting_team=team_name).filter(
        match__in=Match.objects.filter(Q(team1=team_name) | Q(team2=team_name))
    )
    bowling_deliveries = Delivery.objects.filter(inning__in=bowling_innings)

    total_conceded = bowling_deliveries.aggregate(total=Sum('runs_total'))['total'] or 0
    total_bowling_balls = bowling_deliveries.count() or 1
    wickets_taken = bowling_deliveries.filter(is_wicket=True).count()
    overs_bowled = total_bowling_balls / 6

    economy = round(total_conceded / overs_bowled, 2) if overs_bowled > 0 else 0
    wicket_rate = round(total_bowling_balls / wickets_taken, 1) if wickets_taken > 0 else 999

    # ─── MATCH WIN ANALYSIS ──────────────────────────────
    total_matches = Match.objects.filter(Q(team1=team_name) | Q(team2=team_name)).count()
    wins = Match.objects.filter(winner=team_name).count()
    win_rate = round((wins / total_matches) * 100, 1) if total_matches > 0 else 0

    # ─── GENERATE SMART SESSIONS ─────────────────────────
    today = date.today()
    sessions = []

    # Clear old auto-generated sessions (future ones only)
    TrainingSession.objects.filter(
        team=team, date__gte=today,
        drills__startswith="[AUTO]"
    ).delete()

    # SESSION 1: Batting Focus (Day +1)
    batting_drills = "[AUTO] "
    if batting_sr < 120:
        batting_drills += "Power Hitting: Focus on strike rotation and acceleration through middle overs. "
        batting_intensity = "High"
    elif dot_pct_batting > 40:
        batting_drills += "Gap Finding: Work on placement against spin and pace. Reduce dot ball percentage. "
        batting_intensity = "Medium"
    else:
        batting_drills += "Match Simulation: Maintain current form with competitive scenario batting. "
        batting_intensity = "Medium"

    if boundary_pct < 10:
        batting_drills += "Boundary Hitting: Dedicated slog sweep and lofted drive practice."
        batting_intensity = "High"

    sessions.append(TrainingSession(
        team=team,
        date=today + timedelta(days=1),
        time=time(9, 0),
        venue="Main Ground - Nets",
        intensity=batting_intensity,
        drills=batting_drills.strip()
    ))

    # SESSION 2: Bowling Focus (Day +2)
    bowling_drills = "[AUTO] "
    if economy > 8:
        bowling_drills += "Economy Control: Yorker drills, slower ball variations, and death bowling practice. "
        bowling_intensity = "High"
    elif wicket_rate > 25:
        bowling_drills += "Wicket Taking: Aggressive field setup practice, bouncers, and wicket-to-wicket bowling. "
        bowling_intensity = "High"
    else:
        bowling_drills += "Bowling Maintenance: Accuracy drills with field placement strategy. "
        bowling_intensity = "Medium"

    sessions.append(TrainingSession(
        team=team,
        date=today + timedelta(days=2),
        time=time(8, 30),
        venue="Main Ground - Nets",
        intensity=bowling_intensity,
        drills=bowling_drills.strip()
    ))

    # SESSION 3: Fielding & Fitness (Day +3)
    fielding_drills = "[AUTO] "
    if win_rate < 50:
        fielding_drills += "High Pressure Fielding: Catching under lights, direct hit practice, relay throws. "
        fielding_intensity = "High"
    else:
        fielding_drills += "Agility & Reflexes: Slip catching practice, ground fielding circuits. "
        fielding_intensity = "Medium"
    fielding_drills += "Fitness: Sprint intervals, endurance runs, and core strengthening."

    sessions.append(TrainingSession(
        team=team,
        date=today + timedelta(days=3),
        time=time(7, 0),
        venue="Training Complex",
        intensity=fielding_intensity,
        drills=fielding_drills.strip()
    ))

    # SESSION 4: Match Simulation (Day +5)
    sim_drills = "[AUTO] "
    if win_rate < 45:
        sim_drills += "Pressure Simulation: Chase targets under match conditions. Practice DLS scenarios. "
        sim_intensity = "High"
    else:
        sim_drills += "Intra-Squad Match: Full competitive match simulation with umpires and scoring. "
        sim_intensity = "Medium"

    sessions.append(TrainingSession(
        team=team,
        date=today + timedelta(days=5),
        time=time(10, 0),
        venue="Main Stadium",
        intensity=sim_intensity,
        drills=sim_drills.strip()
    ))

    # SESSION 5: Recovery & Strategy (Day +6)
    sessions.append(TrainingSession(
        team=team,
        date=today + timedelta(days=6),
        time=time(16, 0),
        venue="Team Hotel / Indoor Facility",
        intensity="Low",
        drills=f"[AUTO] Recovery: Light stretching, yoga, and video analysis of recent performances. "
               f"Strategy: Review opposition data and plan for upcoming fixtures. "
               f"Team win rate: {win_rate}% | Batting SR: {batting_sr} | Economy: {economy}"
    ))

    # Bulk create
    TrainingSession.objects.bulk_create(sessions)

    # Return analysis + created sessions
    serializer = TrainingSessionSerializer(
        TrainingSession.objects.filter(team=team).order_by('date', 'time'),
        many=True
    )

    return Response({
        "analysis": {
            "batting_strike_rate": batting_sr,
            "boundary_percentage": boundary_pct,
            "dot_ball_percentage": dot_pct_batting,
            "bowling_economy": economy,
            "wicket_rate": wicket_rate,
            "win_rate": win_rate,
            "total_matches": total_matches,
        },
        "sessions_generated": 5,
        "sessions": serializer.data
    })

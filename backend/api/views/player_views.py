from rest_framework.decorators import api_view, permission_classes # type: ignore
from rest_framework.permissions import IsAuthenticated, AllowAny # type: ignore
from rest_framework.response import Response # type: ignore
from django.db.models import Q # type: ignore
from api.services.yaml_loader import load_all_matches # type: ignore
from api.models import Delivery, Match, Player, TeamCaptain # type: ignore


# ==========================================================
# ✅ GET ALL PLAYERS FROM YAML FILES
# ==========================================================
@api_view(['GET'])
# @permission_classes([AllowAny])
def get_players(request):
    matches = load_all_matches()
    players = set()

    for match in matches:
        info = match.get("info", {})
        player_dict = info.get("players", {})

        for team_players in player_dict.values():
            for player in team_players:
                players.add(player)

    return Response({
        "total_players": len(players),
        "players": sorted(list(players))
    })


from django.db.models import Sum, Count, Case, When, IntegerField # type: ignore
from django.shortcuts import get_object_or_404 # type: ignore
from django.utils.text import slugify # type: ignore
from django.core.cache import cache # type: ignore
from rest_framework.decorators import api_view, permission_classes # type: ignore
from rest_framework.permissions import AllowAny # type: ignore
from rest_framework.response import Response # type: ignore
from api.models import Player, Delivery # type: ignore

# ==========================================================
# ✅ PLAYER PROFILE (FAST)
# ==========================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def player_profile(request, player_name):
    # Enforce isolation: Players can only view their own stats
    if hasattr(request.user, 'profile') and request.user.profile.role == 'player':
        if request.user.username.lower() != player_name.lower():
            return Response({"error": "Unauthorized. Players can only view their own profile."}, status=403)

    player = get_object_or_404(Player.objects.select_related('team').only('id', 'name', 'team__name'), name__iexact=player_name)
    
    # Get captaincy seasons
    captain_seasons = list(player.captaincies.values_list('season', flat=True))
    # Check if they are captain in the most recent season (2024 or 2025)
    is_captain = any(s >= 2024 for s in captain_seasons)
    
    return Response({
        "id": player.id,
        "full_name": player.name,
        "current_team": player.team.name if player.team else "Unassigned",
        "role": "player",
        "is_captain": is_captain,
        "captain_history": sorted(captain_seasons, reverse=True)
    })

# ==========================================================
# ✅ PLAYER MATCHES (OPTIMIZED)
# ==========================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def player_matches(request, player_name):
    # Enforce isolation: Players can only view their own stats
    if hasattr(request.user, 'profile') and request.user.profile.role == 'player':
        if request.user.username.lower() != player_name.lower():
            return Response({"error": "Unauthorized. Players can only view their own matches."}, status=403)
    # 1. Check Cache first (Slugified key to handle spaces like 'MS Dhoni')
    cache_key = f"matches_{slugify(player_name)}"
    cached_data = cache.get(cache_key)
    if cached_data:
        return Response(cached_data)

    player = get_object_or_404(Player.objects.only('id', 'name'), name__iexact=player_name)

    # 2. Optimized Batting Query
    batting_stats = (
        Delivery.objects
        .filter(batsman=player)
        .select_related('match', 'inning')
        .values(
            "match__match_id", "match__match_date", "match__team1", 
            "match__team2", "match__winner", "inning__batting_team"
        )
        .annotate(
            runs=Sum("runs_batsman"),
            fours=Sum(Case(When(runs_batsman=4, then=1), default=0, output_field=IntegerField())),
            sixes=Sum(Case(When(runs_batsman=6, then=1), default=0, output_field=IntegerField()))
        )
    )

    # 3. Optimized Bowling Query
    bowling_stats = (
        Delivery.objects
        .filter(bowler=player)
        .select_related('match', 'inning')
        .values(
            "match__match_id", "match__match_date", "match__team1", 
            "match__team2", "match__winner", "inning__batting_team"
        )
        .annotate(
            wickets=Sum(
                Case(
                    When(is_wicket=True, dismissal_type__in=[
                        "bowled", "caught", "lbw", "stumped", 
                        "caught and bowled", "hit wicket"
                    ], then=1),
                    default=0, output_field=IntegerField()
                )
            )
        )
    )

    # 4. Merge results using a dictionary for match-level aggregation
    match_map = {}

    for b in batting_stats:
        mid = b["match__match_id"]
        batting_team = b["inning__batting_team"]
        opponent = b["match__team2"] if batting_team == b["match__team1"] else b["match__team1"]
        
        match_map[mid] = {
            "match_id": mid,
            "date": b["match__match_date"],
            "representing": batting_team,
            "opponent": opponent,
            "winner": b["match__winner"],
            "runs": b["runs"] or 0,
            "fours": b["fours"] or 0,
            "sixes": b["sixes"] or 0,
            "wickets": 0
        }

    for b in bowling_stats:
        mid = b["match__match_id"]
        batting_team = b["inning__batting_team"]
        fielding_team = b["match__team2"] if batting_team == b["match__team1"] else b["match__team1"]
        
        if mid in match_map:
            # If already added (batted), just update wickets
            match_map[mid]["wickets"] = b["wickets"] or 0
        else:
            # Only bowled in this match
            match_map[mid] = {
                "match_id": mid,
                "date": b["match__match_date"],
                "representing": fielding_team,
                "opponent": batting_team,
                "winner": b["match__winner"],
                "runs": 0,
                "fours": 0,
                "sixes": 0,
                "wickets": b["wickets"] or 0
            }

    # Sort results by date descending
    matches_list = sorted(match_map.values(), key=lambda x: str(x["date"]), reverse=True)

    response_data = {
        "player": player.name,
        "matches": matches_list
    }

    # Cache the result for 1 hour (Increased cache key version or clear cache to reflect changes)
    cache.delete(cache_key)
    cache.set(cache_key, response_data, 3600)
    return Response(response_data)

# ==========================================================
# ✅ PLAYER TEAM HISTORY
# ==========================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def player_team_history(request, player_name):
    # Enforce isolation
    if hasattr(request.user, 'profile') and request.user.profile.role == 'player':
        if request.user.username.lower() != player_name.lower():
            return Response({"error": "Unauthorized. Players can only view their own history."}, status=403)
    player = get_object_or_404(Player.objects.select_related('team').only('id', 'name', 'team__name'), name__iexact=player_name)
    
    # Analyze batting deliveries to figure out which teams the player represented
    # We group by the match date (year) and batting team
    deliveries = (
        Delivery.objects
        .filter(batsman=player)
        .select_related('match', 'inning')
        .values("match__match_date", "inning__batting_team")
    )
    
    # We could also include bowler, but typically if they didn't bat, their team is the fielding team.
    # To be extremely thorough, we can also check bowling deliveries
    bowling_deliveries = (
        Delivery.objects
        .filter(bowler=player)
        .select_related('match', 'inning')
        .values("match__match_date", "match__team1", "match__team2", "inning__batting_team")
    )

    team_years_map = {}

    for d in deliveries:
        date = d["match__match_date"]
        team = d["inning__batting_team"]
        year = date.year if date else "Other"
        
        if team:
            if team not in team_years_map:
                team_years_map[team] = set()
            team_years_map[team].add(year)
            
    for d in bowling_deliveries:
        date = d["match__match_date"]
        batting_team = d["inning__batting_team"]
        fielding_team = d["match__team2"] if batting_team == d["match__team1"] else d["match__team1"]
        year = date.year if date else "Other"
        
        if fielding_team:
            if fielding_team not in team_years_map:
                team_years_map[fielding_team] = set()
            team_years_map[fielding_team].add(year)

    # Format exactly as the frontend Recharts pie expects: { name: "TeamName", value: Years }
    history_data = [
        {"name": team_name, "value": len(years)}
        for team_name, years in team_years_map.items() 
        if team_name is not None
    ]
    
    # Sort by value descending
    history_data = sorted(history_data, key=lambda x: x["value"], reverse=True)

    previous_teams = [item["name"] for item in history_data if item["name"] != (player.team.name if player.team else "")]
    
    return Response({
        "player": player.name,
        "current_team": player.team.name if player.team else "Unassigned",
        "loyalty_pie": history_data,
        "previous_teams": previous_teams
    })


from api.serializers import DeliverySerializer # type: ignore

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def player_ball_by_ball(request, player_id):
    player = get_object_or_404(Player, id=player_id)
    # Enforce isolation
    if hasattr(request.user, 'profile') and request.user.profile.role == 'player':
        if request.user.username.lower() != player.name.lower():
            return Response({"error": "Unauthorized. Players can only view their own data."}, status=403)
    deliveries = Delivery.objects.filter(
        batsman_id=player_id
    ).order_by("match", "inning", "over_number", "ball_number")

    serializer = DeliverySerializer(deliveries, many=True)
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def bowler_ball_by_ball(request, player_id):
    player = get_object_or_404(Player, id=player_id)
    # Enforce isolation
    if hasattr(request.user, 'profile') and request.user.profile.role == 'player':
        if request.user.username.lower() != player.name.lower():
            return Response({"error": "Unauthorized. Players can only view their own data."}, status=403)
    deliveries = Delivery.objects.filter(
        bowler_id=player_id
    ).order_by("match", "inning", "over_number", "ball_number")

    serializer = DeliverySerializer(deliveries, many=True)
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def player_wickets(request, player_id):
    player = get_object_or_404(Player, id=player_id)
    # Enforce isolation
    if hasattr(request.user, 'profile') and request.user.profile.role == 'player':
        if request.user.username.lower() != player.name.lower():
            return Response({"error": "Unauthorized. Players can only view their own data."}, status=403)
    count = Delivery.objects.filter(
        bowler_id=player_id,
        is_wicket=True
    ).count()

    return Response({"total_wickets": count})

import os
import yaml # type: ignore
from rest_framework.views import APIView # type: ignore
from rest_framework.response import Response # type: ignore

# ==========================================================
# ✅ PLAYER PHASE ANALYSIS (Powerplay, Middle, Death)
# ==========================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def player_phase_analysis(request, player_name):
    # Enforce isolation
    if hasattr(request.user, 'profile') and request.user.profile.role == 'player':
        if request.user.username.lower() != player_name.lower():
            return Response({"error": "Unauthorized. Players can only view their own analysis."}, status=403)
    
    player = get_object_or_404(Player, name__iexact=player_name)
    year = request.GET.get("year")
    
    # --- BATTING PHASE ANALYSIS ---
    batting_deliveries = Delivery.objects.filter(batsman=player)
    if year:
        batting_deliveries = batting_deliveries.filter(match__match_date__gte=f"{year}-01-01")
    
    batting_phases = {
        "Powerplay": batting_deliveries.filter(over_number__lt=6),
        "Middle Overs": batting_deliveries.filter(over_number__gte=6, over_number__lt=15),
        "Death Overs": batting_deliveries.filter(over_number__gte=15)
    }
    
    batting_stats_list = []
    
    for phase_name, queryset in batting_phases.items():
        stats = queryset.aggregate(
            total_runs=Sum('runs_batsman'),
            total_balls=Count('id'),
            boundaries=Sum(
                Case(
                    When(runs_batsman__in=[4, 6], then=1),
                    default=0,
                    output_field=IntegerField()
                )
            ),
            dismissals=Count(
                Case(
                    When(is_wicket=True, player_out=player, then=1),
                    output_field=IntegerField()
                )
            )
        )
        
        runs = stats['total_runs'] or 0
        balls = stats['total_balls'] or 0
        boundaries = stats['boundaries'] or 0
        dismissals = stats['dismissals'] or 0
        
        strike_rate = round((runs / balls) * 100, 2) if balls > 0 else 0
        average = round((runs / dismissals), 2) if dismissals > 0 else runs
        boundary_percentage = round((boundaries / balls) * 100, 2) if balls > 0 else 0
        
        batting_stats_list.append({
            "phase": phase_name,
            "runs": runs,
            "balls": balls,
            "strike_rate": strike_rate,
            "average": average,
            "boundary_percentage": boundary_percentage,
            "dismissals": dismissals
        })
        
    # --- BOWLING PHASE ANALYSIS ---
    bowling_deliveries = Delivery.objects.filter(bowler=player)
    if year:
        bowling_deliveries = bowling_deliveries.filter(match__match_date__gte=f"{year}-01-01")
    
    bowling_phases = {
        "Powerplay": bowling_deliveries.filter(over_number__lt=6),
        "Middle Overs": bowling_deliveries.filter(over_number__gte=6, over_number__lt=15),
        "Death Overs": bowling_deliveries.filter(over_number__gte=15)
    }
    
    bowling_stats_list = []
    
    for phase_name, queryset in bowling_phases.items():
        stats = queryset.aggregate(
            total_runs=Sum('runs_total'),
            total_balls=Count('id'),
            wickets=Sum(
                Case(
                    When(is_wicket=True, dismissal_type__in=[
                        "bowled", "caught", "lbw", "stumped", 
                        "caught and bowled", "hit wicket"
                    ], then=1),
                    default=0, output_field=IntegerField()
                )
            )
        )
        
        runs = stats['total_runs'] or 0
        balls = stats['total_balls'] or 0
        wickets = stats['wickets'] or 0
        
        overs = balls / 6
        economy_rate = round((runs / overs), 2) if overs > 0 else 0
        strike_rate = round((balls / wickets), 2) if wickets > 0 else 0
        
        bowling_stats_list.append({
            "phase": phase_name,
            "runs_conceded": runs,
            "balls_bowled": balls,
            "wickets": wickets,
            "economy_rate": economy_rate,
            "strike_rate": strike_rate
        })
        
    # --- SR VS BOWLING STYLE ---
    sr_by_style = (
        Delivery.objects
        .filter(batsman=player)
        .exclude(bowler__bowling_style__isnull=True)
        .exclude(bowler__bowling_style="")
        .exclude(bowler__bowling_style="N/A")
        .values("bowler__bowling_style")
        .annotate(
            total_runs=Sum("runs_batsman"),
            total_balls=Count("id"),
            dismissals=Count(
                Case(
                    When(is_wicket=True, player_out=player, then=1),
                    output_field=IntegerField()
                )
            )
        ).order_by("-total_balls")
    )
    
    style_stats = []
    for s in sr_by_style:
        style = s["bowler__bowling_style"]
        runs = s["total_runs"] or 0
        balls = s["total_balls"] or 0
        dismissals = s["dismissals"] or 0
        strike_rate = round((runs / balls) * 100, 2) if balls > 0 else 0
        
        style_stats.append({
            "bowling_style": style,
            "runs": runs,
            "balls": balls,
            "strike_rate": strike_rate,
            "dismissals": dismissals
        })
        
    return Response({
        "player": player.name,
        "batting_phase_analysis": batting_stats_list,
        "bowling_phase_analysis": bowling_stats_list,
        "sr_by_bowling_style": style_stats
    })

class YAMLPlayerListView(APIView):
    def get(self, request):
        target_year = request.query_params.get('season')  # e.g., "2008"
        target_team = request.query_params.get('team')    # e.g., "Kolkata Knight Riders"
        
        yaml_folder = './data/ipl_yaml/' # Path to your YAML files
        player_list = []
        seen_players = set()

        if not os.path.exists(yaml_folder):
            return Response({"error": "YAML folder not found"}, status=404)

        for filename in os.listdir(yaml_folder):
            if filename.endswith(".yaml"):
                with open(os.path.join(yaml_folder, filename), 'r') as f:
                    data = yaml.safe_load(f)
                    
                    # 1. Filter by Year
                    match_date = str(data['info']['dates'][0])
                    if target_year and target_year not in match_date:
                        continue
                    
                    # 2. Extract Players
                    teams_in_match = data['info']['players']
                    for team_name, players in teams_in_match.items():
                        # Filter by Team if selected
                        if target_team and team_name != target_team:
                            continue
                            
                        for p_name in players:
                            if p_name not in seen_players:
                                player_list.append({
                                    "name": p_name,
                                    "team": team_name,
                                    "year": str(match_date)[:4] # type: ignore
                                })
                                seen_players.add(p_name)

        return Response(player_list)